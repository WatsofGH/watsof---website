# AI-giveaway audit

What makes a site read as generated, and what this site does instead. Checked again item by item at the end of Stage 3.

## Type
| Tell | Instead |
|---|---|
| One headline word in italic/serif/script for "emphasis" | One family for headlines, one roman weight per line. Emphasis comes from size and placement only. |
| Gradient-filled headline text | Flat ink `#3D362D`. The only gradient on the site is real pigment in the watercolour. |
| Inter / system UI font | Archivo (variable, wide cut) for text, IBM Plex Mono for the data layer. Both self-hosted. |
| Space Grotesk because "tech brand" | Tested next to the wordmark: its round S/O and quirky y/g fight the octagonal logo. Not used. |
| Tiny headline under a big animation | The headline is set at 9–10vw and sits *inside* the painted scene; the scene is built around it. |

## Colour and surface
| Tell | Instead |
|---|---|
| Purple/indigo→blue gradients | Palette sampled from the supplied watercolour and the painting: fog, slate, pine, logo ink, one rust. |
| Glowing blurred blobs, orbs, glassmorphism | No blur filters, no translucency-over-blur. Depth comes from layered washes and fog, as on paper. |
| Neon on dark, dark mode by default | Light paper base. The one dark surface is pine green, used once, for the contact section. |
| Pure white / pure black | Base `#E9EBEC`, text `#3D362D`. Nothing is `#fff` or `#000`. |
| rounded-2xl on everything, soft shadows | Square corners (radius 0–2px). Edges come from hairlines or from paint. No box-shadows. |

## Layout
| Tell | Instead |
|---|---|
| Centered hero, pill badge, two buttons (filled + ghost) | Left-anchored headline, a mono readout column, one text link to contact. No badge. |
| Three equal icon cards with hover-lift | Services as an editorial index: one row per service, uneven columns, concrete deliverables listed like a spec sheet. |
| Bento grid | Not used. |
| "Trusted by" logo marquee | Not used. There are no client logos to show yet, and faking them is dishonest. |
| Stats row (99% / 10k+ / 24/7) | Not used. The only numbers on the page are real: local time, coordinates, values computed live from your stroke. |
| "How it works" 01/02/03 | Not used. Process is described in two plain sentences where it matters. |
| Every section: centred eyebrow, big H2, grey subtitle, same padding | Sections differ in width, alignment and rhythm. Labels sit in a left margin column like figure captions, not above headings. |
| Perfect symmetry | Asymmetric 12-col grid; content starts on col 2 or 3, readouts hang in the margin. |
| Four-column dead footer, newsletter box | Footer is one row: contact, KvK placeholder, colophon. No newsletter. |

## Motion
| Tell | Instead |
|---|---|
| Fade-up on scroll on every element | Motion lives in the hero and in two small reveals that carry meaning (a project's "before → after"). Everything else is static. |
| Particle fields, floating orbs, neural-network node graphs as "AI" | No particles. The computed layer is survey geometry: hairlines, vertices, bounding boxes, coordinates. |
| Hover-lift / scale on cards | Hover changes a hairline or reveals a value; nothing jumps. |
| Ignoring reduced motion | `prefers-reduced-motion`: a single still painted frame with one finished, dried stroke and its readout. |

## Copy
| Tell | Instead |
|---|---|
| Elevate, seamless, unlock, empower, cutting-edge, leverage, robust | Banned word list kept in `src/content.js` header; copy checked against it. |
| "In today's fast-paced world" openers | Sentences start with the thing: what gets built, for whom. |
| "Not X, but Y" constructions | Avoided. Say the positive thing once. |
| Rule-of-three everywhere | Lists have as many items as are true (2, 4, 5). |
| Em-dash-heavy rhythm | Full stops and commas. |
| Vague claims ("we deliver results") | Specific examples: "a weekly Excel report replaced by a pipeline and a dashboard". |
| "We" pretending to be a team | Watsof is one person, so the copy says "I". (Easy to change in `content.js`.) |

## Trust signals
| Tell | Instead |
|---|---|
| Fake testimonials with invented names, stock avatars, ★★★★★ | Reviews are attached to their project, unmistakably marked `[PLACEHOLDER]` until real ones exist. No stars, no avatars. |
| Lucide/emoji icons as decoration | No icon set. The few glyphs (→, ×, ↗) are type. |

## Added
| Tell | Instead |
|---|---|
| Cursor-follower blob | The cursor does work: it paints, and the paint gets measured. |
| Generic "Get started" CTA | "Write to me" with the actual address visible, and the form says what happens next. |
| Dark-mode toggle, cookie banner for no cookies | No toggle, no tracking, so no banner. |
| Lottie/3D blob hero from a template | A hero that only makes sense for this brand: watercolour from the logo, measured by code. |
