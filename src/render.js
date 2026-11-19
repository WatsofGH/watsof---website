/*
  Turns src/content.js into static HTML. Runs in Node at dev/build time,
  never in the browser. One function per section; plain template strings.
*/
import { site, nav, hero } from './content.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const coord = (lat, lon) =>
  `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;

function header() {
  return `
<header class="site-header">
  <a class="site-header__brand" href="#top" aria-label="${esc(site.name)}, back to top">
    <picture>
      <source type="image/webp" srcset="/img/wordmark-480.webp 480w, /img/wordmark-960.webp 960w" sizes="(min-width: 60em) 184px, 136px" />
      <img src="/img/wordmark-480.png" width="480" height="151" alt="${esc(site.name)}" />
    </picture>
  </a>
  <nav class="site-header__nav" aria-label="${esc(nav.label)}">
    <ul role="list">
      ${nav.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}
    </ul>
  </nav>
  <a class="site-header__cta" href="${esc(nav.cta.href)}">${esc(nav.cta.text)}<span aria-hidden="true">→</span></a>
</header>`;
}

function heroSection() {
  const r = hero.readout;
  return `
<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="hero__scene" aria-hidden="true">
    <canvas class="hero__paint"></canvas>
    <canvas class="hero__measure"></canvas>
  </div>

  <div class="hero__copy">
    <h1 class="hero__title" id="hero-title">
      ${hero.titleLines.map((l) => `<span class="hero__line">${esc(l)}</span>`).join(' ')}
    </h1>
    <div class="hero__foot">
      <p class="hero__lede">${esc(hero.lede)}</p>
      <a class="hero__cta" href="${esc(hero.cta.href)}">${esc(hero.cta.text)}<span aria-hidden="true">→</span></a>
    </div>
  </div>

  <dl class="hero__readout mono" aria-hidden="true">
    <div><dt>${esc(r.vantage)}</dt><dd>${coord(site.location.lat, site.location.lon)}</dd></div>
    <div><dt>${esc(r.localTime)}</dt><dd data-readout="clock" data-tz="${esc(site.location.timeZone)}">--:--</dd></div>
    <div><dt>${esc(r.strokes)}</dt><dd data-readout="strokes">0</dd></div>
    <div><dt>${esc(r.reduction)}</dt><dd data-readout="ratio">–</dd></div>
  </dl>

  <p class="hero__hint mono" data-hint-pointer="${esc(hero.hintPointer)}" data-hint-touch="${esc(hero.hintTouch)}">${esc(hero.hintPointer)}</p>
</section>`;
}

function stagePlaceholder() {
  return `
<section class="stage-placeholder" id="services">
  <p class="mono">Stage 2 · services, work, contact and footer go here.</p>
</section>`;
}

export function renderPage() {
  return `<a class="skip-link" href="#main">Skip to content</a>
${header()}
<main id="main">
${heroSection()}
${stagePlaceholder()}
</main>`;
}
