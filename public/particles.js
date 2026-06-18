// particles.js — Lightweight canvas particle animation
'use strict';

function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#3b82f6', '#60a5fa', '#22d3ee', '#818cf8', '#93c5fd'];
  const COUNT  = window.innerWidth < 768 ? 40 : 80;

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    return {
      x:     randomBetween(0, W),
      y:     randomBetween(0, H),
      r:     randomBetween(1, 2.8),
      dx:    randomBetween(-0.35, 0.35),
      dy:    randomBetween(-0.35, 0.35),
      alpha: randomBetween(0.15, 0.55),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function drawConnections() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const opacity = (1 - dist / MAX_DIST) * 0.12;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    drawConnections();

    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;

      // Wrap around edges
      if (p.x < -5)  p.x = W + 5;
      if (p.x > W+5) p.x = -5;
      if (p.y < -5)  p.y = H + 5;
      if (p.y > H+5) p.y = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => {
    resize();
    particles = Array.from({ length: COUNT }, createParticle);
  });

  init();
  tick();
}
