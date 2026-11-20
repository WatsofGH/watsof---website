/*
  All site copy lives here, so it can be edited and translated in one place.

  Voice: "we". Plain, specific, a little dry. Never mention team size.
  Banned: elevate, seamless, unlock, empower, cutting-edge, leverage, robust,
  journey, "in today's fast-paced world", "not X, but Y", exclamation marks.

  Anything marked [PLACEHOLDER] must be replaced before launch.
  The full list is in README.md under "Before launch".
*/

export const site = {
  lang: 'en',
  name: 'Watsof',
  email: 'silas.p.postma@gmail.com',
  location: { label: 'Netherlands', vantage: 'Amsterdam', lat: 52.13, lon: 5.29, timeZone: 'Europe/Amsterdam' },
  hours: { days: [1, 2, 3, 4, 5], open: 9, close: 17 }, // [PLACEHOLDER] Mon–Fri, 09:00–17:00 Amsterdam time
  kvk: 'KvK 99347172',
  description:
    'Watsof builds websites, data pipelines and automations for companies whose work has outgrown the spreadsheet.',
};

export const nav = {
  label: 'Main',
  links: [
    { href: '#services', text: 'Services' },
    { href: '#work', text: 'Work' },
    { href: '#contact', text: 'Contact' },
  ],
  cta: { href: '#contact', text: 'Talk to us' },
  menu: 'Menu',
  close: 'Close',
};

export const hero = {
  titleLines: ['Messy work in.', 'Working systems out.'],
  lede:
    'Watsof builds websites, data pipelines and automations for companies whose work has outgrown the spreadsheet.',
  cta: { href: '#contact', text: 'Send us the spreadsheet you hate' },
  hintPointer: 'Move across the fog. Whatever you paint gets measured.',
  hintTouch: 'Swipe sideways across the fog to paint.',
  readout: {
    vantage: 'Vantage',
    strokes: 'Strokes',
    reduction: 'Samples → vertices',
  },
};

export const services = {
  label: 'What we do',
  title: 'We build the parts that keep running.',
  intro:
    'We start with the actual files and the people who use them. Then we build the smallest thing that removes the mess, and we stay to keep it working.',
  items: [
    {
      id: 'websites',
      name: 'Websites',
      lead: 'Fast, plain websites that say what you do and are easy to change. Designed and built by hand, so there is no theme to fight and nothing you pay for twice.',
      gets: [
        'Design and build, from first sketch to launch',
        'A content editor, only if you will actually use it',
        'Hosting, domain and analytics set up and handed over',
        'Written notes on how to change things yourself',
      ],
      example: {
        before: 'A theme-built site that takes six seconds to open on a phone and that nobody dares to edit.',
        after: 'A site that opens before the coffee is poured, and that the office can update on a Friday afternoon.',
      },
    },
    {
      id: 'data',
      name: 'Data and AI',
      lead: 'Your data in one place, cleaned, and turned into numbers people trust. AI where it does a job a person should not have to do, with a person checking its work.',
      gets: [
        'Pipelines that pull from your tools on a schedule',
        'Cleaning rules you can read, and a log of what they changed',
        'Dashboards for the few numbers that matter',
        'AI that sorts, summarises or extracts, with checks built in',
      ],
      example: {
        before: 'A weekly Excel report, rebuilt by hand every Monday from four exports.',
        after: 'A pipeline and a dashboard that update themselves at 07:00.',
      },
    },
    {
      id: 'automation',
      name: 'Automation',
      lead: 'The copy-paste between systems, done by software. Invoices into the bookkeeping, form entries into the CRM, a summary in your inbox before the day starts.',
      gets: [
        'A map of where time goes now, before anything is built',
        'Scheduled jobs and webhooks between the tools you already use',
        'Alerts when something fails, sent to a person who can fix it',
        'Monitoring and upkeep after launch',
      ],
      example: {
        before: 'New leads land in three inboxes and get typed into the CRM by whoever notices.',
        after: 'Every lead is sorted, enriched and assigned before anyone opens their laptop.',
      },
    },
  ],
  labels: { gets: 'You get', example: 'For example', before: 'Before', after: 'After' },
};

/*
  Portfolio. Empty for now: with no projects the Work section and its nav
  links are left out of the page. Each project needs:
    { id, layout: 'compare' | 'outcome' | 'pipeline', title, client, sector,
      year, scope, problem, built, outcome, quote: { text, name, role } }
  plus, per layout: compare { before, after, beforeShort, afterShort, hint },
  metrics [{ label, before, after, unit }], or lanes [..], source, sorter.
  The three layouts are in src/render.js (compareVisual, outcomeVisual,
  pipelineVisual); the git history has worked examples (commit 9e26e15).
*/
export const work = {
  label: 'Selected work',
  title: 'Problems, and what we built for them.',
  placeholderNote: '',
  labels: { client: 'Client', sector: 'Sector', year: 'Year', scope: 'Scope', problem: 'Problem', built: 'What we built', outcome: 'Outcome', placeholder: '[PLACEHOLDER]' },
  projects: [],
};

export const contact = {
  label: 'Contact',
  title: 'Send us the messy file.',
  lead: 'Tell us what takes too long, or attach the spreadsheet everyone is afraid of. We read every message and reply with questions or a rough plan. The first conversation is free.',
  emailLabel: 'Or write directly',
  status: {
    open: 'We are at our desks',
    closed: 'We are away, back at',
    local: 'Our time',
  },
  form: {
    name: 'Your name',
    email: 'Email',
    company: 'Company (optional)',
    message: 'What is messy?',
    messageHint: 'A sentence or two is enough. You can send files once we reply.',
    submit: 'Open in your mail app',
    sending: 'Opening your mail app…',
    done: 'Your mail app should now show the message, ready to send. If nothing opened, write to',
    errors: {
      name: 'Add your name, so we know who to reply to.',
      email: 'This email address looks incomplete.',
      message: 'Tell us a little about the problem.',
    },
    subject: 'Messy file: a question from',
  },
};

export const footer = {
  colophon: 'Set in Tourney, Archivo and IBM Plex Mono.',
  top: 'Back to top',
  rights: 'Watsof',
};
