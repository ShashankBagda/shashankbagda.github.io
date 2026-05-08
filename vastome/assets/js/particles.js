/**
 * Vastome Particle System
 * Canvas-based floating particles for the hero section.
 * Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  var PARTICLE_COUNT = 80;
  var LINE_DISTANCE  = 120;
  var COLORS = ['255,255,255', '239,193,79']; // white, gold

  var canvas, ctx, particles, animId, rafRunning;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticle(w, h) {
    return {
      x:     random(0, w),
      y:     random(0, h),
      r:     random(1, 2),
      vx:    reducedMotion ? 0 : random(-0.18, 0.18),
      vy:    reducedMotion ? 0 : random(-0.12, 0.12),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: random(0.08, 0.28),
    };
  }

  function resize() {
    var wrap = canvas.parentElement;
    canvas.width  = wrap ? wrap.offsetWidth  : window.innerWidth;
    canvas.height = wrap ? wrap.offsetHeight : window.innerHeight;

    // Redistribute particles across new dimensions
    if (particles) {
      particles.forEach(function (p) {
        p.x = random(0, canvas.width);
        p.y = random(0, canvas.height);
      });
    }
  }

  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle(canvas.width, canvas.height));
    }
  }

  function drawLines() {
    var w = canvas.width;
    var h = canvas.height;

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < LINE_DISTANCE) {
          var lineAlpha = (1 - dist / LINE_DISTANCE) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(255,255,255,' + lineAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!reducedMotion) {
      drawLines();
    }

    particles.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
      ctx.fill();
    });
  }

  function update() {
    var w = canvas.width;
    var h = canvas.height;

    particles.forEach(function (p) {
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges with slight margin
      if (p.x < -10)    p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      if (p.y < -10)    p.y = h + 10;
      if (p.y > h + 10) p.y = -10;
    });
  }

  function loop() {
    if (!rafRunning) return;
    update();
    draw();
    animId = requestAnimationFrame(loop);
  }

  function start() {
    rafRunning = true;
    loop();
  }

  function stop() {
    rafRunning = false;
    if (animId) cancelAnimationFrame(animId);
  }

  function init() {
    var hero = document.querySelector('.hero-canvas');
    if (!hero) return;

    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';

    hero.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resize();
    initParticles();

    if (reducedMotion) {
      // Draw a single static frame
      draw();
    } else {
      start();

      // Pause animation when tab is hidden to save CPU
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          stop();
        } else {
          start();
        }
      });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        stop();
        resize();
        if (!reducedMotion) {
          start();
        } else {
          draw();
        }
      }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
