# ClearPath website rebuild report (Fable 5.1, 2026-09-01)

Worktree: `/Volumes/WV-FAST-2TB/Controller/ClearPath-Fable51-Rebuild-2026-09-01/worktree`
Branch: `feat/fable-5-1-rebuild-2026-09-01`, started from
`3377e3f045891a21b409bc03cc170b15feb8dc80`. All work is uncommitted for
controller inspection. Evidence lives outside the worktree at
`/Volumes/WV-FAST-2TB/Controller/ClearPath-Fable51-Rebuild-2026-09-01/evidence/`.

## 1. Final concept and rationale

**The counter ledger.** The site now reads like the honest paperwork of a
well-run counter rather than a software dashboard. Each homepage block answers
one owner question in order: Is this me? Show me. How does it run? What does it
cost? Who are you?

**Visual system: paper, ink, teal, clay.** The audit found that the real
ClearPath logo (the only social image) is a navy and teal wordmark while the
site ran an unrelated pine and clay palette. The rebuild aligns the site to
the logo: navy ink for type, the logo's teal for links, primary actions and
"approved" states, and clay reserved for anything a person still checks. The
wordmark is set as text (Clear in navy, Path in teal with the logo's underline
and dot), so every page carries the brand without loading an image.

Ruled ledger rows replace most cards. Cards remain only for real objects: the
hero desk ticket, the demo tool frame, the pricing detail panel and the Clarity
buy box. Approval states render as outlined stamps ("Approval required",
"Approved for demo"), which turns the site's core promise into its signature
visual. Motion is finite and gated: hero rise-in, the path drawing once, scroll
reveals that only apply while `home.js` is alive, staged demo pipelines.
Nothing loops on any page, including the contact card, where the drifting
gradient blob, button sheen, portrait float and pulse dot were removed.

**Information architecture.** Twelve homepage sections became ten blocks plus
the final band. "How it starts" and "You stay in control" merged into one
section: six numbered steps beside a "who does what" ledger. The duplicate
offer-path list and the hero benefit chips were removed. A two-item "ways in"
strip under the hero now shows the $395 Clarity Session and the $1,500 setup
plus $500 per month entry point at a glance. A `<details>` menu that works
without JavaScript replaced the wrapping two-row phone header.

Measured against the starting commit served locally (same Chrome, same
viewports):

| Measure | Baseline 3377e3f | Rebuild |
| --- | --- | --- |
| Homepage height at 390 px | 18,263 px | 16,342 px |
| Homepage height at 1280 px | 10,909 px | 9,712 px |
| Homepage words | 2,259 | 2,221 |
| First homepage button top at 390 px | 521 px | 404 px |
| Header rows at 390 px | 2 (sticky) | 1 (56 px) |
| Social image | 784 x 1168 portrait, 490 KB | 1200 x 630 landscape, 96 KB |

## 2. Changed paths

| Path | Change |
| --- | --- |
| `index.html` | rebuilt: skip link, shared header with phone menu, hero with desk ticket and ways strip, ruled scenes, demo surface (three compact demos unchanged in behavior), capability ledger, merged how-it-works and who-does-what ledger, Clarity Session, pricing picker with monthly is/is-not lists, fit check, nine FAQ items, about with public title, final band, footer |
| `assets/site.css` | rewritten design system (no imports, no fonts, no `url()`); after the controller accessibility repair, inline prose links carry no hit-box padding and the stage connector line is a border (section 9) |
| `assets/home.js` | kept reveals, tab lists and pricing picker; added phone-menu close on Escape, outside click and link click; header shadow on scroll; ArrowUp and ArrowDown for stacked tabs |
| `demos/index.html` | shared header and footer, ruled three-entry hub |
| `demos/request-desk/index.html`, `demos/business-brain/index.html`, `demos/website-manager/index.html` | shared header and footer, skip link, "try another demo" strip (a labeled paragraph after section 9); demo markup, ids, roles and copy contracts unchanged |
| `justin/card.html` | navy and teal tokens, finite motion only, public title, refreshed about copy, links to the demos and pricing; every intake and fail-closed mechanic unchanged; after section 9 the actions container is a named group and the fields use a 3:1 boundary ring |
| `og-image.png` | new 1200 x 630 social image composed from the real logo crop (95,846 bytes) |
| `.vercelignore` | added `docs/` |
| `docs/FABLE-5.1-REBUILD-PLAN.md`, `docs/FABLE-5.1-REBUILD-REPORT.md` | plan and this report |
| `tests/test_rebuild_architecture.py` | 47 new tests for the rebuilt architecture (40 from the rebuild, 7 from the accessibility repair in section 9) |
| `tests/test_storefront.py` | header slice marker `"<main>"` to `"<main"` because `<main>` now carries `id="main"` |
| `tests/test_demos.py` | brand token assertion `--pine:` to `--teal:` (deliberate brand alignment with the logo) |
| `tests/browser_journeys.mjs` | extended matrix (see section 5); the target-size scan applies the WCAG inline-link exception after section 9 |

