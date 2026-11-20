# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Marketing site for Watsof (websites, data pipelines and automations), at watsof.net. A single static page built with Vite and plain HTML/CSS/JS: no framework, no UI kit, no Tailwind.

## Commands

- `npm install` once, then `npm run dev` → http://localhost:5173
- `npm run build` → static site in `dist/`
- `npm run preview` → serve the build

There is no test suite.

## Architecture

- **Content**: every word on the page lives in `src/content.js`. Copy is written in the "we" voice and never mentions team size. Anything marked `[PLACEHOLDER]` must be replaced before it can be presented as real (see README "Before launch").
- **Markup**: `src/render.js` turns the content into static HTML at dev/build time through a small Vite plugin in `vite.config.js` (`<!--page-->` in `index.html` is replaced). The page works without JavaScript.
- **Styles**: `src/styles/tokens.css` (design tokens), `base.css`, `header.css`, `hero.css`, `sections.css`, `motion.css`, imported by `main.css`.
- **Behaviour**: `src/hero/` is the WebGL watercolour hero (`scene.js` WebGL setup, `shaders.js` GLSL, `strokes.js` wet strokes and measured overlay, `hero.js` wiring). `src/site/` holds the header, scroll reveals, services ridges, work demos and the contact form.
- **Design**: read `PLAN.md` (palette, fonts, hero concept) and `AUDIT.md` (what the site deliberately avoids) before changing visual design. Display type is Tourney 900 (the wordmark's face), text Archivo, data IBM Plex Mono, all self-hosted in `public/fonts`. Never place the Friedrich painting or a human figure on the site; use the logo files as given.
- **Accessibility and motion**: everything has a `prefers-reduced-motion` path; keep it. The hero falls back to a still image without WebGL or on software rendering.
- **Deployment**: `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`. The `github-pages` environment only accepts deploys from `main`, so deploying a feature branch fails by design: merge to `main` instead. The custom domain is watsof.net (repo Pages settings; `public/CNAME` is also copied into the build). `public/404.html` is the not-found page.
