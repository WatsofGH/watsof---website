/*
  Turns src/content.js into static HTML. Runs in Node at dev/build time,
  never in the browser. One function per section; plain template strings.
  The page is complete without JavaScript; scripts only add motion and the
  interactive parts.
*/
import { site, nav, hero, services, work, contact, footer } from './content.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const coord = (lat, lon) =>
  `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;

const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const ph = `<span class="ph-tag mono">${esc(work.labels.placeholder)}</span>`;

/* ---------- shared SVG filters: ragged watercolour edges ---------- */
function svgDefs() {
  const wash = (id, seed, freq = '0.022 0.05', scale = 16) => `
  <filter id="${id}" x="-15%" y="-40%" width="130%" height="180%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="shape"/>
    <feGaussianBlur in="shape" stdDeviation="1.1" result="soft"/>
    <feMorphology in="soft" operator="erode" radius="1.8" result="inner"/>
    <feComposite in="soft" in2="inner" operator="out" result="rim"/>
    <feComponentTransfer in="inner" result="body"><feFuncA type="linear" slope="0.5"/></feComponentTransfer>
    <feMerge result="wash"><feMergeNode in="body"/><feMergeNode in="rim"/></feMerge>
    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="${seed + 7}" result="grain"/>
    <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.35" result="grainA"/>
    <feComposite in="wash" in2="grainA" operator="in"/>
  </filter>`;
  return `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false">
  ${wash('wash-1', 3)}${wash('wash-2', 11)}${wash('wash-3', 23)}
  <filter id="ragged" x="-2%" y="-10%" width="104%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="4" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="22" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>`;
}

/* ---------- header ---------- */
function header() {
  const links = nav.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('');
  return `
<header class="site-header" data-header>
  <a class="site-header__brand" href="#top" aria-label="${esc(site.name)}, back to top">
    <picture>
      <source type="image/webp" srcset="/img/wordmark-480.webp 480w, /img/wordmark-960.webp 960w" sizes="(min-width: 60em) 184px, 136px" />
      <img src="/img/wordmark-480.png" width="480" height="151" alt="${esc(site.name)}" />
    </picture>
  </a>
  <p class="site-header__where mono" aria-hidden="true" data-where></p>
  <nav class="site-header__nav" aria-label="${esc(nav.label)}">
    <ul role="list">${links}</ul>
  </nav>
  <a class="site-header__cta" href="${esc(nav.cta.href)}">${esc(nav.cta.text)}${arrow}</a>
  <button class="site-header__menu mono" type="button" aria-expanded="false" aria-controls="menu" data-menu-button data-open="${esc(nav.menu)}" data-close="${esc(nav.close)}">${esc(nav.menu)}</button>
  <span class="site-header__progress" aria-hidden="true"></span>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav aria-label="${esc(nav.label)}, mobile">
    <ul role="list">${nav.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}</ul>
  </nav>
  <p class="menu__mail"><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
</div>`;
}

