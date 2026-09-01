# ClearPath website rebuild plan (Fable 5.1, 2026-09-01)

Starting point: `3377e3f045891a21b409bc03cc170b15feb8dc80` on
`feat/fable-5-1-rebuild-2026-09-01`. Live homepage is byte-identical to the
starting `index.html`. Baseline: 213 tests pass.

## 1. Audit

### Strengths worth keeping

- The safety story is real and already enforced by tests: deterministic demo
  engines, `textContent`-only DOM, fail-closed reveals (fallback visible until
  every mount wires), no network or storage paths, the contact-card form with
  no `action`, no `method`, no `name` attributes, and a submit button that
  ships disabled.
- Commercial contract is precise: four offers, four verified Stripe links, one
  Cal.com route, first-charge and renewal disclosures bound to each card.
- Copy voice is human and grounded ("Bring me the messy work.").
- Static, no build, no third-party runtime, local assets only, redirects for
  `/about` and `/justin` in `vercel.json`.
- Pricing picker degrades to three readable panels without JavaScript.

### Weaknesses observed

1. **Length and repetition.** Twelve homepage sections. "You approve, nothing
   sends" is restated in the hero, control panel, pricing "is not" list, fit
   check, FAQ, and final band. "How it starts" and "You stay in control" say
   the same thing from two angles. The Clarity Session gets a full-width card
   plus a three-item "offer path" list that repeats the hero.
2. **Crowded first screen.** The hero holds an eyebrow, h1, decorative line,
   lede, two buttons, a proof card, four benefit chips, a Clarity callout, and
   a note. Four competing calls to action before the first scroll.
3. **Brand mismatch.** The actual ClearPath logo (`clearpath-logo.png`, the
   only social image) is a navy and teal wordmark. The site runs pine and clay,
   the favicon is a navy "C", the contact card uses a pine "JW" monogram. Link
   previews show a brand the site never repeats.
4. **Generic execution.** Rounded white cards with 1 px borders everywhere
   (scenes, capabilities, panels, tiers, FAQ block, hub cards). The one
   distinctive motif, the "mess to clear" line, is hidden on phones.
5. **Mobile navigation.** The header wraps to two rows below ~700 px and is
   sticky, so it eats roughly 100 px of every phone screen. Demo tabs wrap to
   two lines at 320 px.
6. **Social image.** 784 x 1168 portrait PNG at 490 KB. Every preview crops it.
7. **Small gaps.** No skip link on the main pages. `.cite` chips are 28 px
   tall. Anchor targets scroll under the sticky header. Demo pages have no
   direct route to the other two demos. Founder title and AASI background are
   absent from the public story.

## 2. Concept and visual thesis

**Concept: the counter ledger.** ClearPath lives where the paper piles up:
the phone note by the register, the catering email, the invoice waiting for a
yes. The site borrows the honesty of a ledger rather than the gloss of a
dashboard. Every section answers one question an owner asks, in order:
Is this me? Show me. How does it run? What does it cost? Who are you?

**Visual system: paper, ink, teal, clay.**

