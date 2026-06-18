// app.js — Coolify Dashboard frontend logic
'use strict';

// ─── State ────────────────────────────────────────────
let allProjects = [];
let activeFilter = 'all';
let pendingDelete = null;

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initParticles('particles');
  setupNavScroll();
  setupUploadZone();
  setupSearch();
  setupFilters();
  setupModal();
  setupLogout();
  loadProjects();
});

// ─── Navbar scroll effect ─────────────────────────────
function setupNavScroll() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ─── Load & Render Projects ───────────────────────────
async function loadProjects() {
  showLoading(true);
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error('Failed to fetch');
    allProjects = await res.json();
    renderProjects();
    updateStats();
  } catch (err) {
    showToast('Could not load projects.', 'error');
  } finally {
    showLoading(false);
  }
}

function renderProjects() {
  const grid      = document.getElementById('project-grid');
  const empty     = document.getElementById('empty-state');
  const searchVal = document.getElementById('search-input').value.toLowerCase();

  const filtered = allProjects.filter(p => {
    const matchType = activeFilter === 'all' || p.type === activeFilter;
    const matchName = p.name.toLowerCase().includes(searchVal);
    return matchType && matchName;
  });

  grid.innerHTML = '';

  if (filtered.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  filtered.forEach((p, i) => {
    const card = createCard(p, i);
    grid.appendChild(card);
  });
}

function createCard(p, index) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.style.animationDelay = `${index * 0.06}s`;

  const iconSvg = p.type === 'php'
    ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
    : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

  const date = p.uploadedAt
    ? new Date(p.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Unknown date';

  const size = formatBytes(p.size);

  card.innerHTML = `
    <div class="card-header">
      <div class="card-icon card-icon-${p.type}">${iconSvg}</div>
      <span class="card-badge badge-${p.type}">${p.type === 'php' ? 'PHP' : 'Static'}</span>
    </div>
    <div class="card-name">${escapeHtml(p.name)}</div>
    <div class="card-meta">
      <span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${date}
      </span>
      <span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
        ${size}
      </span>
    </div>
    <div class="card-actions">
      <a href="${p.url}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open
      </a>
      ${p.type === 'php' ? `
      <button class="btn btn-ghost btn-sm" onclick="restartPhp('${escapeHtml(p.name)}')" title="Restart PHP server">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Restart
      </button>` : ''}
      <button class="btn btn-danger btn-sm" onclick="confirmDelete('${escapeHtml(p.name)}')" title="Delete project">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  `;
  return card;
}

// ─── Stats ────────────────────────────────────────────
function updateStats() {
  document.getElementById('stat-total').textContent = allProjects.length;
  const totalBytes = allProjects.reduce((a, p) => a + (p.size || 0), 0);
  document.getElementById('stat-storage').textContent = formatBytes(totalBytes);
}

// ─── Upload Zone ──────────────────────────────────────
function setupUploadZone() {
  const zone      = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const browseBtn = document.getElementById('browse-btn');
  const navBtn    = document.getElementById('btn-upload-nav');

  browseBtn.addEventListener('click', () => fileInput.click());
  navBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleUpload(fileInput.files[0]);
  });

  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  });
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
}

async function handleUpload(file) {
  if (!file.name.endsWith('.zip')) {
    showToast('Only .zip files are supported.', 'error');
    return;
  }

  const progress  = document.getElementById('upload-progress');
  const bar       = document.getElementById('progress-bar');
  const pct       = document.getElementById('progress-pct');
  const fname     = document.getElementById('progress-filename');

  fname.textContent = file.name;
  bar.style.width = '0%';
  pct.textContent = '0%';
  progress.classList.remove('hidden');

  const formData = new FormData();
  formData.append('file', file);

  try {
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100);
          bar.style.width = p + '%';
          pct.textContent = p + '%';
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(JSON.parse(xhr.responseText)?.error || 'Upload failed'));
      });
      xhr.addEventListener('error', () => reject(new Error('Network error')));
      xhr.send(formData);
    });

    showToast(`Project uploaded successfully!`, 'success');
    await loadProjects();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    progress.classList.add('hidden');
    document.getElementById('file-input').value = '';
  }
}

// ─── Delete ───────────────────────────────────────────
function confirmDelete(name) {
  pendingDelete = name;
  document.getElementById('modal-project-name').textContent = name;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function setupModal() {
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-overlay')) closeModal();
  });
  document.getElementById('modal-confirm').addEventListener('click', async () => {
    if (!pendingDelete) return;
    const name = pendingDelete;
    closeModal();
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showToast(`"${name}" deleted.`, 'info');
      await loadProjects();
    } catch {
      showToast('Could not delete project.', 'error');
    }
  });
}

function closeModal() {
  pendingDelete = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

// ─── Restart PHP ──────────────────────────────────────
async function restartPhp(name) {
  try {
    const res = await fetch(`/api/projects/${encodeURIComponent(name)}/restart`, { method: 'POST' });
    if (!res.ok) throw new Error('Restart failed');
    showToast(`PHP server for "${name}" restarted.`, 'success');
  } catch {
    showToast('Could not restart PHP server.', 'error');
  }
}

// ─── Search ───────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('search-input');
  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(renderProjects, 200);
  });
}

// ─── Filter tabs ──────────────────────────────────────
function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderProjects();
    });
  });
}

// ─── Logout ───────────────────────────────────────────
function setupLogout() {
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  });
}

// ─── Toast ───────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const icons = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    info:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// ─── Loading state ────────────────────────────────────
function showLoading(show) {
  document.getElementById('loading-state').classList.toggle('hidden', !show);
  document.getElementById('project-grid').classList.toggle('hidden', show);
}

// ─── Helpers ─────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// Expose for inline onclick handlers
window.confirmDelete = confirmDelete;
window.restartPhp    = restartPhp;
