# ClearPath visual identity and motion rules (rebuild 2026-10-16)

Author: Fable 5.1 (website implementation owner). Status: authored for Arlo's visual acceptance. Not reviewed or approved by Wren; no Wren direction was returned, and nothing here is attributed to her.

## 1. Direction in one paragraph

Warm, precise, owner-led editorial. The site should read like a well-kept ledger on a wooden counter: paper ground, navy ink, one teal line that keeps going, and a clay mark wherever a person still decides. It explains recognizable owner problems in plain first-person language, shows prices without ceremony, and never pretends to be a software platform. No robots, no fake dashboards, no gradient-card SaaS template, no blocking intro.

## 2. Brand sources

- Wordmark: `clearpath-logo.png` / `clearpath-logo.webp` (approved). Navy "Clear", teal "Path", teal underline that ends in a dot. The raster has a light grey margin and a tall portrait canvas, so it is shown through a cropping frame (`.logo-crop`) with `mix-blend-mode: darken` on paper surfaces, which makes the light margin disappear without editing the file.
- Header wordmark: a CSS rendition of the same mark (navy/teal, underline and dot) for crisp rendering at 22 to 26 px. The raster appears in the footer, the work page and the video end card.
- Founder: `justin-founder.webp` (approved, 600 x 800, snowy slope portrait). Used once on the homepage About section and once, small, on the contact page. Never cropped into a circle; it stays a photograph.
- The "path mark" (a rule that ends in a dot) is the one decorative motif. It appears as section markers and as the progress line in the video. Nothing else is decorative.

## 3. Color tokens

| Token | Value | Role |
| --- | --- | --- |
| `--paper` | `#F8F5EF` | page ground |
| `--paper-deep` | `#EFEAE0` | alternating bands |
| `--card` | `#FFFFFF` | sheets and tools |
| `--ink` | `#0C1B2E` | headings, body emphasis (logo navy) |
| `--ink-soft` | `#46535F` | body copy, 7.6:1 on paper |
| `--teal` | `#0B7B72` | links, primary buttons, the clear path (logo teal) |
| `--teal-text` | `#0A6A62` | teal text on paper, 5.9:1 |
| `--teal-deep` | `#085F58` | hover, final band |
| `--teal-tint` | `#E1F0EC` | selected / cited surfaces |
| `--clay` | `#B4683A` | "waits for you" marks, focus ring |
| `--clay-ink` | `#6B3312` | clay text, 7.4:1 on paper |
| `--clay-wash` | `#F7E9DC` | approval gate surface |
| `--line` | `#DDD5C6` | hairlines |
| `--line-strong` | `#C9BFAC` | dashed and control borders |

Contrast rule: all body and label text is at least 4.5:1; large headings at least 3:1; buttons use white on `--teal` (4.9:1) or ink on paper. Inverse band (`--teal-deep`) uses paper text at 7.6:1.

## 4. Type

- Headlines: system serif stack (`"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif`), weight 700, tight leading (1.02 to 1.15), negative tracking on display sizes.
- Body: system sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`), 17 px desktop, 16 px phone, line-height 1.6.
- Labels, prices and status chips: system mono (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`), small caps via `letter-spacing: .12em; text-transform: uppercase`.
- No web fonts, no font requests. No emojis. No em dashes in authored copy; sentences stay short.

Scale: h1 clamp(40px, 6vw, 72px); h2 clamp(28px, 3.4vw, 40px); h3 20 to 24 px; lede 19 px; fine print 13.5 to 14.5 px.

## 5. Layout grammar

- Page measure 1120 px, 24 px gutters, 18 px on phones. Reading measure 60 to 72 ch.
- Sections are ruled, not boxed: an ink rule on top, hairline rows inside, numerals in mono. White sheets are reserved for things that behave like objects: the contact brief, the demo tools, pricing entries, the video frame.
- Every page opens with an eyebrow, an h1 and one or two CTAs visible before the fold at 375 x 667. No hero media blocks the CTA.
- Three-path chooser (website / tools / support) is the first module after the hero on the homepage and the backbone of the services page.
- Pricing is a ledger: name and promise left, price right in mono, inclusions as ruled rows. No comparison table, no "most popular" badge, no Buy buttons.
- Footer: cropped raster logo, four short link groups, location line, preview notice.

## 6. Motion rules

1. Content is readable with CSS only and with JavaScript off. Motion classes only hide content when the script that reveals it is alive (`html.js-anim`).
2. Entrance motion is a single 12 px rise and fade, 450 to 700 ms, once per element, staggered at most 60 ms per sibling and never more than 1.2 s total on a screen.
3. No parallax, no scroll hijacking, no looping decoration, no auto-playing video, no audio.
4. State changes inside tools (chips, stages, gates) use 200 to 300 ms color and border transitions only.
5. `prefers-reduced-motion: reduce` removes every animation and transition, shows all content immediately, and the video stays a poster with controls until the visitor presses play.
6. The video is the only timed media: 20 s, silent, explicit controls, `preload="none"`, poster first, transcript always present.
7. Focus is always visible: 3 px clay outline with 3 px offset on every interactive element; paper outline on dark bands.

## 7. Video composition language

- Frame 1280 x 720, paper ground, one "desk sheet" in the centre, mono labels, the persistent line "Fictional demonstration. Not connected to a live client system." at the top, and the logo in the bottom right.
- Five beats, each introduced by a numbered mono label on the path-mark progress line: request arrives, missing detail, draft, owner reviews (Edit / Approve), approved draft and next step.
- Information changes visibly: the extracted facts appear one at a time, the missing detail is flagged in clay, the draft is written out, the owner's choice is pressed, the stamp lands. No decorative dashboards, no fake graphs.
- Final frame carries "Approved draft. Ready for the next step." and "A clearer next step. You stay in charge." Nothing is "sent".

## 8. Things this design refuses

Robot or sparkle imagery, hero gradients, carousels, pop-ups, cookie theater, countdowns, testimonial walls (none exist), stock photography, invented metrics, comparison tables, badges that rank the offers, and any wording that implies ClearPath is a staffed team or an AI platform.