Unchanged: `vercel.json`, `justin/justin-whalen.vcf`, `justin/justin-portrait.webp`,
`justin-founder.webp`, `clearpath-logo.png`, `clearpath-logo.webp`,
`favicon.png`, `assets/request-desk.js`, `assets/business-brain.js`,
`assets/website-manager.js`.

No safety, pricing, privacy, link, no-JS, deployment-boundary or demo-behavior
assertion was removed or loosened. The two existing-test edits above are the
only changes to prior test files.

## 3. Commands and outcomes

Workspace proof before the first write:

```
pwd                      /Volumes/WV-FAST-2TB/Controller/ClearPath-Fable51-Rebuild-2026-09-01/worktree
git rev-parse HEAD       3377e3f045891a21b409bc03cc170b15feb8dc80
git branch --show-current feat/fable-5-1-rebuild-2026-09-01
git status --porcelain   (clean)
```

Live site, read-only with curl at the start: `/`, `/demos/`, the three demo
routes, `/justin/card.html` and `/assets/site.css` returned 200; `/about` and
`/justin` returned 308 to `/#about` and `/justin/card.html`; `/tests/`,
`/docs/` and `/README.md` returned 404.

Unit tests (Python 3.11, standard library only):

```
python -m unittest discover tests -v
Ran 253 tests ... OK        (end of the rebuild: baseline 213 plus 40 new)
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover tests -v
Ran 260 tests ... OK        (final, after the accessibility repair in section 9)
```

Browser harness (loopback server owned by this run, stopped after each run):

```
python3 -m http.server <free port> --bind 127.0.0.1 --directory <worktree>
CLEARPATH_BROWSER_OUT=<evidence> node tests/browser_journeys.mjs http://127.0.0.1:<port>
```

| Run | Result | What it caught |
| --- | --- | --- |
| 1 | aborted | phone menu dropdown overflowed the left edge; inline links measured 38 to 39 px; pointer helper stalled under scripts-off |
| 2 | aborted | pointer helper against the sticky pricing column |
| 3 | 289 / 306 | 39 px wide footer "Home" link; header wrapped at 320 and 768; `mailto:` intent counted as a network request |
| 4 | 306 / 306 | step paragraphs had fallen into the number column (fixed before this run) |
| 5 | 306 / 306 | after header nowrap under 900 px and a taller full-page capture cap |
| 6 | 306 / 306 | after shortening the phone eyebrow |
| 7 | 306 / 306 | after removing scroll-reveal from pricing panels |
| 8 | 306 / 306 | after correcting contrast comments in the card stylesheet (end of the rebuild) |
| 9 | 306 / 306 | accessibility repair applied (section 9) |
| 10 | 306 / 306 | final, after the last repair edit; Pa11y run 2 reported 0 issues on the same tree |

Logs: `evidence/browser-run-1.log` through `evidence/browser-run-10.log`,
`evidence/server-run-N.log`. Baseline comparison: `evidence/scratch/measure.mjs`
against `evidence/scratch/baseline/` (a `git archive` of 3377e3f).

Social image: `evidence/scratch/og.html` rendered by headless Chrome over the
DevTools protocol (`evidence/scratch/render.mjs`), copied to `og-image.png`.

## 4. Test counts

- Python: 260 tests, all passing (`PYTHONDONTWRITEBYTECODE=1 python -m unittest
  discover tests -v`, `evidence/unit-a11y-run-2.log`). Per module as run with
  `python -m unittest tests.<module>`: test_storefront 21,
  test_repair_regressions 58, test_demos 107, test_homepage_tightening 24,
  test_pricing_picker 3, test_rebuild_architecture 47 (new; 40 from the
  rebuild plus 7 from the accessibility repair).
