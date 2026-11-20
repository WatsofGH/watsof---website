/*
  Wet strokes that dry into measured geometry.

  A stroke is a list of points in CSS px. While wet it is drawn into a small
  canvas (R channel) that the shader bleeds. As it dries it crossfades into
  the stain channel (G), and the overlay draws what the code "sees":
  a simplified polyline, its vertices, a bounding box and a label.
*/

export const DRY_MS = 1600;      // wet → dry
const HOLD_MS = 3400;            // measured geometry stays this long after drying
const FADE_MS = 1200;            // then fades out
const STAIN_FADE_EVERY = 220;    // ms between stain fade steps
const WET_SCALE = 0.25;          // wet canvas resolution relative to CSS px
const MAX_STROKES = 6;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/* Ramer–Douglas–Peucker */
function simplify(points, epsilon) {
  if (points.length < 3) return points.slice();
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const pa = points[a], pb = points[b];
    const dx = pb.x - pa.x, dy = pb.y - pa.y;
    const len = Math.hypot(dx, dy) || 1;
    let maxD = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * points[i].x - dx * points[i].y + pb.x * pa.y - pb.y * pa.x) / len;
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > epsilon && idx > 0) {
      keep[idx] = 1;
      stack.push([a, idx], [idx, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function pathLength(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return l;
}

export class Strokes {
  constructor() {
    this.wet = document.createElement('canvas');
    this.wetCtx = this.wet.getContext('2d');
    // the texture the shader reads: a softened copy of the wet canvas
    this.texture = document.createElement('canvas');
    this.textureCtx = this.texture.getContext('2d');
    this.canBlur = 'filter' in this.textureCtx;
    this.stain = document.createElement('canvas');
    this.stainCtx = this.stain.getContext('2d');
    this.list = [];
    this.current = null;
    this.count = 0;
    this.totalSamples = 0;
    this.totalVertices = 0;
    this.lastStainFade = 0;
    this.stainAliveUntil = 0;
      }

  resize(cssW, cssH) {
    const w = Math.max(1, Math.round(cssW * WET_SCALE));
    const h = Math.max(1, Math.round(cssH * WET_SCALE));
    for (const c of [this.wet, this.stain, this.texture]) {
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    }
    this.list = [];
    this.current = null;
  }

  /* --- input --------------------------------------------------------- */

  begin(x, y, t, { pressed = false } = {}) {
    this.end(t);
    this.current = {
      id: ++this.count,
      points: [{ x, y, t, d: 0, w: pressed ? 30 : 22 }],
      start: t,
      end: null,
      width: pressed ? 30 : 22,
      dryStamped: false,
    };
    this.list.push(this.current);
    if (this.list.length > MAX_STROKES) this.list.shift();
  }

  extend(x, y, t) {
    const s = this.current;
    if (!s) return;
    const last = s.points[s.points.length - 1];
    const d = Math.hypot(x - last.x, y - last.y);
    if (d < 3) return;
    // Slower hand, wetter and wider brush
    const speed = d / Math.max(1, t - last.t); // px/ms
    const target = lerp(34, 12, clamp01(speed / 2.2));
    s.width = lerp(s.width, target, 0.08);
    s.points.push({ x, y, t, d: last.d + d, w: s.width });
  }

  end(t) {
    const s = this.current;
    if (!s) return;
    this.current = null;
    if (s.points.length < 4 || pathLength(s.points) < 40) {
      this.list = this.list.filter((x) => x !== s);
      this.count--;
      return;
    }
    s.end = t;
    this.measure(s);
  }

  get drawing() {
    return !!this.current;
  }

  lengthOfCurrent() {
    return this.current ? pathLength(this.current.points) : 0;
  }

  measure(s) {
    const simple = simplify(s.points, 6);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of s.points) {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    const pad = s.width * 0.5;
    s.simple = simple;
    s.simpleLength = pathLength(simple);
    s.box = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
    s.duration = (s.points[s.points.length - 1].t - s.points[0].t) / 1000;
    this.totalSamples += s.points.length;
    this.totalVertices += simple.length;
  }

  /* --- per frame ----------------------------------------------------- */

  wetness(s, now) {
    if (s.end == null) return 1;
    return 1 - easeInOut(clamp01((now - s.end) / DRY_MS));
  }

  /* Returns true if the wet canvas changed and needs uploading. */
  update(now) {
    // expire old geometry
    this.list = this.list.filter((s) => s.end == null || now < s.end + DRY_MS + HOLD_MS + FADE_MS);

    const sctx = this.stainCtx;
    let stainChanged = false;

    // stamp fully dried strokes into the stain layer
    for (const s of this.list) {
      if (s.end != null && !s.dryStamped && now >= s.end + DRY_MS) {
        this.drawStroke(sctx, s, 0, 0.55, 1.12);
        s.dryStamped = true;
        this.stainAliveUntil = now + 9000;
        stainChanged = true;
      }
    }

    // fade the stain slowly so the page never gets dirty
    if (now < this.stainAliveUntil && now - this.lastStainFade > STAIN_FADE_EVERY) {
      sctx.fillStyle = 'rgba(0,0,0,0.05)';
      sctx.fillRect(0, 0, this.stain.width, this.stain.height);
      this.lastStainFade = now;
      stainChanged = true;
    } else if (now >= this.stainAliveUntil && this.stainAliveUntil) {
      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, this.stain.width, this.stain.height);
      this.stainAliveUntil = 0;
      stainChanged = true;
    }

    const wetOnes = this.list.filter((s) => !s.dryStamped);
    if (!wetOnes.length && !stainChanged && !this._hadWet) return false;
    this._hadWet = wetOnes.length > 0;

    const ctx = this.wetCtx;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(this.stain, 0, 0);
    // 'lighten' is a per-channel max: R (wet) and G (stain) never mix,
    // and overlapping segments of one stroke don't build up at the joints.
    ctx.globalCompositeOperation = 'lighten';
    for (const s of wetOnes) {
      const w = this.wetness(s, now);
      const spread = 1 + (1 - w) * 0.12; // the bloom keeps spreading while it dries
      this.drawStroke(ctx, s, 0.95 * w, 0.55 * (1 - w), spread);
    }
    ctx.globalCompositeOperation = 'source-over';

    const tctx = this.textureCtx;
    if (this.canBlur) tctx.filter = 'blur(1.25px)';
    tctx.drawImage(this.wet, 0, 0);
    tctx.filter = 'none';
    return true;
  }

  /* Draws a stroke as round-capped segments with tapered, speed-based width.
     r, g: channel intensities 0..1 (R = wet pigment, G = stain). */
  drawStroke(ctx, s, r, g, widthMul) {
    const pts = s.points;
    if (pts.length < 2) return;
    const total = pts[pts.length - 1].d || 1;
    ctx.save();
    ctx.scale(WET_SCALE, WET_SCALE);
    ctx.strokeStyle = ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},0)`;
    ctx.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const taperIn = 0.35 + 0.65 * clamp01(b.d / 60);
      const taperOut = s.end == null ? 1 : 0.6 + 0.4 * clamp01((total - b.d) / 50);
      ctx.lineWidth = b.w * taperIn * taperOut * widthMul;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // pigment pools where the brush lifts
    if (s.end != null) {
      const last = pts[pts.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, last.w * widthMul * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /* Fallback without WebGL: a flat, translucent wash on the 2D overlay */
  drawFlat(ctx, color) {
    for (const s of this.list) {
      const pts = s.points;
      if (pts.length < 2) continue;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineCap = ctx.lineJoin = 'round';
      ctx.lineWidth = s.width;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (const p of pts) ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  /* --- measured overlay ---------------------------------------------- */

  drawOverlay(ctx, now, colors) {
    for (const s of this.list) {
      if (s.end == null || !s.simple) continue;
      const t = now - s.end;
      const grow = easeInOut(clamp01((t - 250) / (DRY_MS - 250)));
      const fade = 1 - clamp01((t - DRY_MS - HOLD_MS) / FADE_MS);
      if (grow <= 0 || fade <= 0) continue;
      drawMeasured(ctx, s, grow, fade, colors);
    }
  }
}

/*
  The measured layer is kept quiet on purpose: it should read as a pencil
  annotation on the painting, not as UI. One hairline, small dots, two
  corner ticks and one short label.
*/
function drawMeasured(ctx, s, grow, alpha, c) {
  const { box, simple } = s;
  ctx.save();
  ctx.lineWidth = 1;

  // two opposite corner ticks instead of a full box
  ctx.strokeStyle = c.ink;
  ctx.globalAlpha = alpha * grow * 0.35;
  const k = 6;
  const { x, y, w, h } = box;
  ctx.beginPath();
  ctx.moveTo(x, y + k); ctx.lineTo(x, y); ctx.lineTo(x + k, y);
  ctx.moveTo(x + w - k, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - k);
  ctx.stroke();

  // the simplified line, drawn along its length as the paint dries
  ctx.globalAlpha = alpha * 0.55;
  const target = s.simpleLength * grow;
  let acc = 0;
  let shown = 1;
  ctx.beginPath();
  ctx.moveTo(simple[0].x, simple[0].y);
  for (let i = 1; i < simple.length; i++) {
    const a = simple[i - 1], b = simple[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (acc + seg <= target) {
      ctx.lineTo(b.x, b.y);
      acc += seg;
      shown = i + 1;
    } else {
      const r = (target - acc) / seg;
      ctx.lineTo(a.x + (b.x - a.x) * r, a.y + (b.y - a.y) * r);
      break;
    }
  }
  ctx.stroke();

  // vertices as small dots; the first one in the accent
  for (let i = 0; i < shown; i++) {
    const v = simple[i];
    ctx.globalAlpha = alpha * (i === 0 ? 0.9 : 0.6);
    ctx.fillStyle = i === 0 ? c.accent : c.ink;
    ctx.beginPath();
    ctx.arc(v.x, v.y, i === 0 ? 2.5 : 1.75, 0, Math.PI * 2);
    ctx.fill();
  }

  // one short label next to the last vertex, no box
  if (grow > 0.6) {
    const la = alpha * clamp01((grow - 0.6) / 0.3) * 0.85;
    const last = simple[simple.length - 1];
    const label = `${s.points.length} → ${simple.length} pts`;
    ctx.font = `400 10px ${c.mono}`;
    const tw = ctx.measureText(label).width;
    // continue past the end of the stroke, in the direction it was travelling
    const prev = simple[simple.length - 2] || simple[0];
    const W = ctx.canvas.clientWidth;
    let lx = last.x >= prev.x ? last.x + 10 : last.x - tw - 10;
    let ly = last.y + 3.5;
    if (lx < 12 || lx + tw > W - 12) {
      // no room: sit just above the end instead of on top of the paint
      lx = Math.max(12, Math.min(last.x - tw / 2, W - 12 - tw));
      ly = last.y - s.width * 0.6 - 6;
    }
    ctx.globalAlpha = la;
    ctx.fillStyle = c.muted;
    ctx.fillText(label, Math.round(lx), Math.round(ly));
  }
  ctx.restore();
}
