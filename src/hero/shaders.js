/*
  Hero shaders (WebGL2 / GLSL ES 3.0).

  The fragment shader paints, back to front:
    1. paper: fog base + the woven grain of the brand watercolour (high-pass)
    2. five ridge washes: pigment pools at each ridge's top edge and fades
       down into fog, like the logo texture
    3. drifting fog bands between ridges
    4. the visitor's paint, read from a small 2D canvas
       (R = wet pigment, G = dried stain), bled with noise, edge-darkened
*/

export const VERT = /* glsl */ `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  uRes;          // drawing buffer size, px
uniform float uScale;        // drawing buffer px per CSS px
uniform float uTime;         // seconds
uniform vec2  uMouse;        // -1..1, smoothed
uniform float uScroll;       // 0..1 of hero scrolled away
uniform sampler2D uPaper;    // brand watercolour
uniform vec2  uPaperSize;    // texture size, px
uniform sampler2D uWet;      // R wet, G stain

out vec4 outColor;

const vec3 FOG = vec3(0.914, 0.922, 0.925);      // #E9EBEC
const vec3 INK_SLATE = vec3(0.22, 0.30, 0.40);   // pigment of the visitor's paint

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= 0.5; }
  return v;
}
float fbm2(vec2 p) {
  return 0.66 * noise(p) + 0.34 * noise(p * 2.1 + 5.3);
}

// Ridge colours, far to near (sampled watercolour washes, darkening toward the viewer)
vec3 ridgeColor(int i) {
  if (i == 0) return vec3(0.80, 0.84, 0.89);
  if (i == 1) return vec3(0.70, 0.76, 0.83);
  if (i == 2) return vec3(0.60, 0.68, 0.76);
  if (i == 3) return vec3(0.50, 0.59, 0.68);
  return vec3(0.42, 0.51, 0.60);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 css = frag / uScale;                 // CSS px, y up
  vec2 uv = frag / uRes;                    // 0..1, y up
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // 1. Paper: the brand texture's weave, one texel per CSS px
  vec2 puv = css / uPaperSize;
  float grain = dot(texture(uPaper, puv).rgb, vec3(0.333));
  float grainLow = dot(textureLod(uPaper, puv, 2.5).rgb, vec3(0.333));
  float hp = grain - grainLow;              // fine weave, roughly -0.1..0.1
  vec3 col = FOG + hp * 0.45;

  float gran = fbm(p * 36.0);               // pigment granulation, shared by layers
  float streak = noise(vec2(p.x * 140.0, p.y * 2.5)); // vertical drips, like the texture

  // 2 + 3. Ridges, back to front
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float depth = (fi + 1.0) / 5.0;

    float base = 0.69 - fi * 0.125 + uScroll * (0.08 + depth * 0.30);
    float x = p.x * (0.9 + fi * 0.22) + fi * 7.31
            + uMouse.x * depth * 0.05
            + uTime * 0.006 * (0.4 + depth);
    float h = base
            + (fbm(vec2(x * 1.2, fi * 3.7)) - 0.5) * (0.13 + fi * 0.03)
            + (noise(vec2(x * 7.0, fi * 1.3)) - 0.5) * 0.018
            + uMouse.y * depth * 0.012;

    // ragged, bleeding edge
    float wob = (fbm2(vec2(p.x * 22.0 + fi * 3.0, p.y * 22.0)) - 0.5) * 0.016;
    float y = uv.y + wob;
    float below = h - y;
    float inside = smoothstep(-0.002, 0.006, below);

    // each wash first hides what is behind it (mist is a little translucent)
    col = mix(col, FOG + hp * 0.45, inside * 0.82);

    // pigment: pools at the edge, fades into fog below
    float fade = 0.10 + 0.035 * fi;
    float body = exp(-max(below, 0.0) / fade);
    float tide = exp(-max(below, 0.0) / 0.007) * 0.45;
    float density = inside * (body * 0.8 + tide + 0.05);
    density *= 0.78 + 0.45 * gran + 1.6 * hp;
    density *= 0.94 + 0.12 * streak;
    float opacity = mix(0.55, 0.95, depth);
    col = mix(col, col * ridgeColor(i), clamp(density * opacity, 0.0, 1.0));

    // fog drifting in front of the base of this ridge
    float drift = fbm2(vec2(p.x * 1.6 - uTime * 0.015 * (0.5 + depth), p.y * 5.0 + fi * 2.0));
    float fogBand = smoothstep(0.02, 0.16, below) * smoothstep(0.35, 0.75, drift);
    col = mix(col, FOG, fogBand * inside * 0.55);
  }

  // 4. Visitor paint. Canvas 2D has y down.
  vec2 wuv = vec2(uv.x, 1.0 - uv.y);
  float wet0 = texture(uWet, wuv).r;
  vec2 bleed = vec2(fbm2(p * 9.0 + uTime * 0.12), fbm2(p * 9.0 + 4.7 - uTime * 0.12)) - 0.5;
  vec4 w = texture(uWet, wuv + bleed * (0.012 * wet0 + 0.003));
  float ragged = fbm2(p * 42.0) - 0.5;

  // wet: a soft bloom that is still spreading
  float wetShape = smoothstep(0.06, 0.65, w.r + ragged * 0.3);
  // dry: a hard, ragged edge with pigment pooled along it (the tidemark)
  float sv = w.g + ragged * 0.12;
  float stainShape = smoothstep(0.035, 0.07, sv);
  float rim = stainShape * (1.0 - smoothstep(0.07, 0.26, sv));
  float stainAmt = smoothstep(0.0, 0.3, w.g);

  float paint = wetShape * 0.72 + stainShape * stainAmt * (0.34 + rim * 0.55);
  paint *= 0.72 + 0.5 * fbm2(p * 5.0 + 3.1);     // uneven pigment load, small blooms
  paint *= 0.8 + 0.45 * gran + 1.8 * hp;          // granulation into the paper
  col = mix(col, col * INK_SLATE, clamp(paint, 0.0, 0.85));

  // wet sheen: slightly cooler while wet
  col = mix(col, col * vec3(0.95, 0.98, 1.02), wetShape * 0.5);

  // the bottom of the scene settles into a sea of fog
  col = mix(col, FOG + hp * 0.4, smoothstep(0.42, 0.05, uv.y + (fbm2(vec2(p.x * 2.0 - uTime * 0.01, 3.0)) - 0.5) * 0.08) * 0.9);

  outColor = vec4(col, 1.0);
}
`;