- Browser: 306 recorded checks, all passing in the final run
  (`evidence/browser-run-10.log`).
- Pa11y 9.0.1 (axe and HTML CodeSniffer, WCAG2AA): 0 issues across the seven
  controller cases (`evidence/pa11y-run-2.log`).

## 5. Browser matrix and screenshots

Chrome 152 headless, DevTools protocol, 127.0.0.1 only. Screenshots in
`evidence/screenshots/` (31 files):

| Area | Checks | Screenshots |
| --- | --- | --- |
| Homepage 1280 | title, surface reveal, hero proof and ways strip, wordmark colors, skip link on first Tab, 3 px focus ring, anchor clearance for `#pricing` and `#how`, images loaded, no overflow, 44 px targets, four Stripe URLs, seven Cal.com CTAs, verbatim first-charge and renewal text, pricing picker pointer and keyboard (ArrowRight, ArrowDown, Home), Request Desk, Business Brain and Site Manager compact journeys, tab list arrows including ArrowUp, console and network clean | `home-1280-hero.png`, `pricing-1280.png`, `home-1280-demo-approved.png`, `home-1280-demo-focus.png`, `home-1280-full.png` |
| Homepage 1440, 768 | no overflow, targets, inline links visible at 768 | `home-1440-hero.png`, `home-1440-how.png`, `home-768-top.png`, `pricing-768.png` |
| Homepage 390 | proof enters first screen, header one row, phone menu opens by real pointer, closes on Escape with focus back on the button, closes after choosing a section, stacked demo tabs, pricing pointer selection and price pair on one row, Request Desk journey | `home-390-firstscreen.png`, `home-390-menu-open.png`, `pricing-390.png`, `home-390-full.png` |
| Homepage 320 | targets, menu, pricing boxes, demo tabs | `home-320-top.png`, `home-320-menu.png`, `pricing-320.png`, `home-320-demo.png` |
| Reduced motion | zero running animations after load, pipeline under 2 s, content visible | (assertions) |
| Scripts off | fallback visible and shell hidden, content readable, three pricing panels readable, native menu opens, demo page fallback, card submit stays disabled and Enter navigates nowhere | `home-nojs-390.png`, `home-nojs-390-menu.png` |
| Demo hub | three routes, targets, console and network | `hub-1280-full.png`, `hub-390-full.png` |
| Request Desk | keyboard sample selection, web-form pipeline, approval, focus to reset, reset, other-demo links | `rd-1280-approved-full.png`, `rd-390-full.png` |
| Business Brain | typed question cited, typed text never leaves the page, cannot-confirm, inert markup, preset approval, source highlight, reset | `bb-1280-approved-full.png`, `bb-390-full.png` |
| Website Manager | draft, summary, approve, publish (demo), inert markup, reset | `wm-1280-published-full.png`, `wm-390-full.png` |
| Contact card | submit enabled only by script, no action/method/name, public title, Send to Justin requests only a `mailto:` draft carrying the typed text, nothing in the URL or on the network, Enter routes to the same draft, no looping animations, action bar hidden on wide screens | `card-390.png`, `card-390-full.png`, `card-1280.png`, `card-320.png` |
| Width sweep | 320, 390, 768, 1280, 1440 on all six routes: no overflow, console clean, every request same-origin and successful, pricing containment, header single row | (assertions) |

## 6. Accessibility and performance observations

- Skip link on every main page, first in tab order, visible on focus.
- Focus ring: 3 px clay outline with offset on light surfaces, paper on the teal
  band and the dark ledger column.
- Targets: every standalone control (buttons, tabs, menu, nav and footer
  links, choices, cite chips, reset, inputs, summaries) measured at least 44 by
  44 px on every page at 320, 390, 768, 1280 and 1440. Links inside sentences
  keep their natural line box under the WCAG 2.5.8 and 2.5.5 inline exception;
  the harness counts them separately. The rebuild's earlier padded inline links
  were reversed in the accessibility repair (section 9) because the enlarged
  boxes overlapped neighbouring text.
- Contrast (computed): ink on paper 15.9:1, secondary text 7.3:1 on paper and
  6.6:1 on the deeper band, small teal text 5.9:1 on paper and 5.4:1 on the
  band, white on teal buttons 5.1:1, paper on the teal band 6.9:1, clay used
  only for borders and large marks (3.9:1) with its dark variant (9.2:1) for
  small text. Card: paper text 15.9:1, dim text 11.4:1, faint text 7.2:1,
  dark text on the teal button 7.1:1, teal accent text 9.6:1, clay accent
  7.8:1.
