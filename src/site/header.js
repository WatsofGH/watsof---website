/*
  Header: condenses after the first scroll, fills a progress line, names the
  section you are in, marks the matching nav link, and runs the mobile menu.
*/
export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const where = header.querySelector('[data-where]');
  const links = [...document.querySelectorAll('.site-header__nav a, .menu a')];
  const button = header.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  /* condense + progress, one rAF per scroll burst */
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle('is-condensed', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  /* which section is in the middle of the screen */
  const sections = [...document.querySelectorAll('[data-section]')];
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const s = e.target;
      where.textContent = s.id === 'top' ? '' : s.dataset.section;
      links.forEach((a) => {
        const on = a.getAttribute('href') === `#${s.id}`;
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));

  /* mobile menu */
  if (!button || !menu) return;
  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.textContent = open ? button.dataset.close : button.dataset.open;
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) menu.querySelector('a')?.focus();
  };
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setOpen(false); button.focus(); }
  });
  matchMedia('(min-width: 48.01em)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
}
