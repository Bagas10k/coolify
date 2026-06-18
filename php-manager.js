// php-manager.js — Manages PHP built-in server processes per project
'use strict';

const { spawn } = require('child_process');
const path = require('path');

const PHP_PORT_START = parseInt(process.env.PHP_PORT_START || '4000', 10);

// Map: projectName → { process, port }
const running = new Map();
let nextPort = PHP_PORT_START;

/**
 * Start a PHP built-in server for a project directory.
 * Returns the port the server is listening on.
 * If already running, returns the existing port.
 */
function startPhp(projectName, projectsDir) {
  if (running.has(projectName)) {
    return running.get(projectName).port;
  }

  const port = nextPort++;
  const docRoot = path.join(projectsDir, projectName);

  const proc = spawn('php', ['-S', `127.0.0.1:${port}`, '-t', docRoot], {
    detached: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  proc.stdout.on('data', (d) => process.stdout.write(`[PHP:${projectName}] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[PHP:${projectName}] ${d}`));

  proc.on('exit', (code) => {
    console.log(`[PHP:${projectName}] exited with code ${code}`);
    running.delete(projectName);
  });

  running.set(projectName, { process: proc, port });
  console.log(`[PHP:${projectName}] started on port ${port}`);
  return port;
}

/**
 * Stop and remove the PHP server for a project.
 */
function stopPhp(projectName) {
  if (!running.has(projectName)) return false;
  const { process: proc } = running.get(projectName);
  try {
    proc.kill('SIGTERM');
  } catch (_) {}
  running.delete(projectName);
  return true;
}

/**
 * Get port for a running project (or null if not running).
 */
function getPort(projectName) {
  return running.has(projectName) ? running.get(projectName).port : null;
}

/**
 * Stop all running PHP processes (called on server shutdown).
 */
function stopAll() {
  for (const [name] of running) stopPhp(name);
}

module.exports = { startPhp, stopPhp, getPort, stopAll };
