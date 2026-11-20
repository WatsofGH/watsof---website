/*
  Hero wiring: input, render loop, autoplay, reduced motion, fallback.
  Paint lives in strokes.js, the WebGL scene in scene.js.
*/
import { createScene } from './scene.js';
import { Strokes, DRY_MS } from './strokes.js';

const PAPER_URL = '/img/watercolour.webp';
const GRID = 112;                  // ambient survey marks, CSS px
const HOVER_START_SPEED = 0.25;    // px/ms before a hover stroke starts
const STROKE_MAX_LENGTH = 900;     // px, then a new stroke begins
const STROKE_PAUSE_END = 180;      // ms without movement ends a stroke
const GHOST_FIRST = 900;           // ms after start
const GHOST_EVERY = 6500;          // ms between autoplay strokes while idle
const PARAMS = new URLSearchParams(location.search);
const DEBUG = PARAMS.has('debug');                 // ?debug shows frame time
const START_QUALITY = parseFloat(PARAMS.get('q')) || 0.75; // ?q=0.4 for testing

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Small seeded random, so the reduced-motion still frame is always the same */
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/* A brush path that reads like someone sketching a ridge line */
function ghostPath(w, h, rand, { mobile }) {
  const n = 56;
  const dt = 16;
  const length = mobile ? w * 0.72 : Math.min(560, w * 0.38);
  const step = length / n;
  const dir = rand() < 0.5 ? 1 : -1;
  let x = mobile ? (dir > 0 ? w * 0.12 : w * 0.88) : w * (dir > 0 ? 0.5 + rand() * 0.1 : 0.88 - rand() * 0.06);
  let y = mobile ? h * (0.5 + rand() * 0.08) : h * (0.48 + rand() * 0.12);
  const yMin = h * (mobile ? 0.44 : 0.4);
  const yMax = h * (mobile ? 0.62 : 0.64);
  let a = (rand() - 0.5) * 0.5;
  const phase = rand() * 6.28;
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x, y, dt: i * dt * (0.8 + 0.4 * Math.sin(i * 0.2)) });
    a += Math.sin(i * 0.21 + phase) * 0.09;
    a = Math.max(-0.5, Math.min(0.5, a));          // stay roughly horizontal, like a ridge line
    if ((y < yMin && a < 0) || (y > yMax && a > 0)) a *= -0.6;
    x += Math.cos(a) * step * dir;
    y += Math.sin(a) * step;
  }
  return pts;
}

