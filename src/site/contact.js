/*
  Contact: the "are we at our desks" line, and a form that validates and then
  opens the visitor's mail app with the message filled in. No server needed;
  swap submit() for a fetch() to a form endpoint when there is one.
*/
function initStatus(el) {
  const tz = el.dataset.tz;
  const days = el.dataset.days.split(',').map(Number);
  const open = Number(el.dataset.open);
  const close = Number(el.dataset.close);
  const text = el.querySelector('[data-status-text]');
  const timeFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz });
  const partsFmt = new Intl.DateTimeFormat('en-GB', { weekday: 'short', hour: 'numeric', hourCycle: 'h23', timeZone: tz });
  const dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  const tick = () => {
    const now = new Date();
    const parts = Object.fromEntries(partsFmt.formatToParts(now).map((p) => [p.type, p.value]));
    const day = dayIndex[parts.weekday];
    const hour = Number(parts.hour);
    const isOpen = days.includes(day) && hour >= open && hour < close;
    el.classList.toggle('is-open', isOpen);
    const time = timeFmt.format(now);
    text.textContent = isOpen
      ? `${el.dataset.openText} · ${time} ${el.dataset.localText.toLowerCase()}`
      : `${el.dataset.closedText} ${String(open).padStart(2, '0')}:00 · ${time} ${el.dataset.localText.toLowerCase()}`;
  };
  tick();
  setInterval(tick, 30_000);
}

function initForm(form) {
  const fields = [...form.querySelectorAll('input[required], textarea[required]')];
  const result = form.querySelector('[data-result]');
  const button = form.querySelector('button[type="submit"]');

  const check = (input) => {
    const error = form.querySelector(`#${input.id}-error`);
    const value = input.value.trim();
    let ok = value.length > 0;
    if (ok && input.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    input.setAttribute('aria-invalid', String(!ok));
    if (error) error.textContent = ok ? '' : input.dataset.error;
    return ok;
  };

  fields.forEach((input) => {
    input.addEventListener('blur', () => { if (input.value) check(input); });
    input.addEventListener('input', () => { if (input.getAttribute('aria-invalid') === 'true') check(input); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = fields.filter((f) => !check(f));
    if (bad.length) { bad[0].focus(); return; }

    const data = Object.fromEntries(new FormData(form));
    const subject = `${form.dataset.subject} ${data.name}${data.company ? `, ${data.company}` : ''}`;
    const body = `${data.message}\n\n${data.name}${data.company ? `\n${data.company}` : ''}\n${data.email}`;
    const href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    button.disabled = true;
    result.textContent = form.dataset.sending;
    window.location.href = href;
    setTimeout(() => {
      button.disabled = false;
      result.innerHTML = '';
      result.append(`${form.dataset.done} `);
      const a = Object.assign(document.createElement('a'), { href: `mailto:${form.dataset.email}`, textContent: form.dataset.email });
      result.append(a, '.');
    }, 900);
  });
}

export function initContact() {
  document.querySelectorAll('[data-status]').forEach(initStatus);
  document.querySelectorAll('[data-contact-form]').forEach(initForm);
}
