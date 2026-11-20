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
  email: 'hello@watsof.net', // [PLACEHOLDER] confirm the address you want public
  location: { label: 'Netherlands', lat: 52.13, lon: 5.29, timeZone: 'Europe/Amsterdam' },
  hours: { days: [1, 2, 3, 4, 5], open: 9, close: 17 }, // [PLACEHOLDER] Mon–Fri, 09:00–17:00 Amsterdam time
  kvk: '[PLACEHOLDER] KvK 00000000',
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
    localTime: 'Local time',
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
      stack: 'HTML, CSS, JavaScript, Vite. Django when there is a backend.', // [PLACEHOLDER] check the stack lines
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
      stack: 'Python, SQL and Postgres. Claude and OpenAI models where they earn their place.', // [PLACEHOLDER] check
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
      stack: 'Python, scheduled jobs, webhooks and the APIs of your existing tools.', // [PLACEHOLDER] check
      example: {
        before: 'New leads land in three inboxes and get typed into the CRM by whoever notices.',
        after: 'Every lead is sorted, enriched and assigned before anyone opens their laptop.',
      },
    },
  ],
  labels: { gets: 'You get', stack: 'We use', example: 'For example', before: 'Before', after: 'After' },
};

/*
  Portfolio. Every field below is [PLACEHOLDER]: plausible structure, not real
  clients. Replace client, sector, year, scope, problem, built, outcome,
  metrics and the quote (text, name, role) per project.
*/
export const work = {
  label: 'Selected work',
  title: 'Problems, and what we built for them.',
  placeholderNote: 'Placeholder projects. Real case studies replace these before launch.',
  labels: { client: 'Client', sector: 'Sector', year: 'Year', scope: 'Scope', problem: 'Problem', built: 'What we built', outcome: 'Outcome', placeholder: '[PLACEHOLDER]' },
  projects: [
    {
      id: 'report',
      layout: 'compare',
      title: 'A Monday report that writes itself',
      client: 'Wholesale distributor',
      sector: 'Food wholesale',
      year: '2026',
      scope: 'Data pipeline, dashboard',
      problem: 'Every Monday someone merged four exports in Excel to report last week’s sales. It took half a day, and the numbers changed depending on who did it.',
      built: 'A pipeline that pulls the four sources each night, cleans them with written rules, and feeds one dashboard with the six numbers management actually asks for.',
      outcome: 'The report is ready at 07:00. Half a day a week went back to the person who used to build it.',
      compare: { before: 'Before: four exports, merged by hand', after: 'After: one dashboard, updated nightly', beforeShort: 'Before', afterShort: 'After', hint: 'Drag to compare before and after' },
      quote: { text: 'We stopped arguing about whose numbers were right, because there is only one set now.', name: 'Name', role: 'Operations lead' },
    },
    {
      id: 'website',
      layout: 'outcome',
      title: 'A website that loads before you lose interest',
      client: 'Engineering firm',
      sector: 'Engineering',
      year: '2025',
      scope: 'Design, build, hosting',
      problem: 'A theme-based site with 23 pages nobody maintained, six seconds to load on a phone, and a contact form that went to an old inbox.',
      built: 'A rebuilt site of seven pages, written with the team, designed and coded by hand, with the form going where people actually read it.',
      outcome: 'Faster on every page and found more often in search. The team now edits it themselves.',
      metrics: [
        { label: 'Load time on a phone', before: 6.1, after: 0.9, unit: 's', better: 'lower' },
        { label: 'Pages', before: 23, after: 7, unit: '', better: 'lower' },
        { label: 'Contact requests a month', before: 4, after: 11, unit: '', better: 'higher' },
      ],
      quote: { text: 'It finally looks like the company we are, and we can change it ourselves.', name: 'Name', role: 'Director' },
    },
    {
      id: 'leads',
      layout: 'pipeline',
      title: 'Leads sorted before the first coffee',
      client: 'B2B services company',
      sector: 'Professional services',
      year: '2025',
      scope: 'Automation, AI classification',
      problem: 'Leads arrived through a form, two inboxes and LinkedIn. Some were answered twice, some never.',
      built: 'One intake that collects every lead, has a model sort and summarise it, enriches it with company data, and assigns it in the CRM. A person reviews anything the model is unsure about.',
      outcome: 'No lead waits longer than an hour, and the team stopped keeping a spreadsheet of who replied to whom.',
      lanes: ['Sales', 'Support', 'Spam'],
      source: 'Inbox',
      sorter: 'Sort + enrich',
      quote: { text: 'Monday mornings used to be inbox triage. Now they start with calls.', name: 'Name', role: 'Head of sales' },
    },
  ],
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
