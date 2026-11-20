# watsof.net

Company site for Watsof. Static HTML/CSS/JS built with Vite. No framework, no UI kit.

## Run

```bash
npm install      # once
npm run dev      # http://localhost:5173
```

`npm run build` writes a static site to `dist/` (upload that folder to any static host); `npm run preview` serves the build.

## Before launch: replace these

All in `src/content.js` unless noted. Search the repo for `[PLACEHOLDER]`.

| What | Where |
|---|---|
| Public email address | `site.email` |
| Office hours shown in the contact section | `site.hours` |
| KvK number (and add BTW if you want it shown) | `site.kvk` |
| Stack lines per service | `services.items[].stack` |
| All three portfolio projects: title, client, sector, year, scope, problem, built, outcome | `work.projects[]` |
| The numbers in project 2 | `work.projects[1].metrics` |
| The three quotes: text, name, role (only real, approved quotes) | `work.projects[].quote` |
| The dashboard and messy-table sample data in project 1 | `compareVisual()` in `src/render.js` |
| The "Placeholder projects" note under the Work heading | `work.placeholderNote` (delete it) |

The `[PLACEHOLDER]` tags on the page come from `work.labels.placeholder`; remove the `${ph}` calls in `src/render.js` once the projects are real.

## Where things are

| What | Where |
|---|---|
| All copy | `src/content.js` |
| Markup (rendered from content at dev/build time) | `src/render.js` |
| Design tokens | `src/styles/tokens.css` |
| Header, sections, motion | `src/styles/header.css`, `sections.css`, `motion.css` |
| Hero: wiring / WebGL / shader / paint | `src/hero/` |
| Header behaviour, reveals, services ridges, work demos, contact form | `src/site/` |
| Fonts (self-hosted, OFL) | `public/fonts` |
| Images (optimised) | `public/img` |
| Original logo files and texture | `assets-src/` |

The HTML is generated from `src/content.js` by a small Vite plugin in `vite.config.js`, so the page works without JavaScript and all text stays in one file.

## The contact form

There is no server. On submit the form validates, then opens the visitor's mail app with the message filled in (`src/site/contact.js`). To use a form service later, replace the `mailto:` part of the submit handler with a `fetch()` to its endpoint.

## Hero debug flags

- `?debug` shows the median frame time and shader resolution in the hero hint line.
- `?q=0.5` forces the shader resolution factor (default 0.75 × device pixel ratio, max 1.5). The hero lowers it on its own if frames take over 20 ms.

## Design notes

See `PLAN.md` (palette, font check, hero concept) and `AUDIT.md` (what this site avoids, and what it does instead). The design system lives as a separate artifact built from this code.
