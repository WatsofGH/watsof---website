# watsof.net

Company site for Watsof. Static HTML/CSS/JS built with Vite. No framework, no UI kit.

## Run

```bash
npm install      # once
npm run dev      # http://localhost:5173
```

`npm run build` writes a static site to `dist/`; `npm run preview` serves that build.

## Where things are

| What | Where |
|---|---|
| All copy, projects, reviews | `src/content.js` |
| Markup (rendered from content at dev/build time) | `src/render.js` |
| Design tokens: colour, type, space, motion | `src/styles/tokens.css` |
| Hero: wiring / WebGL / shader / paint | `src/hero/hero.js`, `scene.js`, `shaders.js`, `strokes.js` |
| Fonts (self-hosted, OFL) | `public/fonts` |
| Images (optimised) | `public/img` |
| Original logo files and texture | `assets-src/` |

The HTML is generated from `src/content.js` by a small Vite plugin in `vite.config.js`, so the page works without JavaScript and all text stays in one file.

## Hero debug flags

- `?debug` shows the median frame time and shader resolution in the hero hint line.
- `?q=0.5` forces the shader resolution factor (default 0.75 × device pixel ratio, max 1.5). The hero lowers it on its own if frames take over 20 ms.

## Images

`public/img` was made from `assets-src/` with Pillow: wordmark at 480/960 px (WebP + PNG), texture as WebP q82 (1.6 MB → 118 kB), favicons from the W mark. The Friedrich painting is reference only and is not in this repo.

## Design notes

See `PLAN.md` (palette with sampled values, font check, hero concept) and `AUDIT.md` (what this site avoids, and what it does instead).