- Reduced motion removes every animation and transition; the demo step delay
  collapses to zero; the card packet rests at its final position.
- `prefers-contrast: more` and `forced-colors: active` rules retained and
  extended to the menu and stamps.
- The phone menu is a native `<details>`: it opens without JavaScript; script
  only adds Escape, outside-click and after-navigation closing.
- Anchored sections carry `scroll-margin-top`, verified so targets land below
  the sticky header.
- Weight: `index.html` 54.9 KB, `site.css` 44.9 KB, all JavaScript 37.2 KB,
  founder image 43 KB, favicon 1.5 KB; no fonts, no remote requests, no
  base64 payloads. First-load transfer at 390 px measured 183 KB
  uncompressed against 174 KB for the baseline; the difference is the larger
  stylesheet and script, which Vercel serves compressed.
- Metadata: canonical, Open Graph and Twitter on every page, one landscape
  social image with declared 1200 x 630 dimensions, JSON-LD limited to
  published facts plus the founder's public title.

## 7. Known limitations and follow-ups

- The homepage is still long on phones (16,342 px at 390, 11 percent shorter
  than the baseline). A materially shorter homepage would mean moving the FAQ
  and fit check to a secondary page; that is the owner's call.
- The vCard was left byte-identical, so its `TITLE` remains "Founder". Updating
  it to the public title would need a `REV` bump.
- `clearpath-logo.png` (490 KB) stays in the tree as the JSON-LD logo and for
  any external references; no page loads it. A smaller export could replace it.
- Verified in Chrome only. Safari and Firefox were not run; the CSS avoids
  newer features.
- The plan document (section 5 of `docs/FABLE-5.1-REBUILD-PLAN.md`) still
  describes padded inline links; that intent was reversed by the accessibility
  repair and the plan is left as the historical record.
- Below 360 px the menu button is icon-only with an explicit "Menu" label.
- The browser harness depends on the local Chrome path, as before.
- Business Brain and the compact demos are unchanged engines; their copy and
  rules were not revisited.

## 8. Confirmation of boundaries

- No commit, push, deployment, Vercel action, DNS change, account login,
  credential use, form submission, customer-data capture or analytics was
  performed.
- No checkout or booking product was visited, test-submitted, altered or
  replaced. Stripe and Cal.com URLs were inspected statically only; the harness
  asserts that every browser request stayed on 127.0.0.1.
- The live site was inspected read-only with curl at the start of the run.
- All writes stayed inside the worktree except run evidence and scratch files
  under the controller's `evidence/` directory as the brief required.
- Every local server and browser process started by this run was stopped;
  the final process check found none.

## 9. Controller accessibility repair (2026-09-01)

Performed in the same worktree at the same HEAD and branch, on the uncommitted
candidate above, with no replanning.

### Receipt

Pa11y 9.0.1 (axe-core 4.10.3 and HTML CodeSniffer, WCAG2AA) over six routes at
390 px plus the homepage at 1280 px reported 15 issue instances. The original
receipt is preserved as `evidence/controller-pa11y.initial.json` and
`evidence/controller-pa11y.initial.log`.

| Instances | Case | Element | Code |
| --- | --- | --- | --- |
| 1, 2 | 390 `/` | `#hero-proof > p` and its first link | color-contrast |
| 3, 4 | 390 `/` | first two `.stage-title` in `#panel-rd` | color-contrast |
| 5 | 390 `/demos/request-desk/` | `div.other-demos[aria-label]` | aria-prohibited-attr |
| 6, 7 | 390 `/demos/request-desk/` | first two `.stage-title` in `#demo-shell` | color-contrast |
| 8 | 390 `/demos/business-brain/` | `div.other-demos[aria-label]` | aria-prohibited-attr |
| 9 | 390 `/demos/website-manager/` | `div.other-demos[aria-label]` | aria-prohibited-attr |
| 10 | 390 `/justin/card.html` | `#actions` | aria-prohibited-attr |
| 11 | 390 `/justin/card.html` | `#i-problem` | color-contrast |
| 12 to 15 | 1280 `/` | the same four homepage elements as 1 to 4 | color-contrast |

### Diagnosis

