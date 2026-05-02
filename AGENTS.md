<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ClearPath Token Lock + Hex Exceptions

Brand colors live in `app/globals.css` (`@theme inline` + `:root`). Components consume them via Tailwind class names only (`bg-navy-800`, `text-sage-600`, etc.) — **never** raw hex.

**Locked palette:** `navy-700 / navy-800 / navy-900 / navy-950 · sage-500 / sage-600 · cream-50 · graphite-500 / graphite-600`. Fonts: `font-sans` (Inter), `font-display` (Bricolage Grotesque).

**Approved raw-hex locations (must mirror globals.css 1:1):**
1. `app/globals.css` — primary source.
2. `tailwind.config.ts` — Tailwind v4 keeps this nearly empty; tokens live in CSS @theme.
3. `lib/site.ts` `BRAND` const — TypeScript mirror for non-CSS contexts (Next `themeColor`, Satori OG, JSON-LD structured data, third-party SDK config). Import as `import { BRAND } from '@/lib/site'`.
4. `app/opengraph-image.tsx` — Satori cannot compile Tailwind. Pull from `BRAND` in `lib/site.ts`.
5. Static SVG assets (`app/icon.svg`, `public/*.svg`) — values must match `BRAND`.

**Anywhere else, raw hex fails review.** Reach for the Tailwind class first; reach for `BRAND` only when you can't use a class (theme metadata, image generation, structured data).

# Voice + Mandatory Phrases

Banned words anywhere in rendered code: **leverage, synergy, unlock, transform, revolutioniz(e/ed/ing), cutting-edge, game-changer**. Strip filler like *kind of*. Justin's affirmations (*Yeah, totally. / 100%. / Heck yeah.*) are conversational only — never in formal pages.

Three locked phrases must appear byte-for-byte in the rendered site:

1. `Let me show you how we can set this up together` — How-It-Works section header.
2. `eliminate 5-10 hours of repetitive work every week` — hero standard claim. ASCII hyphen, never en-dash.
3. `This is AI-assisted analysis + Justin's human review and customization.` — global footer disclaimer.

Search-and-replace at your peril; a paraphrase fails the compliance scan.

# Where to read first

- `docs/STACK_NOTES.md` — Next 16 / Tailwind v4 / shadcn / Tally vs Resend / analytics / SEO / Lighthouse cheatsheet.
- `docs/PRICING_DECISION_LOG.md` — pricing-page state and the answer fields the operator fills in.
- `docs/FORM_PIPELINE_PLAYBOOK.md` — paste-ready Tally and Resend code for Sprint 3.
- `docs/DEPLOY.md` — Vercel rollout checklist.
- `content/voice_anchors.md` — verbatim Justin quotes + reusable copy fragments.
- `content/page_voice_audit.md` — per-page voice-fit log; rerun after copy changes.
- `content/copy.ts` — every site string lives here. Components are content-free.
