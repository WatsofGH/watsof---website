# Watsof website: plan

## Assets (inspected)
| File | Size | Notes |
|---|---|---|
| Watercolour texture | 848 × 1264 PNG, 1.6 MB | Portrait. Not as large as the brief suggests: at full-bleed 1440px it is upscaled ~1.7×. Fine for soft washes; I don't use it as a flat hero background. |
| W mark | 464 × 638 PNG, opaque | White W cut over watercolour. Used for favicon and the small mark. |
| Wordmark (PNG) | 1830 × 576, transparent | W panel + "ATSOF" in `#3D362D` on transparency. Used as given, downscaled. |
| Wordmark (JPG) | 1830 × 576, white bg | Not used (white box behind it). |
| Friedrich painting | 860 × 1105 | Reference only. Sampled for colour. Not shipped, not in the repo. |

## Palette (sampled)
From the watercolour (luminance percentiles) and the painting (region medians):

| Token | Hex | Source |
|---|---|---|
| `--fog-50` | `#F0F1F0` | Raised surfaces (inputs). Derived, not white. |
| `--fog-100` | `#E9EBEC` | Base. Watercolour p99 / painting sky. |
| `--fog-200` | `#DBDEE5` | Watercolour p75 |
| `--slate-200` | `#CED5DF` | Watercolour p50 |
| `--slate-300` | `#BDC7D4` | Watercolour p25 |
| `--slate-400` | `#A5B4C5` | Watercolour p10 |
| `--slate-500` | `#8DA1B3` | Watercolour p2 (darkest wash) |
| `--slate-700` | `#4F575E` | Painting, left ridge. Secondary text (6.2:1 on base). |
| `--ink` | `#3D362D` | Logo "ATSOF", exact pixel value. Body text (10:1 on base). |
| `--pine` | `#1C3431` | Painting, wanderer's coat. One dark section. |
| `--rust` | `#8F4A2A` | Painting rocks/hair sit at `#534132`–`#6C5440`; lifted in saturation to work as an accent (5.5:1 on base). |
| `--rust-light` | `#C98A62` | Rust for use on pine (4.6:1). |

## Font check
The wordmark is **not Space Grotesk**. Space Grotesk has a pointed A, round S and round O. The logo has a vertical-walled A with chamfered shoulders, a stepped S and an octagonal O. I rendered 16 candidates; the closest open-source family is Tektur (same S and O construction), but its A is still pointed, so the logo is either another display face or hand-modified. Check the original design file for the font name.

For site type I use **Archivo** (variable, wide cut at ~115% for headlines) because its wide, heavy proportions sit next to the wordmark without imitating its chamfers. **IBM Plex Mono** for the data layer. Space Grotesk was tested next to the logo and clashes.

## Hero concepts
**A. Wet ink, dry data.** A WebGL watercolour scene of layered misty ridges, built from the brand's own texture and noise. Ridges drift with cursor and scroll. Dragging paints a wet slate stroke that bleeds into the paper. As it dries (about 1.5 s), the stroke is measured: simplified to a polyline with vertices, boxed, and labelled in mono (`214 samples → 11 vertices`). The paint fades to a stain, the geometry stays for a while. On touch, horizontal drags paint, vertical drags scroll. When nobody touches it, a stroke paints itself every few seconds.

**B. The survey.** Same ridges, no painting. A slow survey line sweeps across the landscape and turns each painted ridge into a measured elevation profile with readouts. Calm and very legible, but passive; the visitor watches instead of doing.

**C. Sorting the fog.** Loose washes of colour (standing in for scattered tasks and files) drift as fog and, on scroll, settle into a clean table. Says "messy to ordered" well, but it drifts toward particle-field territory and needs heavy choreography to not look generic.

**Chosen: A.** It is the brief's message as an action the visitor performs: hand-made input, computed output. It uses the logo's own watercolour, so it can only be Watsof. It degrades well: on mobile it autoplays, with reduced motion it is one still frame showing a dried stroke and its measurements. B's survey geometry is reused as the visual language of the computed layer.

### Technical approach
- One full-screen fragment shader for the ridges (5 layers, fbm ridgelines, edge darkening, granulation from the real paper texture, drifting fog bands). Rendered at ~0.6× resolution; watercolour is soft so it doesn't show, and it keeps 60 fps on integrated GPUs.
- Wet paint is drawn into a small 2D canvas (quarter-res), uploaded as a texture, then bled and edge-darkened in the shader.
- The computed layer (hairlines, vertices, labels) is a crisp 2D canvas at device resolution.
- Animation stops when the hero is off screen or the tab is hidden.
- No libraries. Fallback without WebGL: the watercolour image as a background plus the static geometry.

## Layout approach
12-column grid with a left "margin column" for labels and readouts, like captions in a field notebook. Sections use different structures:
- **Services**: an index. Each service is a row: name huge on the left, concrete deliverables as a spec list on the right, one worked example in mono.
- **Portfolio**: each project gets its own composition (one wide with a before/after strip, one narrow two-column, one text-led), with its quote attached.
- **Contact**: the single pine-green section, the address in large type, a short form.
- **Footer**: one row.

## File structure
```
index.html
src/
  content.js         all copy, projects, reviews (one file, translatable)
  main.js
  styles/tokens.css  colour, type, space, motion tokens
  styles/base.css
  styles/hero.css    (+ one file per section in Stage 2)
  hero/hero.js       wiring: pointer, scroll, visibility, fallback
  hero/scene.js      WebGL setup and render loop
  hero/shaders.js    GLSL
  hero/strokes.js    wet strokes, simplification, measured overlay
public/fonts, public/img
assets-src/          original logo files and texture
```
Vite (vanilla JS) is the only dependency, for the dev server and production build.

## Estimates (realistic, my working time)
| Stage | Estimate |
|---|---|
| 0 Inspect, audit, plan | 45 min |
| 1 Tokens + hero, screenshots | 3–4 h, plus a feedback round |
| 2 Header, services, portfolio, contact, footer | 4–5 h |
| 3 Polish, motion, perf, a11y, Lighthouse, audit re-check | 2–3 h |

The hero will likely need one or two rounds of tuning after you see it move; that is where the time goes.

## Running it
I can't start a server on your Windows machine from here. The project is synced into your folder and runs with `npm install` once, then `npm run dev` → http://localhost:5173.