- Warm paper ground, deep navy ink for type (matches the logo's "Clear"), the
  logo's teal for links, primary actions and "approved" states, clay reserved
  for "a person checks this" flags. Two accent hues, each with a job.
- The wordmark is set in text as **Clear**Path (navy, teal) so every page
  carries the logo without loading an image.
- Ruled rows and numbered ledger entries replace most cards. Cards remain only
  where something is genuinely an object: the hero desk ticket, the demo tool
  frame, the pricing detail panel, the Clarity buy box.
- The **stamp** becomes the signature state: "Approval required" and
  "Approved for demo" chips render as outlined, letter-spaced stamps.
- The "mess to clear" line stays as the hero motif and repeats as a small
  divider glyph.
- Motion is purposeful and finite: hero rise-in, the path drawing once, scroll
  reveals gated behind `home.js`, staged pipeline in the demos. Nothing loops.
  `prefers-reduced-motion` removes all of it.

## 3. Information architecture

### Homepage (10 blocks, down from 12, with less repetition)

1. Header: **Clear**Path mark, nav (Demos, How it works, Pricing, Questions),
   fit-call button. Below 700 px: single 56 px row, a `<details>` menu that
   works without JavaScript, and a short "Free fit call" button.
2. Hero: eyebrow, "Bring me the messy work.", the drawn line, a tight lede with
   the human-check promise, two actions (run a sample, book the call), and the
   desk ticket (explicitly fictional before/after). Under both columns, a
   two-item "ways in" strip: the $395 Clarity Session and implementation tiers.
3. Sound familiar (`#familiar`): three local scenes as ruled entries.
4. See it run (`#see-it-run`): honesty banner, no-JS fallback, three compact
   demos in tabs (stacked tabs below 480 px), each linking to its full page.
5. Capabilities (`#capabilities`): four ruled rows, each pointing at its proof.
6. How it works (`#how`): six numbered steps (Free and Monthly chips) beside a
   sticky "who does what" ledger (what comes off your plate, what always waits
   for you, what you end up with) and the privacy paragraph. Replaces the
   former "How it starts" plus "You stay in control".
7. Start with clarity (`#clarity-session`): the $395 offer, tightened, same
   contracts and legal line. The duplicate offer-path list is removed.
8. Pricing (`#pricing`): guided picker, the monthly "is / is not" pair as two
   ruled lists, after-checkout note, quoted-separately note, then a compact fit
   check (`#fit`).
9. Questions (`#faq`): nine native disclosures, trimmed answers.
10. About (`#about`): portrait, Founder & Principal Consultant, operations
    background including AASI Level III instruction, Ellicottville and Western
    New York. Then the teal final band and footer.

### Demo hub and demo pages

Same header and footer components. Hub: three ruled demo entries plus the
next-step panel. Demo pages keep their tested structure (fallback, shell,
side column, tool, explain split, next panel) and gain a "try another demo"
strip that links the other two demos directly.

### Contact card

Stays a dark, phone-first card. Aligns tokens to the same navy/teal/clay
family, drops the looping gradient blob, button sheen, portrait float and pulse
dot, states the public title, and keeps every intake and fail-closed mechanic
byte-for-byte in behavior. The vCard is not modified.

## 4. Exact changed-path plan

| Path | Change |
| --- | --- |
| `docs/FABLE-5.1-REBUILD-PLAN.md` | this plan (new) |
| `docs/FABLE-5.1-REBUILD-REPORT.md` | final report (new) |
| `index.html` | rebuilt per section 3 |
| `assets/site.css` | rewritten design system, one file, no imports |
| `assets/home.js` | keep reveals, tabs, pricing picker; add menu close on Escape, outside click and link click; add Up/Down arrow aliases for stacked tabs |
| `demos/index.html` | restyled hub, shared header/footer |
| `demos/request-desk/index.html`, `demos/business-brain/index.html`, `demos/website-manager/index.html` | shared header/footer, skip link, "try another demo" strip, copy tightened |
| `justin/card.html` | token alignment, restrained motion, title, copy |
| `og-image.png` | new 1200 x 630 social image composed from the real logo (new) |
| `.vercelignore` | add `docs/` |
| `tests/test_rebuild_architecture.py` | new coverage for the rebuilt architecture |
| `tests/test_storefront.py`, `tests/test_repair_regressions.py`, `tests/test_demos.py`, `tests/test_homepage_tightening.py` | targeted updates only where markup contracts moved (see below) |
| `tests/browser_journeys.mjs` | extended matrix: 320/390/768/1280/1440, all routes, menu, skip link, focus, network log, card privacy |

Unchanged on purpose: `vercel.json`, `justin/justin-whalen.vcf`,
`justin/justin-portrait.webp`, `justin-founder.webp`, `clearpath-logo.png`,
`clearpath-logo.webp`, `favicon.png`, and the three demo engines
`assets/request-desk.js`, `assets/business-brain.js`,
`assets/website-manager.js`.

Existing-test updates limited to: `<main>` gaining `id="main"` for the skip
link (slice markers move from `"<main>"` to `"<main"`), social image metadata
pointing at the new landscape asset, and new-architecture selectors in the
browser harness. No safety, pricing, privacy, link, no-JS, deployment-boundary
or demo-behavior assertion is removed or loosened.

## 5. Responsive, accessibility, performance approach

- Breakpoints: 1100 (four-up to two-up), 900 (two columns to one), 700
  (header collapses to the details menu), 480 (stacked demo tabs, stacked
  pricing choices, single-column prices), 360 (tight pricing boxes).
- Every non-inline control is at least 44 px tall (nav links, menu summary,
  buttons, tabs, choices, cite chips, reset, inputs, summaries). Inline prose
  links get vertical padding so their hit box is at least 44 px without
  changing line rhythm.
- `:focus-visible` is a 3 px clay ring with offset on light surfaces and a
  paper ring on teal and dark surfaces. Skip link on every page. Anchored
  sections get `scroll-margin-top` so the sticky header never covers a target.
- No `opacity:0` rule outside `.js` / `.js-anim` gates; content is fully
  readable with scripts off. All fallbacks stay visible until engines wire.
- Reduced motion removes animations and transitions globally and the demo step
  delay collapses to zero (already in the engines).
- Contrast: body and secondary text at or above 7:1, links and small accents at
  or above 4.5:1 on their background, UI borders at or above 3:1 where they
  carry meaning. Checked numerically before shipping.
- Performance: no fonts, no remote assets, no new scripts. Budgets: `index.html`
  under 60 KB, `site.css` under 60 KB, total JS under 45 KB, social image under
  120 KB, no base64 images.
- Metadata: canonical, Open Graph and Twitter on every indexable page, a
  landscape social image with declared dimensions, JSON-LD limited to published
  facts plus the founder's public title.

## 6. Acceptance matrix

| Area | Check | Gate |
| --- | --- | --- |
| Offers | exact amounts, first charge, renewal text, four Stripe URLs, one Cal.com URL, seven fit-call CTAs in the same surfaces | python + browser DOM text |
| Safety copy | human approval stated; no autonomous sending, publishing, purchasing, charging, filing claims; demos labeled fictional, local, no AI model, nothing sent or saved | python |
| Demo behavior | RD pipeline to gate, approve, reset; BB cite, cannot-confirm, inert typed markup; WM draft, approve, publish (demo), reset | browser |
| No-JS | homepage fallback visible, three pricing panels readable, demo fallbacks visible, card submit disabled | browser scripts off |
| Responsive | 320, 390, 768, 1280, 1440 on `/`, `/demos/`, three demos, card: no horizontal overflow | browser sweep |
| Navigation | details menu opens without JS, closes on Escape with JS, Demos reachable at 390 | browser |
| Keyboard | skip link first tab stop, tab lists arrow contract, pricing tabs, focus ring visible on buttons and links | browser |
| Sticky | anchor target top sits below the header after hash navigation | browser |
| Reduced motion | zero running animations after load; pipeline completes under 2 s | browser |
| Network | every request same-origin and 200; no console errors; all images loaded | browser |
| Privacy | card intake: no action, method, or name; submit navigates only to `mailto:`; no query string; nothing else requested | python + browser |
| Deploy boundary | `.vercelignore` covers `*.md`, `tests/`, `docs/`; only expected file types ship | python |
| Metadata | canonical per page, OG/Twitter, social image exists with matching declared size | python |

## 7. Preserved contracts

- Offers, amounts, first-charge and renewal disclosures, checkout labels and
  URLs, the fit-call URL, the "before you click" scope notes with their
  `aria-describedby` wiring, "Charged today" sentences.
- Human approval first-class; no autonomous sending, publishing, purchasing,
  charging, filing, or live-system change claims.
- No invented clients, testimonials, metrics, outcomes, certifications beyond
  the stated background, awards, or partnerships.
- Demo honesty: fictional data, browser-local, no AI model, nothing sent or
  saved, approved-source citations and cannot-confirm in Business Brain, draft,
  approval, publish-demo, reset, inert text everywhere.
- Identity: Justin Whalen, Founder & Principal Consultant,
  `JWhalen@ClearPathWV.com`, Ellicottville, New York, serving Western New York.
  vCard fields untouched; `/about` and `/justin` redirects untouched.
- Static Vercel site, no build, no frameworks, no serverless, no trackers, no
  cookies, no remote fonts, no CDNs. No commit, push, deploy, or external
  mutation.
- Retired offers and routes stay retired. No em dashes in public copy.

## 8. Non-goals

- No framework, bundler, or build step.
- No new offers, discounts, or pricing changes.
- No analytics, forms that transmit, chat widgets, or newsletter capture.
- No blog, case studies, or testimonials (none exist).
- No change to the demo engines' logic or data.
- No new personal information about the founder beyond the public title and
  the stated operations background.
