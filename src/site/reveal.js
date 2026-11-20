/*
  Adds .is-in once an element scrolls into view. CSS (motion.css) decides
  what that means; under reduced motion nothing is hidden to begin with.
*/
export function initReveal() {
  const els = document.querySelectorAll('[data-lift], [data-draw], [data-metric], [data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
  els.forEach((el) => io.observe(el));
}
