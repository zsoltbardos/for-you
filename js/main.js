(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Gentle page fade-in ── */
  window.addEventListener('load', () => document.body.classList.add('loaded'));
  setTimeout(() => document.body.classList.add('loaded'), 700);

  /* ── Scroll progress (0..1) ── */
  let progress = 0;
  function computeProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
  }

  /* ── Reveal on scroll, with per-group stagger ── */
  const revealEls = document.querySelectorAll('.reveal');
  const groupIndex = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const i = groupIndex.get(parent) || 0;
    el.style.setProperty('--reveal-delay', (i * 0.18) + 's');
    groupIndex.set(parent, i + 1);
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach((el) => io.observe(el));

  /* ── Progress bar + warmth overlay ── */
  const bar = document.querySelector('.progress__bar');
  const warmth = document.querySelector('.warmth');
  function paintScroll() {
    if (bar) bar.style.width = (progress * 100) + '%';
    if (warmth) warmth.style.opacity = Math.pow(progress, 1.3).toFixed(3);
  }

  /* ── Canvas field: stars + two converging lights ── */
  const canvas = document.getElementById('field');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  let stars = [];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initStars();
  }

  function initStars() {
    const count = Math.min(Math.floor((w * h) / 7000), 130);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.3,
      base: Math.random() * 0.4 + 0.08,
      speed: Math.random() * 0.0006 + 0.0002,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  // Position of each light, interpolated by eased scroll progress.
  function orbPositions(p) {
    const cx = 0.5, cy = 0.56;
    const ax = cx - lerp(0.30, 0.052, p);
    const ay = cy - lerp(0.27, 0.010, p);
    const bx = cx + lerp(0.30, 0.052, p);
    const by = cy + lerp(0.23, 0.010, p);
    return {
      a: { x: ax * w, y: ay * h },
      b: { x: bx * w, y: by * h },
    };
  }

  function blend(c1, c2, t) {
    return [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t)),
    ];
  }

  function drawGlow(x, y, radius, rgb, alpha) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0,   `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`);
    g.addColorStop(0.4, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha * 0.35})`);
    g.addColorStop(1,   `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const A_COOL = [150, 185, 255], A_WARM = [255, 198, 170];
  const B_COOL = [196, 180, 255], B_WARM = [255, 178, 178];

  function render(time) {
    ctx.clearRect(0, 0, w, h);
    const p = progress;
    const ep = easeInOut(p);
    const warmT = Math.pow(p, 1.2);

    // Stars — drift up a touch and warm slightly as we descend.
    const sr = lerp(235, 255, warmT);
    const sg = lerp(238, 205, warmT);
    const sb = lerp(255, 180, warmT);
    for (const s of stars) {
      const tw = 0.5 + 0.5 * Math.sin(time * s.speed * 1000 + s.phase);
      const a = s.base * tw * (1 - warmT * 0.25);
      const sy = (((s.y - window.scrollY * 0.03) % h) + h) % h;
      ctx.beginPath();
      ctx.arc(s.x, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${sr|0},${sg|0},${sb|0},${a})`;
      ctx.fill();
    }

    // Two lights converging.
    const { a, b } = orbPositions(ep);
    const minSide = Math.min(w, h);
    const coreR = lerp(minSide * 0.010, minSide * 0.018, ep);
    const glowR = coreR * (8 + ep * 4);
    const pulse = 0.85 + 0.15 * Math.sin(time * 0.0011);

    const aRGB = blend(A_COOL, A_WARM, warmT);
    const bRGB = blend(B_COOL, B_WARM, warmT);

    // Filament between them as they near each other.
    if (ep > 0.55) {
      const f = Math.min((ep - 0.55) / 0.45, 1);
      const midx = (a.x + b.x) / 2;
      const midy = (a.y + b.y) / 2 + lerp(40, 4, f);
      ctx.save();
      ctx.lineWidth = lerp(0.6, 1.6, f);
      ctx.strokeStyle = `rgba(255, 214, 170, ${0.5 * f})`;
      ctx.shadowColor = 'rgba(255, 214, 170, 0.6)';
      ctx.shadowBlur = 14 * f;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(midx, midy, b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    drawGlow(a.x, a.y, glowR, aRGB, 0.5 * pulse);
    drawGlow(b.x, b.y, glowR, bRGB, 0.5 * pulse);

    // Bright cores.
    ctx.beginPath();
    ctx.arc(a.x, a.y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${aRGB[0]},${aRGB[1]},${aRGB[2]},0.95)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(b.x, b.y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bRGB[0]},${bRGB[1]},${bRGB[2]},0.95)`;
    ctx.fill();

    requestAnimationFrame(render);
  }

  function renderStatic() {
    // Single frame near the end-state for reduced motion.
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,235,255,${s.base})`;
      ctx.fill();
    }
    const { a, b } = orbPositions(0.5);
    const minSide = Math.min(w, h);
    drawGlow(a.x, a.y, minSide * 0.1, [200, 200, 255], 0.4);
    drawGlow(b.x, b.y, minSide * 0.1, [255, 200, 210], 0.4);
  }

  /* ── Scroll wiring ── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        computeProgress();
        paintScroll();
        ticking = false;
      });
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    resize();
    if (reduceMotion) renderStatic();
  });

  computeProgress();
  paintScroll();
  resize();

  if (reduceMotion) {
    renderStatic();
  } else {
    requestAnimationFrame(render);
  }
})();
