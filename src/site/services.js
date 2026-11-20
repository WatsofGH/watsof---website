/*
  What we do: the service in the middle of the screen is "active", and its
  ridge in the sticky figure darkens and gets measured.
*/
export function initServices() {
  const items = [...document.querySelectorAll('[data-service]')];
  if (!items.length) return;
  const ridges = new Map([...document.querySelectorAll('[data-ridge]')].map((r) => [r.dataset.ridge, r]));
  const labels = new Map([...document.querySelectorAll('[data-ridge-label]')].map((l) => [l.dataset.ridgeLabel, l]));

  const activate = (id) => {
    ridges.forEach((r, key) => r.classList.toggle('is-active', key === id));
    labels.forEach((l, key) => l.classList.toggle('is-active', key === id));
  };
  activate(items[0].dataset.service);

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) activate(e.target.dataset.service);
  }, { rootMargin: '-40% 0px -55% 0px' });
  items.forEach((el) => io.observe(el));
}