export function initHero(hero) {
  const scene = hero.querySelector('.hero__scene');
  const paintCanvas = hero.querySelector('.hero__paint');
  const measure = hero.querySelector('.hero__measure');
  const mctx = measure.getContext('2d');
  const out = {
    strokes: hero.querySelector('[data-readout="strokes"]'),
    ratio: hero.querySelector('[data-readout="ratio"]'),
    clock: hero.querySelector('[data-readout="clock"]'),
  };
  const hint = hero.querySelector('.hero__hint');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (coarse && hint) hint.textContent = hint.dataset.hintTouch;

  const colors = {
    ink: cssVar('--ink'),
    fog: cssVar('--fog-100'),
    accent: cssVar('--rust'),
    muted: cssVar('--slate-700'),
    mono: '"IBM Plex Mono", ui-monospace, monospace',
  };

  const strokes = new Strokes();
  if (DEBUG) window.__strokes = strokes; // inspect strokes in the console with ?debug
  let gl = null;
  try {
    gl = createScene(paintCanvas, { paperUrl: PAPER_URL, wetCanvas: strokes.texture });
  } catch (err) {
    console.warn('[hero] WebGL unavailable, using the still image.', err);
  }

  /* --- state --------------------------------------------------------- */
  let W = 0, H = 0, dpr = 1, quality = START_QUALITY, marginX = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -1, py: -1, inside: false, lastMove: 0 };
  let lastPointer = null;
  let ghost = null;
  let lastUserPaint = -Infinity;
  let nextGhostAt = performance.now() + GHOST_FIRST;
  let visible = true;
  let running = false;
  let staticMode = reduceMotion.matches || !gl;
  const frameTimes = [];
  const t0 = performance.now();

  /* --- sizing -------------------------------------------------------- */
  function resize() {
    const r = scene.getBoundingClientRect();
    W = r.width; H = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    marginX = parseFloat(getComputedStyle(hero).paddingLeft) || 0;
    measure.width = Math.round(W * dpr);
    measure.height = Math.round(H * dpr);
    mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    strokes.resize(W, H);
    if (gl) gl.resize(W, H, Math.min(dpr, 1.5) * quality);
    if (staticMode) drawStill();
  }

  /* --- readouts ------------------------------------------------------ */
  let shownCount = -1, shownRatio = '';
  function updateReadout() {
    const done = strokes.list.filter((s) => s.simple).length ? strokes.count - (strokes.drawing ? 1 : 0) : 0;
    if (done !== shownCount && out.strokes) { out.strokes.textContent = String(done); shownCount = done; }
    const ratio = strokes.totalSamples ? `${strokes.totalSamples} → ${strokes.totalVertices}` : '–';
    if (ratio !== shownRatio && out.ratio) { out.ratio.textContent = ratio; shownRatio = ratio; }
  }
  if (out.clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: out.clock.dataset.tz });
    const tick = () => { out.clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 15000);
  }

  /* --- overlay ------------------------------------------------------- */
  function drawSurveyMarks() {
    mctx.lineWidth = 1;
    const startX = marginX + 0.5;
    for (let y = GRID * 1.5; y < H - 8; y += GRID) {
      for (let x = startX; x < W - 8; x += GRID) {
        let a = 0.16;
        if (mouse.inside) {
          const d = Math.hypot(x - mouse.px, y - mouse.py);
          a += 0.45 * Math.max(0, 1 - d / 170);
        }
        mctx.strokeStyle = `rgba(61,54,45,${a.toFixed(3)})`;
        const yy = Math.round(y) + 0.5;
        mctx.beginPath();
        mctx.moveTo(x - 4, yy); mctx.lineTo(x + 4, yy);
        mctx.moveTo(x, yy - 4); mctx.lineTo(x, yy + 4);
        mctx.stroke();
      }
    }
  }

  function drawCursorReadout() {
    if (!mouse.inside || coarse || strokes.drawing) return; // stay out of the way while painting
    const label = `${(mouse.px / W).toFixed(3)}  ${(mouse.py / H).toFixed(3)}`;
    mctx.font = `400 10.5px ${colors.mono}`;
    mctx.fillStyle = colors.muted;
    mctx.fillText(label, mouse.px + 14, mouse.py + 22);
  }

  function drawOverlay(now) {
    mctx.clearRect(0, 0, W, H);
    drawSurveyMarks();
    if (!gl) strokes.drawFlat(mctx, 'rgba(56,76,98,0.32)'); // no WebGL: plain wash
    strokes.drawOverlay(mctx, now, colors);
    drawCursorReadout();
  }

  /* --- input --------------------------------------------------------- */
  function local(e) {
    const r = scene.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function stopGhost(now) {
    if (ghost) { strokes.end(now); ghost = null; }
  }

  hero.addEventListener('pointermove', (e) => {
    if (staticMode) return;
    // On a busy frame the browser merges moves; replay them all for a smooth stroke.
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ce of events.length ? events : [e]) onMove(ce, e);
    kick();
  }, { passive: true });

  function onMove(e, parent) {
    const now = performance.now() - Math.max(0, parent.timeStamp - e.timeStamp);
    const { x, y } = local(e);
    mouse.px = x; mouse.py = y; mouse.inside = true; mouse.lastMove = now;
    mouse.tx = (x / W) * 2 - 1;
    mouse.ty = -((y / H) * 2 - 1);

    const isTouch = e.pointerType !== 'mouse';
    if (isTouch && !e.pressure && e.buttons === 0) return;

    if (lastPointer) {
      const speed = Math.hypot(x - lastPointer.x, y - lastPointer.y) / Math.max(1, now - lastPointer.t);
      if (!strokes.drawing || ghost) {
        if (speed > HOVER_START_SPEED || isTouch) {
          stopGhost(now);
          strokes.begin(x, y, now, { pressed: e.buttons > 0 });
          lastUserPaint = now;
        }
      } else {
        strokes.extend(x, y, now);
        lastUserPaint = now;
        if (strokes.lengthOfCurrent() > STROKE_MAX_LENGTH) {
          strokes.end(now);
          strokes.begin(x, y, now, { pressed: e.buttons > 0 });
        }
      }
    }
    lastPointer = { x, y, t: now, pressed: e.buttons > 0 };
  }

  hero.addEventListener('pointerdown', (e) => {
    if (staticMode) return;
    const now = performance.now();
    const { x, y } = local(e);
    stopGhost(now);
    strokes.begin(x, y, now, { pressed: true });
    lastPointer = { x, y, t: now, pressed: true };
    lastUserPaint = now;
    kick();
  }, { passive: true });

  const endUser = () => {
    if (!ghost) strokes.end(performance.now());
    lastPointer = null;
  };
  hero.addEventListener('pointerup', endUser, { passive: true });
  hero.addEventListener('pointercancel', endUser, { passive: true });
  hero.addEventListener('pointerleave', () => { endUser(); mouse.inside = false; }, { passive: true });

  /* --- autoplay ------------------------------------------------------ */
  function startGhost(now, seed) {
    const rand = rng(seed ?? Math.floor(Math.random() * 1e9));
    const pts = ghostPath(W, H, rand, { mobile: W < 640 });
    ghost = { pts, i: 0, t0: now };
    strokes.begin(pts[0].x, pts[0].y, now);
  }

  function stepGhost(now) {
    if (!ghost) return;
    const el = now - ghost.t0;
    while (ghost.i < ghost.pts.length && ghost.pts[ghost.i].dt <= el) {
      const p = ghost.pts[ghost.i++];
      strokes.extend(p.x, p.y, ghost.t0 + p.dt);
    }
    if (ghost.i >= ghost.pts.length) {
      strokes.end(now);
      ghost = null;
    }
  }

  /* --- loop ---------------------------------------------------------- */
  function frame(now) {
    if (!running) return;
    const dtStart = performance.now();

    // end hover strokes when the hand pauses
    if (strokes.drawing && !ghost && now - mouse.lastMove > STROKE_PAUSE_END && lastPointer && !lastPointer.pressed) {
      strokes.end(now);
    }

    if (!ghost && now > nextGhostAt && now - lastUserPaint > 5000 && !strokes.drawing) {
      startGhost(now);
      nextGhostAt = now + GHOST_EVERY;
    }
    stepGhost(now);

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    if (gl) {
      if (strokes.update(now)) gl.uploadWet();
      const r = hero.getBoundingClientRect();
      const scroll = Math.min(1, Math.max(0, -r.top / r.height));
      gl.render({ time: (now - t0) / 1000, mouseX: mouse.x, mouseY: mouse.y, scroll });
    } else {
      strokes.update(now);
    }
    drawOverlay(now);
    updateReadout();
    adapt(performance.now() - dtStart, now);

    requestAnimationFrame(frame);
  }

  /* Lower the shader resolution if frames take too long */
  let lastFrameAt = 0;
  function adapt(_, now) {
    if (lastFrameAt) frameTimes.push(now - lastFrameAt);
    lastFrameAt = now;
    if (frameTimes.length >= 90) {
      frameTimes.sort((a, b) => a - b);
      const median = frameTimes[45];
      frameTimes.length = 0;
      if (DEBUG && hint) hint.textContent = `frame ${median.toFixed(1)} ms · shader scale ${(Math.min(dpr, 1.5) * quality).toFixed(2)}`;
      if (median > 20 && quality > 0.4 && gl && !PARAMS.has('q')) {
        quality = Math.max(0.4, quality * 0.8);
        gl.resize(W, H, Math.min(dpr, 1.5) * quality);
      }
    }
  }

  function kick() {
    if (!running && visible && !staticMode && !document.hidden) {
      running = true;
      lastFrameAt = 0;
      requestAnimationFrame(frame);
    }
  }
  function halt() {
    running = false;
  }

  /* --- reduced motion: one still frame ------------------------------- */
  function drawStill() {
    strokes.list = [];
    strokes.count = 0;
    strokes.totalSamples = strokes.totalVertices = 0;
    strokes.stainCtx.clearRect(0, 0, strokes.stain.width, strokes.stain.height);
    strokes.stainAliveUntil = 0;
    const pts = ghostPath(W, H, rng(7), { mobile: W < 640 });
    const base = 0;
    strokes.begin(pts[0].x, pts[0].y, base);
    for (const p of pts) strokes.extend(p.x, p.y, base + p.dt);
    const end = base + pts[pts.length - 1].dt;
    strokes.end(end);
    const at = end + DRY_MS + 400;
    strokes.update(at);
    if (gl) {
      gl.uploadWet();
      gl.render({ time: 12, mouseX: 0, mouseY: 0, scroll: 0 });
    }
    drawOverlay(at);
    updateReadout();
  }

  function setMode() {
    staticMode = reduceMotion.matches || !gl;
    if (staticMode) { halt(); drawStill(); } else { strokes.list = []; kick(); }
  }

  /* --- start ---------------------------------------------------------- */
  new ResizeObserver(resize).observe(scene);
  resize();

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? kick() : halt();
  }).observe(hero);

  document.addEventListener('visibilitychange', () => (document.hidden ? halt() : kick()));
  reduceMotion.addEventListener('change', setMode);

  const fontsReady = document.fonts ? document.fonts.load(`500 11px "IBM Plex Mono"`) : Promise.resolve();
  Promise.all([gl ? gl.ready : Promise.resolve(), fontsReady])
    .catch(() => {})
    .then(() => {
      hero.classList.add(gl ? 'hero--live' : 'hero--nogl');
      setMode();
    });
}
