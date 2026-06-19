// auth.js — Session-based authentication middleware
'use strict';

const USERNAME = process.env.DASHBOARD_USER || 'admin';
const PASSWORD = process.env.DASHBOARD_PASS || 'changeme123';

/**
 * Middleware: require authenticated session.
 * API routes get JSON 401, page routes get redirect to /login.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) return next();

  if (req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.redirect('/login');
}

/**
 * Register login/logout routes on the Express app.
 */
function registerAuthRoutes(app) {
  // Login page — served from public/login.html via static middleware,
  // but we need a named route for redirect logic.
  app.get('/login', (req, res) => {
    if (req.session && req.session.authenticated) return res.redirect('/dashboard');
    res.sendFile('index.html', { root: './public' });
  });

  app.post('/api/login', express_json_middleware, (req, res) => {
    const { username, password } = req.body || {};
    if (username === USERNAME && password === PASSWORD) {
      req.session.authenticated = true;
      req.session.user = username;
      return res.json({ ok: true });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });
}

// Tiny helper — express.json() instance used inside auth routes
const express_json_middleware = require('express').json();

module.exports = { requireAuth, registerAuthRoutes };
