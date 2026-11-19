/*
  All site copy lives here, so it can be edited and translated in one place.

  Copy rules (see AUDIT.md): plain and specific. No "elevate", "seamless",
  "unlock", "empower", "cutting-edge", "leverage", "robust", "journey",
  "in today's fast-paced world". No "not X, but Y". Few em dashes.
*/

export const site = {
  lang: 'en',
  name: 'Watsof',
  email: 'hello@watsof.net', // [PLACEHOLDER] confirm the address you want public
  location: { label: 'Netherlands', lat: 52.13, lon: 5.29, timeZone: 'Europe/Amsterdam' },
};

export const nav = {
  label: 'Main',
  links: [
    { href: '#services', text: 'Services' },
    { href: '#work', text: 'Work' },
  ],
  cta: { href: '#contact', text: 'Write to me' },
};

export const hero = {
  titleLines: ['Messy work in.', 'Working systems out.'],
  lede:
    'Watsof is a one-person studio in the Netherlands. I build websites, data pipelines and automations for companies whose work has outgrown the spreadsheet.',
  cta: { href: '#contact', text: 'Send me the spreadsheet you hate' },
  hintPointer: 'Move across the fog. Whatever you paint gets measured.',
  hintTouch: 'Swipe sideways across the fog to paint.',
  readout: {
    vantage: 'Vantage',
    localTime: 'Local time',
    strokes: 'Strokes',
    reduction: 'Samples → vertices',
  },
};
