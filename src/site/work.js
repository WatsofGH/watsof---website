/*
  Work: the before/after slider and the lead pipeline animation.
*/
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- before/after slider ---------- */
function initCompare(root) {
  const range = root.querySelector('[data-compare-range]');
  const set = (v) => root.style.setProperty('--pos', `${v}%`);
  range.addEventListener('input', () => set(range.value));

  // On first view, sweep from mostly-messy to the middle once, to show it moves.
  if (reduceMotion()) return;
  let touched = false;
  range.addEventListener('pointerdown', () => (touched = true), { once: true });
  range.addEventListener('keydown', () => (touched = true), { once: true });
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const from = 88, to = 50, dur = 1600, t0 = performance.now();
    const step = (now) => {
      if (touched) return;
      const t = Math.min(1, (now - t0) / dur);
      const k = 1 - (1 - t) ** 3;
      const v = from + (to - from) * k;
      set(v);
      range.value = v;
      if (t < 1) requestAnimationFrame(step);
    };
    set(from);
    requestAnimationFrame(step);
  }, { threshold: 0.5 });
  io.observe(root);
}

/* ---------- pipeline ---------- */
const SVG = 'http://www.w3.org/2000/svg';
const SPEED = 0.16;      // px per ms in the 640-wide drawing
const SPAWN_EVERY = 620; // ms
const WEIGHTS = [0.5, 0.32, 0.18]; // sales, support, spam

function initPipeline(root) {
  const svg = root.querySelector('svg');
  const layer = root.querySelector('[data-items]');
  const node = root.querySelector('.pipeline__node');
  const inTrack = svg.querySelector('#track-in');
  const lanes = [0, 1, 2].map((i) => svg.querySelector(`#track-${i}`));
  const counters = [0, 1, 2].map((i) => root.querySelector(`[data-count="${i}"]`));
  const counts = [0, 0, 0];
  const inLen = inTrack.getTotalLength();
  const laneLen = lanes.map((l) => l.getTotalLength());

  if (reduceMotion()) {
    // A still frame: a few items on their way, plausible counts.
    [[inTrack, 0.3], [inTrack, 0.7], [lanes[0], 0.6], [lanes[1], 0.4]].forEach(([path, f], i) => {
      const p = path.getPointAtLength(path.getTotalLength() * f);
      const c = document.createElementNS(SVG, 'circle');
      c.setAttribute('r', '5');
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
      c.setAttribute('class', `pipeline__item${i > 1 ? ' is-sorted' : ''}`);
      layer.append(c);
    });
    [14, 9, 5].forEach((n, i) => (counters[i].textContent = n));
    return;
  }

  const pick = () => {
    const r = Math.random();
    return r < WEIGHTS[0] ? 0 : r < WEIGHTS[0] + WEIGHTS[1] ? 1 : 2;
  };

  let items = [];
  let running = false;
  let last = 0;
  let lastSpawn = 0;
  let busyUntil = 0;

  function spawn(now) {
    const el = document.createElementNS(SVG, 'circle');
    el.setAttribute('r', '5');
    el.setAttribute('class', 'pipeline__item');
    layer.append(el);
    items.push({ el, lane: pick(), stage: 0, d: 0, wait: 0 });
    lastSpawn = now;
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(48, now - (last || now));
    last = now;
    if (now - lastSpawn > SPAWN_EVERY) spawn(now);

    for (const it of items) {
      if (it.stage === 0) {
        it.d += SPEED * dt;
        if (it.d >= inLen) { it.stage = 1; it.wait = 260; it.d = 0; busyUntil = now + 260; }
        const p = inTrack.getPointAtLength(Math.min(it.d, inLen));
        it.el.setAttribute('cx', p.x);
        it.el.setAttribute('cy', p.y);
      } else if (it.stage === 1) {
        it.wait -= dt;
        it.el.setAttribute('cx', 320);
        it.el.setAttribute('cy', 160);
        if (it.wait <= 0) { it.stage = 2; it.el.classList.add('is-sorted'); }
      } else if (it.stage === 2) {
        it.d += SPEED * 1.15 * dt;
        const L = laneLen[it.lane];
        const p = lanes[it.lane].getPointAtLength(Math.min(it.d, L));
        it.el.setAttribute('cx', p.x);
        it.el.setAttribute('cy', p.y);
        if (it.d >= L) {
          it.stage = 3;
          counts[it.lane]++;
          counters[it.lane].textContent = counts[it.lane];
          it.el.remove();
        }
      }
    }
    items = items.filter((it) => it.stage !== 3);
    node.classList.toggle('is-busy', now < busyUntil);
    requestAnimationFrame(frame);
  }

  new IntersectionObserver(([e]) => {
    running = e.isIntersecting && !document.hidden;
    if (running) { last = 0; requestAnimationFrame(frame); }
  }, { threshold: 0.2 }).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
  });
}

export function initWork() {
  document.querySelectorAll('[data-compare]').forEach(initCompare);
  document.querySelectorAll('[data-pipeline]').forEach(initPipeline);
}
