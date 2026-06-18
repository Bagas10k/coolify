// server.js — Main Express server for Coolify Dashboard
'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const AdmZip  = require('adm-zip');
const path    = require('path');
const fs      = require('fs');
const http    = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware');

const { requireAuth, registerAuthRoutes } = require('./auth');
const phpManager = require('./php-manager');

// ─── Config ────────────────────────────────────────────────────────────────
const PORT        = parseInt(process.env.PORT || '3000', 10);
const PROJECTS_DIR = path.resolve('./projects');
const UPLOAD_TMP   = path.resolve('./tmp_uploads');

// Ensure directories exist
[PROJECTS_DIR, UPLOAD_TMP].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── App Setup ─────────────────────────────────────────────────────────────
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Auth Routes ───────────────────────────────────────────────────────────
registerAuthRoutes(app);

// ─── Public assets (CSS, JS, images) — no auth needed so login page renders ──
// Only index.html is protected; everything else in /public is safe to expose.
const PUBLIC_DIR = path.resolve('./public');
app.use('/style.css',   express.static(path.join(PUBLIC_DIR, 'style.css')));
app.use('/app.js',      express.static(path.join(PUBLIC_DIR, 'app.js')));
app.use('/particles.js',express.static(path.join(PUBLIC_DIR, 'particles.js')));
app.use('/mascot.png',  express.static(path.join(PUBLIC_DIR, 'mascot.png')));

// ─── Dashboard root — protected ───────────────────────────────────────────
app.get('/', requireAuth, (req, res) => {
  res.sendFile('index.html', { root: PUBLIC_DIR });
});

// ─── Multer Upload ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOAD_TMP,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed'));
    }
  },
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

// ─── Helper: detect project type ───────────────────────────────────────────
function detectType(projectDir) {
  const files = fs.readdirSync(projectDir);
  const hasPhp = files.some(f => f.endsWith('.php'));
  if (hasPhp) return 'php';
  // Check sub-folders too (shallow)
  for (const f of files) {
    const sub = path.join(projectDir, f);
    if (fs.statSync(sub).isDirectory()) {
      const subFiles = fs.readdirSync(sub);
      if (subFiles.some(sf => sf.endsWith('.php'))) return 'php';
    }
  }
  return 'static';
}

// ─── Helper: dir size ──────────────────────────────────────────────────────
function dirSize(dir) {
  let total = 0;
  try {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) total += dirSize(full);
      else total += fs.statSync(full).size;
    }
  } catch (_) {}
  return total;
}

// ─── API: List projects ────────────────────────────────────────────────────
app.get('/api/projects', requireAuth, (req, res) => {
  if (!fs.existsSync(PROJECTS_DIR)) return res.json([]);

  const names = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const projects = names.map(name => {
    const dir = path.join(PROJECTS_DIR, name);
    const metaFile = path.join(dir, '.coolify-meta.json');
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(metaFile, 'utf8')); } catch (_) {}

    return {
      name,
      type: meta.type || detectType(dir),
      uploadedAt: meta.uploadedAt || null,
      size: dirSize(dir),
      url: `/p/${name}/`,
    };
  });

  res.json(projects);
});