/* ---------- landing ---------- */
function heroSection() {
  const r = hero.readout;
  return `
<section class="hero" id="top" aria-labelledby="hero-title" data-section="${esc(hero.titleLines[0])}">
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
      <a class="hero__cta" href="${esc(hero.cta.href)}">${esc(hero.cta.text)}${arrow}</a>
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

/* A section's opening: margin label, drawn rule, display heading */
function sectionHead(id, label, title, extra = '') {
  return `
  <div class="section-head">
    <span class="rule" aria-hidden="true" data-draw></span>
    <p class="section-head__label mono">${esc(label)}</p>
    <h2 class="section-head__title" id="${id}-title" data-lift>${esc(title)}</h2>
    ${extra}
  </div>`;
}

/* ---------- what we do ---------- */
function ridgeFigure() {
  // Three ridges, far to near: one per service. Paths are hand-tuned curves.
  const ridges = [
    { id: 'websites', d: 'M-30 134 L0 128 C60 104 110 86 170 96 C230 106 262 70 320 62 C380 54 430 84 520 74 L550 70 L550 330 L-30 330 Z', crest: [[0, 128], [86, 98], [170, 96], [250, 80], [320, 62], [420, 80], [520, 74]] },
    { id: 'data', d: 'M-30 190 L0 186 C70 170 120 150 190 160 C260 170 300 132 370 138 C430 143 470 166 520 156 L550 152 L550 330 L-30 330 Z', crest: [[0, 186], [100, 160], [190, 160], [290, 146], [370, 138], [450, 158], [520, 156]] },
    { id: 'automation', d: 'M-30 248 L0 244 C80 226 140 212 220 222 C290 231 340 204 410 208 C460 211 490 226 520 220 L550 218 L550 330 L-30 330 Z', crest: [[0, 244], [110, 220], [220, 222], [320, 212], [410, 208], [470, 220], [520, 220]] },
  ];
  const labels = services.items.map((s) => s.name);
  return `
<figure class="ridges" aria-hidden="true">
  <svg viewBox="0 0 520 300" preserveAspectRatio="none">
    ${ridges
      .map(
        (r, i) => `
    <g class="ridge" data-ridge="${r.id}">
      <path class="ridge__wash ridge__wash--${i}" d="${r.d}"/>
      <polyline class="ridge__line" points="${r.crest.map((p) => p.join(',')).join(' ')}" pathLength="1"/>
      ${r.crest.map((p, k) => `<rect class="ridge__dot${k === 0 ? ' ridge__dot--first' : ''}" x="${p[0] - 2}" y="${p[1] - 2}" width="4" height="4"/>`).join('')}
    </g>`,
      )
      .join('')}
  </svg>
  <ul class="ridges__labels mono" role="list">
    ${labels.map((l, i) => `<li data-ridge-label="${ridges[i].id}" style="--y:${[96, 160, 222][i] / 3}%">${esc(l)}</li>`).join('')}
  </ul>
</figure>`;
}

function servicesSection() {
  const L = services.labels;
  return `
<section class="services" id="services" aria-labelledby="services-title" data-section="${esc(services.label)}">
  <div class="services__aside">
    ${sectionHead('services', services.label, services.title)}
    <p class="services__intro">${esc(services.intro)}</p>
    ${ridgeFigure()}
  </div>
  <div class="services__list">
    ${services.items
      .map(
        (s) => `
    <article class="service" id="service-${s.id}" data-service="${s.id}" aria-labelledby="service-${s.id}-name">
      <h3 class="service__name" id="service-${s.id}-name">${esc(s.name)}</h3>
      <p class="service__lead">${esc(s.lead)}</p>
      <dl class="service__spec">
        <div><dt class="mono">${esc(L.gets)}</dt><dd><ul role="list">${s.gets.map((g) => `<li>${esc(g)}</li>`).join('')}</ul></dd></div>
        <div><dt class="mono">${esc(L.stack)}</dt><dd>${esc(s.stack)}</dd></div>
      </dl>
      <div class="service__example">
        <p class="service__example-label mono">${esc(L.example)}</p>
        <p class="service__before"><span class="mono">${esc(L.before)}</span> ${esc(s.example.before)}</p>
        <p class="service__after"><span class="mono">${esc(L.after)}</span> ${esc(s.example.after)}</p>
      </div>
    </article>`,
      )
      .join('')}
  </div>
</section>`;
}

/* ---------- work ---------- */
function meta(p) {
  const L = work.labels;
  return `
  <dl class="project__meta mono">
    <div><dt>${esc(L.client)}</dt><dd>${esc(p.client)}</dd></div>
    <div><dt>${esc(L.sector)}</dt><dd>${esc(p.sector)}</dd></div>
    <div><dt>${esc(L.year)}</dt><dd>${esc(p.year)}</dd></div>
    <div><dt>${esc(L.scope)}</dt><dd>${esc(p.scope)}</dd></div>
  </dl>`;
}

function story(p) {
  const L = work.labels;
  return `
  <div class="project__story">
    <div><h4 class="mono">${esc(L.problem)}</h4><p>${esc(p.problem)}</p></div>
    <div><h4 class="mono">${esc(L.built)}</h4><p>${esc(p.built)}</p></div>
    <div><h4 class="mono">${esc(L.outcome)}</h4><p>${esc(p.outcome)}</p></div>
  </div>`;
}

function quote(p) {
  return `
  <figure class="project__quote">
    <blockquote><p>${esc(p.quote.text)}</p></blockquote>
    <figcaption class="mono">${ph} ${esc(p.quote.name)}, ${esc(p.quote.role)}, ${esc(p.client)}</figcaption>
  </figure>`;
}

/* Project 1: before/after slider, a stained export against a clean dashboard */
function compareVisual(p) {
  const rows = [
    ['03-02-24', 'jansen bv', '€ 1.234,50', 1],
    ['2024/02/03', 'De Vries ', '89.5', 1],
    ['3 feb 2024', 'JANSEN B.V.', '1,099.00', 1],
    ['Feb 5, 2024', 'Hoek  Inst.', 'EUR 2.450', 1],
    ['3 feb 2024', 'JANSEN B.V.', '1,099.00', 2],
    ['6-2-24', 'Jansen b.v.', '315,75', 1],
    ['12/02/2024', 'Groen & Zn', '€12,00', 0],
    ['13-2-2024', 'hoek installatie', '1.020', 1],
  ];
  const bars = [38, 52, 47, 61, 58, 72, 69, 84];
  const max = 90;
  return `
<div class="compare" data-compare style="--pos: 50%">
  <div class="compare__layer compare__after" aria-hidden="true">
    <div class="dash">
      <div class="dash__kpis">
        <div><span class="mono">Revenue, week 6</span><b>€ 48.210</b><span class="mono dash__delta">+6.2%</span></div>
        <div><span class="mono">Orders</span><b>312</b><span class="mono dash__delta">+18</span></div>
        <div><span class="mono">Late deliveries</span><b>4</b><span class="mono dash__delta dash__delta--down">−3</span></div>
      </div>
      <svg class="dash__chart" viewBox="0 0 400 140" preserveAspectRatio="none">
        ${[0, 1, 2, 3].map((i) => `<line class="dash__grid" x1="0" x2="400" y1="${20 + i * 36}" y2="${20 + i * 36}"/>`).join('')}
        ${bars.map((b, i) => `<rect class="dash__bar${i === bars.length - 1 ? ' dash__bar--now' : ''}" x="${12 + i * 49}" y="${128 - (b / max) * 108}" width="30" height="${(b / max) * 108}"/>`).join('')}
        <line class="dash__base" x1="0" x2="400" y1="128.5" y2="128.5"/>
      </svg>
      <p class="mono dash__note">Weekly revenue, weeks −1 to 6 · updated 07:00</p>
    </div>
  </div>
  <div class="compare__layer compare__before" aria-hidden="true">
    <table class="mess mono">
      <thead><tr><th>date</th><th>customer</th><th>amount</th></tr></thead>
      <tbody>${rows
        .map(
          ([d, c, a, k], i) =>
            `<tr${k === 2 ? ' class="is-dup"' : ''}><td${k ? ` class="w w${(i % 3) + 1}"` : ''}>${esc(d)}</td><td${k && i % 2 ? ` class="w w${((i + 1) % 3) + 1}"` : ''}>${esc(c)}</td><td${k ? ` class="w w${((i + 2) % 3) + 1}"` : ''}>${esc(a)}</td></tr>`,
        )
        .join('')}</tbody>
    </table>
  </div>
  <span class="compare__tag compare__tag--before mono"><span class="long">${esc(p.compare.before)}</span><span class="short">${esc(p.compare.beforeShort)}</span></span>
  <span class="compare__tag compare__tag--after mono"><span class="long">${esc(p.compare.after)}</span><span class="short">${esc(p.compare.afterShort)}</span></span>
  <span class="compare__handle" aria-hidden="true"><span>⟷</span></span>
  <label class="visually-hidden" for="compare-${p.id}">${esc(p.compare.hint)}</label>
  <input class="compare__range" id="compare-${p.id}" type="range" min="0" max="100" value="50" data-compare-range />
</div>`;
}

function outcomeVisual(p) {
  return `
<div class="outcome">
  ${p.metrics
    .map((m) => {
      const max = Math.max(m.before, m.after);
      const fmt = (v) => `${String(v).replace('.', '.')}${m.unit ? ` ${m.unit}` : ''}`;
      return `
  <div class="metric" data-metric>
    <p class="metric__label mono">${esc(m.label)}</p>
    <p class="metric__value"><span class="metric__before">${esc(fmt(m.before))}</span><span class="metric__arrow" aria-hidden="true">→</span><span class="metric__after">${esc(fmt(m.after))}</span></p>
    <div class="metric__bars" aria-hidden="true">
      <span class="metric__bar metric__bar--before" style="--w:${((m.before / max) * 100).toFixed(1)}%"></span>
      <span class="metric__bar metric__bar--after" style="--w:${((m.after / max) * 100).toFixed(1)}%"></span>
    </div>
  </div>`;
    })
    .join('')}
</div>`;
}

function pipelineVisual(p) {
  // Three lanes fan out from the sorter. Coordinates in a 640 × 320 box.
  const lanes = p.lanes.map((name, i) => ({ name, y: 70 + i * 90 }));
  return `
<figure class="pipeline" data-pipeline aria-hidden="true">
  <svg viewBox="0 0 640 320" preserveAspectRatio="xMidYMid meet">
    <path class="pipeline__track" id="track-in" d="M40 160 H300"/>
    ${lanes.map((l, i) => `<path class="pipeline__track" id="track-${i}" d="M340 160 C400 160 400 ${l.y} 460 ${l.y} H600"/>`).join('')}
    <rect class="pipeline__node" x="300" y="136" width="40" height="48"/>
    <rect class="pipeline__source" x="16" y="138" width="24" height="44"/>
    ${lanes.map((l) => `<line class="pipeline__bin" x1="600.5" x2="600.5" y1="${l.y - 16}" y2="${l.y + 16}"/>`).join('')}
    <g class="pipeline__items" data-items></g>
  </svg>
  <span class="pipeline__label mono" style="left:2.5%;top:62%">${esc(p.source)}</span>
  <span class="pipeline__label mono" style="left:47%;top:62%">${esc(p.sorter)}</span>
  ${lanes.map((l, i) => `<span class="pipeline__lane mono" style="top:${(l.y / 320) * 100}%"><span>${esc(l.name)}</span><b data-count="${i}">0</b></span>`).join('')}
</figure>`;
}

function project(p) {
  const head = `
    <header class="project__head">
      ${ph}
      <h3 class="project__title">${esc(p.title)}</h3>
    </header>`;
  if (p.layout === 'compare') {
    return `
  <article class="project project--compare" id="project-${p.id}">
    ${head}
    ${meta(p)}
    ${compareVisual(p)}
    ${story(p)}
    ${quote(p)}
  </article>`;
  }
  if (p.layout === 'outcome') {
    return `
  <article class="project project--outcome" id="project-${p.id}">
    <div class="project__side">${head}${meta(p)}${story(p)}</div>
    <div class="project__main">${outcomeVisual(p)}${quote(p)}</div>
  </article>`;
  }
  return `
  <article class="project project--pipeline" id="project-${p.id}">
    <div class="project__main">${pipelineVisual(p)}${quote(p)}</div>
    <div class="project__side">${head}${meta(p)}${story(p)}</div>
  </article>`;
}

function workSection() {
  return `
<section class="work" id="work" aria-labelledby="work-title" data-section="${esc(work.label)}">
  ${sectionHead('work', work.label, work.title, `<p class="work__note mono">${esc(work.placeholderNote)}</p>`)}
  ${work.projects.map(project).join('')}
</section>`;
}

/* ---------- contact ---------- */
function contactSection() {
  const f = contact.form;
  return `
<section class="contact" id="contact" aria-labelledby="contact-title" data-section="${esc(contact.label)}">
  <div class="contact__edge" aria-hidden="true" data-reveal>
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M-60 140 L-60 78 L0 74 C120 58 210 40 330 52 C450 64 520 30 650 34 C780 38 840 70 960 62 C1080 54 1150 22 1270 30 C1350 35 1400 48 1440 44 L1500 42 L1500 140 Z"/></svg>
  </div>
  <div class="contact__inner">
    <div class="contact__words">
      ${sectionHead('contact', contact.label, contact.title)}
      <p class="contact__lead">${esc(contact.lead)}</p>
      <p class="contact__mail"><span class="mono">${esc(contact.emailLabel)}</span><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p>
      <p class="contact__status mono" data-status data-tz="${esc(site.location.timeZone)}" data-days="${site.hours.days.join(',')}" data-open="${site.hours.open}" data-close="${site.hours.close}"
         data-open-text="${esc(contact.status.open)}" data-closed-text="${esc(contact.status.closed)}" data-local-text="${esc(contact.status.local)}">
        <span class="contact__dot" aria-hidden="true"></span><span data-status-text>${esc(contact.status.local)}</span>
      </p>
    </div>
    <form class="contact__form" data-contact-form novalidate
          data-email="${esc(site.email)}" data-subject="${esc(f.subject)}" data-sending="${esc(f.sending)}" data-done="${esc(f.done)}">
      <div class="field">
        <label for="f-name">${esc(f.name)}</label>
        <input id="f-name" name="name" autocomplete="name" required aria-describedby="f-name-error" data-error="${esc(f.errors.name)}" />
        <p class="field__error" id="f-name-error" aria-live="polite"></p>
      </div>
      <div class="field">
        <label for="f-email">${esc(f.email)}</label>
        <input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-error" data-error="${esc(f.errors.email)}" />
        <p class="field__error" id="f-email-error" aria-live="polite"></p>
      </div>
      <div class="field">
        <label for="f-company">${esc(f.company)}</label>
        <input id="f-company" name="company" autocomplete="organization" />
      </div>
      <div class="field field--wide">
        <label for="f-message">${esc(f.message)}</label>
        <textarea id="f-message" name="message" rows="5" required aria-describedby="f-message-hint f-message-error" data-error="${esc(f.errors.message)}"></textarea>
        <p class="field__hint mono" id="f-message-hint">${esc(f.messageHint)}</p>
        <p class="field__error" id="f-message-error" aria-live="polite"></p>
      </div>
      <button class="contact__submit" type="submit">${esc(f.submit)}${arrow}</button>
      <p class="contact__result" data-result aria-live="polite"></p>
    </form>
  </div>
</section>`;
}

/* ---------- footer ---------- */
function siteFooter() {
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <a class="site-footer__mark" href="#top" aria-label="${esc(footer.top)}"><img src="/img/w-mark-96.webp" width="48" height="66" alt="" /></a>
  <p class="site-footer__name">© ${year} ${esc(footer.rights)} <span class="mono">${esc(site.kvk)}</span></p>
  <nav class="site-footer__nav" aria-label="Footer">
    <ul role="list">
      ${nav.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.text)}</a></li>`).join('')}
      <li><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></li>
    </ul>
  </nav>
  <p class="site-footer__meta mono"><span>${coord(site.location.lat, site.location.lon)}</span><span>${esc(footer.colophon)}</span></p>
  <a class="site-footer__top mono" href="#top">${esc(footer.top)} <span aria-hidden="true">↑</span></a>
</footer>`;
}

export function renderPage() {
  return `<a class="skip-link" href="#main">Skip to content</a>
${svgDefs()}
${header()}
<main id="main">
${heroSection()}
${servicesSection()}
${workSection()}
${contactSection()}
</main>
${siteFooter()}`;
}