Running axe-core directly over the DevTools protocol
(`evidence/scratch/axe-probe.mjs`, `evidence/scratch/axe-stack.mjs`) showed
that no contrast row was a color failure. Each was an axe "incomplete" result
that Pa11y reports as an error, for these reasons:

- `bgOverlap` on the proof note and its first link: the rebuild's inline-link
  hit-box padding made link boxes on adjacent lines overlap the paragraph
  text, so axe could not determine a background.
- `pseudoContent` on the two shortest stage titles: the stage connector was an
  absolutely positioned pseudo-element with a fill; at 2 px by roughly 213 px
  it exceeded a quarter of those two title boxes, which is axe's threshold.
- `elmPartiallyObscured` on the textarea: a textarea scrolls
  (`overflow: auto`), so axe compares its text box with `scrollHeight`, which
  excludes the 1 px border. A bordered textarea therefore never fully contains
  its own box (96 px box, 94 px scroll box). The inputs pass because Chrome
  gives them `overflow: clip`.
- `aria-prohibited-attr`: `aria-label` on plain `div` elements, which have the
  generic role.

### Fixes

- `assets/site.css`: removed the `p a, li a` vertical padding rule. Inline
  links inside sentences are exempt from WCAG 2.5.8 and 2.5.5, and every
  standalone control still reserves 44 px. The stage connector is now a
  zero-width pseudo-element with `border-left: 2px solid var(--line)` and a
  transparent background: the same 2 px line on screen, and the stage titles
  keep their ink, teal (done) and clay (active) state colors.
- `demos/request-desk/index.html`, `demos/business-brain/index.html`,
  `demos/website-manager/index.html`: the "Try another demo" strip is a
  `<p class="other-demos">` whose visible label precedes the two links. No
  ARIA attribute is needed.
- `justin/card.html`: the actions container is `role="group"` with its label
  (it is the skip-link target, so the name is useful). Fields use a new
  `--field-line` token (white at 0.36 alpha: 3.7:1 against the page and 3.2:1
  against the field, up from 2.0:1 and 1.7:1). The textarea draws its boundary
  as an inset ring with `border: 0`, so its scroll box equals its painted box;
  the focus state redraws the ring in the focus color; `prefers-contrast: more`
  draws it white; forced-colors keeps a real border. Entered text stays at
  13.9:1 and the placeholder token at 6.3:1 on the field.
- `tests/browser_journeys.mjs`: the target-size scan applies the inline
  exception to links whose computed display is inline inside text containers
  and reports the exempt count; the check count stays at 306.

### Regression tests

`tests/test_rebuild_architecture.py` grew from 40 to 47 tests:

- inline prose links carry no `padding-block` (replaces the earlier test that
  required the padding);
- `aria-label` may appear only on elements that accept a name or carry an
  allowed role, checked across all six pages;
- the other-demos strip is a labeled paragraph with two links;
- the card actions container is a named group;
- the stage connector is a border, not a filled pseudo-element, and the
  title state colors are unchanged;
- proof-note and stage-title token colors reach at least 4.5:1 on the card and
  on paper, computed from the stylesheet tokens;
- the textarea rule and its focus rule draw the inset ring;
- card entered text, placeholder token and boundary ring meet 4.5:1 and 3:1,
  computed from the card tokens.

No safety, privacy, pricing, no-JS, demo or deployment-boundary test was
changed. The Business Brain question form was not touched: it is intentionally
inert and already covered by its own no-submission and no-network tests.

### Verification after the final source edit

```
PYTHONDONTWRITEBYTECODE=1 python -m unittest discover tests -v   Ran 260 tests ... OK
node tests/browser_journeys.mjs (run 10)                          PASS 306 / 306
node evidence/controller-pa11y.cjs (run 2, port 28763)            PA11Y_TOTAL_ISSUES=0
```

Pa11y per case: `/`, `/demos/`, `/demos/request-desk/`,
`/demos/business-brain/`, `/demos/website-manager/`, `/justin/card.html` at
390 px and `/` at 1280 px, all `issues=0` (`evidence/pa11y-run-2.log`,
`evidence/controller-pa11y.run-2.json`; `evidence/controller-pa11y.json` is
overwritten by the script and now holds the passing run). Screenshots
re-inspected after the repair: `home-1280-hero.png`, `rd-390-full.png`,
`card-390-full.png`. Every server and headless browser started by the repair
was stopped; the final check found none. The candidate remains uncommitted.