// ─── API: Upload project ───────────────────────────────────────────────────
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const originalName = req.body.projectName
    ? req.body.projectName.trim().replace(/[^a-zA-Z0-9_\-]/g, '-')
    : path.basename(req.file.originalname, '.zip').replace(/[^a-zA-Z0-9_\-]/g, '-');

  const projectDir = path.join(PROJECTS_DIR, originalName);

  try {
    // Remove existing project if overwriting
    if (fs.existsSync(projectDir)) {
      phpManager.stopPhp(originalName);
      fs.rmSync(projectDir, { recursive: true, force: true });
    }

    fs.mkdirSync(projectDir, { recursive: true });

    // Extract zip
    const zip = new AdmZip(req.file.path);
    const entries = zip.getEntries();

    // Detect if zip has a single root folder — flatten it
    const topLevels = [...new Set(entries.map(e => e.entryName.split('/')[0]))];
    const singleRoot = topLevels.length === 1 && topLevels[0] !== '';

    zip.extractAllTo(projectDir, true);

    if (singleRoot) {
      const rootFolder = path.join(projectDir, topLevels[0]);
      if (fs.existsSync(rootFolder) && fs.statSync(rootFolder).isDirectory()) {
        const items = fs.readdirSync(rootFolder);
        for (const item of items) {
          fs.renameSync(path.join(rootFolder, item), path.join(projectDir, item));
        }
        fs.rmdirSync(rootFolder);
      }
    }

    // Detect type and write meta
    const type = detectType(projectDir);
    const meta = { type, uploadedAt: new Date().toISOString() };
    fs.writeFileSync(path.join(projectDir, '.coolify-meta.json'), JSON.stringify(meta));

    // Auto-start PHP if needed
    if (type === 'php') phpManager.startPhp(originalName, PROJECTS_DIR);

    // Clean up tmp file
    fs.unlinkSync(req.file.path);

    res.json({ ok: true, name: originalName, type });
  } catch (err) {
    try { fs.unlinkSync(req.file.path); } catch (_) {}
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Delete project ───────────────────────────────────────────────────
app.delete('/api/projects/:name', requireAuth, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-]/g, '');
  const projectDir = path.join(PROJECTS_DIR, name);

  if (!fs.existsSync(projectDir)) return res.status(404).json({ error: 'Project not found' });

  phpManager.stopPhp(name);
  fs.rmSync(projectDir, { recursive: true, force: true });
  res.json({ ok: true });
});

// ─── API: Restart PHP project ──────────────────────────────────────────────
app.post('/api/projects/:name/restart', requireAuth, (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-]/g, '');
  const projectDir = path.join(PROJECTS_DIR, name);
  if (!fs.existsSync(projectDir)) return res.status(404).json({ error: 'Not found' });

  phpManager.stopPhp(name);
  const port = phpManager.startPhp(name, PROJECTS_DIR);
  res.json({ ok: true, port });
});

// ─── Serve Projects ────────────────────────────────────────────────────────
app.use('/p/:projectName', requireAuth, (req, res, next) => {
  const name = req.params.projectName;
  const projectDir = path.join(PROJECTS_DIR, name);

  if (!fs.existsSync(projectDir)) {
    return res.status(404).send('Project not found');
  }

  const metaFile = path.join(projectDir, '.coolify-meta.json');
  let type = 'static';
  try { type = JSON.parse(fs.readFileSync(metaFile, 'utf8')).type; } catch (_) {}

  if (type === 'php') {
    // Ensure PHP process is running
    let port = phpManager.getPort(name);
    if (!port) port = phpManager.startPhp(name, PROJECTS_DIR);

    // Give PHP a moment to start, then proxy
    const proxyPath = req.originalUrl.replace(`/p/${name}`, '') || '/';
    const options = {
      target: `http://127.0.0.1:${port}`,
      changeOrigin: true,
      pathRewrite: { [`^/p/${name}`]: '' },
      on: {
        error: (err, req, res) => {
          res.status(502).send('PHP server starting, please refresh...');
        }
      }
    };
    return createProxyMiddleware(options)(req, res, next);
  }

  // Static project
  express.static(projectDir)(req, res, next);
});

// Rewrite /p/:name without trailing slash
app.use('/p/:projectName', requireAuth, (req, res, next) => {
  express.static(path.join(PROJECTS_DIR, req.params.projectName))(req, res, next);
});

// ─── Start server ──────────────────────────────────────────────────────────
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`\n🚀 Coolify Dashboard running at http://localhost:${PORT}`);
  console.log(`   Username: ${process.env.DASHBOARD_USER}`);
  console.log(`   Projects: ${PROJECTS_DIR}\n`);
});

// Auto-start PHP for existing PHP projects on boot
fs.readdirSync(PROJECTS_DIR).forEach(name => {
  const dir = path.join(PROJECTS_DIR, name);
  if (!fs.statSync(dir).isDirectory()) return;
  const metaFile = path.join(dir, '.coolify-meta.json');
  try {
    const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
    if (meta.type === 'php') phpManager.startPhp(name, PROJECTS_DIR);
  } catch (_) {}
});

// Graceful shutdown
process.on('SIGTERM', () => { phpManager.stopAll(); server.close(); });
process.on('SIGINT',  () => { phpManager.stopAll(); server.close(); process.exit(0); });
