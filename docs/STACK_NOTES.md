# ClearPath Site — Stack Notes (Sprint 1, S1-W1) — **Next 16 edition**

**Author:** Scout 1 · **Date:** 2026-05-02 · **Audience:** Builder 1 (app shell), Builder 2 (forms), Coord 2 (deploy)

> **READ FIRST:** Coord 2's scaffold installed **Next.js 16.2.4 + React 19.2.4 + Tailwind v4 + shadcn 4.6** — NOT Next 15. APIs, defaults, and conventions differ from training-data Next.js. The repo's `AGENTS.md` (referenced from `CLAUDE.md`) instructs agents to read `node_modules/next/dist/docs/` before writing Next-specific code. This file is calibrated to what's actually installed (verified via `package.json` + the bundled docs at `node_modules/next/dist/docs/01-app/`).

> **Token Lock (per Coord 1, do NOT deviate):**
> - Colors via Tailwind class names only — never raw hex: `navy-700 / navy-800 / navy-900 / navy-950` (primary surfaces, body text — `navy-900` added 2026-05-02 for hovers / borders / deep card surfaces), `sage-500 / sage-600` (accent — buttons, links, eyebrows), `cream-50` (page bg), `graphite-500 / graphite-600` (warm gray body).
> - Fonts: **Inter** (body) → CSS var `--font-sans`, class `font-sans`. **Bricolage Grotesque** (display) → `--font-display`, `font-display`.

---

## 1. Next.js 16 App Router gotchas

- **Server Components are the default.** Add `'use client'` only at leaves that need state, effects, browser APIs, or event handlers. For a 6-page marketing site, almost everything is a server component — push interactivity to small client islands (mobile menu, accordion, lazy form-iframe trigger).
- **`metadata` and `generateMetadata` only work in Server Components.** A page with `'use client'` at the top **cannot** export metadata — wrap a client island inside a server page instead.
- **`params` and `searchParams` are Promises.** Pattern is `{ params: Promise<{ slug: string }> }` then `const { slug } = await params`. Same for `searchParams`. Treating them as plain objects throws TS errors and runtime warnings.
- **Turbopack is the default for BOTH `next dev` and `next build` in Next 16** (changed from 15 where Webpack was still the build default). To opt out you'd pass `--webpack`. Don't opt out unless we hit a real blocker — Turbopack is significantly faster and well-tested by 16.2.
- **Cache Components is a NEW opt-in feature** (Next 16, behind `cacheComponents` flag in `next.config.ts`). It changes the caching/streaming model substantially. **DO NOT ENABLE** for our marketing site — the docs explicitly fork into "Caching (Previous Model)" vs Cache Components and our static-content site doesn't need the new model. Stay on the previous model: `fetch` is uncached by default; opt into caching per-request with `{ cache: 'force-cache' }` or per-segment with `export const revalidate = 3600`.
- **`next/image` LCP rules** (unchanged from 15, still load-bearing):
  - Always set `width`/`height` (or `fill` with a sized parent) — prevents CLS.
  - Add `priority` to **the single** above-the-fold LCP image (hero). Skipping this is the #1 cause of bad LCP on Next sites.
  - Always set `sizes` for responsive images (e.g. `sizes="(max-width: 768px) 100vw, 50vw"`) — without it, the browser downloads the largest variant.
  - Default formats include AVIF + WebP automatically; no config needed.
  - Use `placeholder="blur"` only with **static imports** — Next derives `blurDataURL` automatically; runtime generation is wasted work.
- **Default project includes `AGENTS.md` + `CLAUDE.md`.** `create-next-app@16` ships these files to instruct LLM agents to consult `node_modules/next/dist/docs/` before writing code. Honor this — the version-pinned docs are authoritative over anything in pre-cutoff training data.

**RECOMMENDATION: Keep Turbopack as the default (don't opt out). Do NOT enable Cache Components. Push every page to be a server component. Put `priority` on exactly one image per page (the hero). When in doubt about an API, read `node_modules/next/dist/docs/01-app/` first.**

Sources:
- `node_modules/next/dist/docs/01-app/01-getting-started/01-installation.md` — confirms Turbopack + App Router defaults in Next 16
- `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` — confirms Cache Components is opt-in via `cacheComponents` flag
- `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` — `params: Promise<...>` pattern for `generateMetadata`
- [Next.js — Image Component (online)](https://nextjs.org/docs/app/api-reference/components/image)

---

## 2. Tailwind v4 (installed — `tailwindcss ^4`, `@tailwindcss/postcss ^4`)

- **CSS-first configuration.** Theme tokens live in `app/globals.css` via `@theme` (or `@theme inline` to evaluate against existing CSS variables — useful for shadcn's `--background` / `--foreground` variables).
- **A `tailwind.config.ts` already exists in the repo** (`content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}']`). In v4 this file is **not required** — auto content detection handles it. Leave the existing config in place; do NOT extend it with theme tokens (those go in `globals.css`).
- **Colors must be declared in `@theme inline` to map to the locked tokens** (`navy-950` etc.). Pattern:
  ```css
  @theme inline {
    --color-navy-700: oklch(0.32 0.05 250);
    --color-navy-800: oklch(0.26 0.05 250);
    --color-navy-900: oklch(0.22 0.04 250);  /* added 2026-05-02 — hovers / borders / deep cards */
    --color-navy-950: oklch(0.18 0.04 250);
    --color-sage-500: oklch(0.65 0.13 145);
    --color-sage-600: oklch(0.58 0.13 145);
    --color-cream-50:  oklch(0.98 0.01 80);
    --color-graphite-500: oklch(0.55 0.01 80);
    --color-graphite-600: oklch(0.48 0.01 80);
    --font-sans: var(--font-inter);
    --font-display: var(--font-bricolage);
  }
  ```
  Builders can then use `bg-navy-950 text-cream-50 font-display`, `hover:bg-navy-900`, `border-navy-900`, etc.
- **Default palette is OKLCH** in v4 (perceptually uniform). Define brand tokens in OKLCH to match — copy-pasted v3 hex tokens may shift visually next to v4 default colors.
- **Performance:** Oxide engine 2–5× faster builds. Negligible for our 6-page site, but matters for HMR.

**RECOMMENDATION: Define every locked brand token in `@theme inline` inside `app/globals.css`. Use OKLCH values. Do not extend the legacy `tailwind.config.ts` — leave it as a `content`-only stub. Builders use `bg-navy-950` / `text-sage-500` / `font-display` — NEVER raw hex.**

Sources:
- `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` — bundled docs for Tailwind in Next 16
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind upgrade guide](https://tailwindcss.com/docs/upgrade-guide)

---

## 3. shadcn/ui (installed — `shadcn ^4.6.0`, `@base-ui/react ^1.4.1`)

- **shadcn 4.x switched primitive layer from Radix → Base UI** (`@base-ui/react`). Components import from Base UI, not `@radix-ui/*`. Code patterns look very similar; APIs are slightly different — read each component's source after `shadcn add` rather than assuming Radix conventions.
- **Repo's `components.json` is already configured:**
  - `style: "base-nova"` (shadcn 4.x style — Base UI native, modern feel; correct pick for a professional site)
  - `baseColor: "neutral"` (warm-leaning grayscale — we'll override the accent ramp to `sage-500` and surface ramp to `navy-950` via `@theme inline`)
  - `rsc: true`, `tsx: true`, `iconLibrary: "lucide"`
  - aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`
- **Adding components:** `pnpm dlx shadcn@latest add button card input form` (etc.). Copies into `components/ui/`. **You own the code** — version drift is intentional. Pin a snapshot date (today: 2026-05-02) and don't re-pull mid-sprint without reviewing diffs.
- **Locked tokens win.** When a shadcn component uses `bg-primary` or `text-foreground`, that resolves through `@theme inline` overrides in `globals.css`. Never hardcode `bg-blue-900` or raw hex into a copied component.
- **Icons:** `lucide-react ^1.14.0` is installed. Use **named imports per icon** (`import { ArrowRight } from 'lucide-react'`) — never `import * as Icons` (pulls every icon into the bundle).

**RECOMMENDATION: Don't re-init shadcn — `components.json` is correct. Add components with `shadcn@latest add`. Override surface + accent + ring ramps in `@theme inline` so all shadcn primitives auto-pick up the locked navy/sage/cream/graphite tokens. Lucide icons via named imports only.**

Sources:
- `package.json` (verified `shadcn ^4.6.0`, `@base-ui/react ^1.4.1`, `lucide-react ^1.14.0`)
- `components.json` (verified style/baseColor/aliases)
- [shadcn/ui Theming docs](https://ui.shadcn.com/docs/theming)

---

## 4. Tally.so (primary) vs React Hook Form + Resend (fallback)

**Tally.so — primary per LOCKED stack**
- Pros: zero backend code; free unlimited submissions on free tier; embeds via `<iframe>` or `@tally/react` package; built-in Google reCAPTCHA (insert with `/recaptcha` in the form builder) — free for all tiers; webhook/Slack/email/Sheets/Notion integrations on free; conditional logic; can hand off to Calendly after submit.
- Cons: external iframe = small CLS risk and Lighthouse hit unless lazy-loaded; data lives in Tally (export when needed); no native honeypot (rely on reCAPTCHA); Tally branding in URL on free tier.
- Spam protection: **reCAPTCHA v2/v3 free for all tiers**. For low expected volume (<100/day Phase 1), this is sufficient. For a hidden-field honeypot, wrap the embed in a custom div with a CSS-hidden input — Tally doesn't validate it, but a downstream webhook can.
- **Lighthouse mitigation:** mount the iframe lazily on viewport intersection (or behind a `<Dialog>` trigger), not in the initial HTML.

**React Hook Form + Resend — fallback (pre-stage now)**
- Pros: full UX/validation/accessibility control; sub-100ms response; no third-party iframe; better mobile keyboard handling.
- Cons: must run a Server Action / Route Handler to send mail; must own deliverability setup.
- Resend free tier (verified 2026): **100 emails/day, 3,000/month, 1 verified domain.** Pro = $20/mo for 50,000/month. The 100/day cap will hit before the 3,000/month cap.
- Domain verification: Resend issues SPF + DKIM records on a subdomain (e.g. `resend.mail.clearpathai.com`). Add CNAME/TXT at the registrar; propagation up to 24 hrs. **Domain ownership required.**
- Spam protection if we swap: add own honeypot field in the schema + IP rate-limit the Server Action (Upstash Ratelimit is the cleanest edge-compatible option).

**RECOMMENDATION: Ship Tally.so embed for Phase 1 launch — fastest, $0, reCAPTCHA included. Lazy-mount the iframe on viewport intersection. In parallel, **start Resend domain verification NOW** (24-hr DNS propagation) so the swap is one PR if Tally falls short.**

Sources:
- [Tally.so reCAPTCHA help](https://tally.so/help/recaptcha)
- [Resend Pricing 2026](https://resend.com/pricing) · [Resend account quotas & limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits)
- [Resend domain authentication guide](https://resend.com/blog/email-authentication-a-developers-guide)

---

## 5. Privacy-friendly analytics — Plausible vs Vercel Analytics

**Vercel Analytics (Hobby = free)**
- Zero-config: `npm i @vercel/analytics` + `<Analytics />` in root layout. No cookies → no cookie banner needed.
- Captures: pageviews, Web Vitals, top pages/referrers, country (IP-derived then discarded). No PII; GDPR/CCPA compliant by design.
- Hobby limit: ~2.5k events/mo on Hobby. **Collection pauses** when hit (no overage billing, but data goes dark) until next cycle. 3-day grace before pause.
- Lock-in: data lives in Vercel dashboard; no export. If Justin moves off Vercel, historical data is gone.

**Plausible (paid SaaS or self-hosted)**
- Cookie-free; EU-hostable; anonymizes after 24h. Same script tag pattern.
- Pricing: starts ~$9/mo for 10k pageviews, $19/mo for 100k. No free hosted tier. Self-host for free via Docker.
- Captures: pageviews, sources, devices, countries, custom events, goals/conversions, outbound clicks. Better funnel UI than Vercel for marketing work.
- Portable: CSV export anytime; no vendor lock.

Both are GDPR/CCPA compliant out of the box; neither requires a cookie banner.

**RECOMMENDATION: Start with Vercel Analytics (Hobby tier, $0, ships in 5 min, no cookie banner, no PII). Re-evaluate at the 2.5k events/mo wall — when Justin starts running paid ads or a local SEO push, jump to Plausible $9/mo for the export, portability, and funnel UI. Document the swap path in the Justin handoff guide (one component change, one env var).**

Sources:
- [Vercel — Pricing for Web Analytics](https://vercel.com/docs/analytics/limits-and-pricing)
- [Plausible — privacy-focused web analytics](https://plausible.io/privacy-focused-web-analytics)
- [PkgPulse — Vercel vs Plausible vs Umami 2026](https://www.pkgpulse.com/blog/vercel-analytics-vs-plausible-vs-umami-privacy-first-2026)

---

## 6. SEO checklist for a 6-page local-services site

- **`app/sitemap.ts`** — export default function returns `[{ url, lastModified, changeFrequency, priority }]`. Auto-served at `/sitemap.xml`. List all 6 pages explicitly; `priority: 1.0` for `/`, `0.9` for `/contact`, `0.8` for the rest.
- **`app/robots.ts`** — export default function returns `{ rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }], sitemap: 'https://clearpathai.com/sitemap.xml' }`.
- **Root `layout.tsx` metadata** — set `metadataBase: new URL('https://clearpathai.com')`, `title: { template: '%s | ClearPath AI Audit', default: 'ClearPath AI Audit' }`, default `description`, `openGraph`, `twitter` blocks. Per-page `metadata` exports override.
- **JSON-LD with the XSS-safe Next 16 pattern** (per the bundled docs at `02-guides/json-ld.md`): render a `<script type="application/ld+json">` in root `layout.tsx`, and **always escape `<`** to `<` to prevent XSS:
  ```tsx
  <script type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
    }} />
  ```
- **Schema for ClearPath:**
  - `@type: "ProfessionalService"` (better fit than "LocalBusiness" for a consultancy)
  - `name`, `url`, `image`, `description`
  - `address` → `PostalAddress` with `addressLocality: "Olean"`, `addressRegion: "NY"`, `addressCountry: "US"`
  - `areaServed`: `[{ "@type": "City", "name": "Olean" }, { "@type": "AdministrativeArea", "name": "Western New York" }]`
  - `priceRange: "$$"`, `telephone`, `founder: { "@type": "Person", "name": "Justin Whalen" }`
  - Optional: `schema-dts` for typed JSON-LD (`import { ProfessionalService, WithContext } from 'schema-dts'`)
- **Per-page OG images** — `app/opengraph-image.tsx` files using `ImageResponse` from `next/og`. JSX-based; supports custom fonts via `fetch(...).then(r => r.arrayBuffer())`. Static at build time = best perf. Twitter image = same file renamed `twitter-image.tsx`, or share via metadata config.
- **Canonical URLs** — set `alternates: { canonical: '/path' }` in each page's `metadata`. Avoids duplicate-content penalties when Vercel preview URLs accidentally get indexed.
- **Google Business Profile** is the highest-leverage local-SEO channel for "AI consultant near me" queries — outweighs the site itself. Out of scope for the swarm; flag in the Justin handoff guide.

**RECOMMENDATION: Ship `sitemap.ts` + `robots.ts` + a XSS-escaped ProfessionalService JSON-LD in root layout + one `opengraph-image.tsx` per page. Set `metadataBase` in root layout and `canonical` in every page's metadata. Defer Google Business Profile to Justin's post-launch checklist.**

Sources:
- `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` — XSS-safe pattern (bundled, authoritative for Next 16)
- [Next.js docs — sitemap.xml file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js docs — robots.txt file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js docs — opengraph-image and twitter-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image)

---

## 7. Lighthouse 90+ checklist

- **Images**
  - All `<img>` use `next/image`; no raw `<img>` tags.
  - Hero image gets `priority` (never lazy-load LCP).
  - All images have `width`/`height` or sized `fill` parent (zero CLS).
  - All responsive images set `sizes`.
  - AVIF/WebP via `next/image` defaults — no extra config.
- **Fonts**
  - Use `next/font/google` (or `next/font/local`) for both Inter (`--font-sans`) and Bricolage Grotesque (`--font-display`). Auto-preloads, auto-self-hosts, eliminates render-blocking external font requests. Eliminates FOIT/FOUT.
  - Limit to 2 font families (we have exactly 2 — locked).
- **Third-party scripts**
  - All third-party scripts wrapped in `next/script` with `strategy="afterInteractive"` (default for analytics) or `"lazyOnload"` (for chat widgets, Tally embed wrapper if not using `@tally/react`).
  - **NO scripts in the head** — every byte before TTI hurts.
  - Tally iframe must be lazy-mounted (IntersectionObserver or a `<Dialog>` trigger).
- **CSS**
  - Tailwind v4 ships only the classes you use; no separate purge step needed.
  - Inline critical CSS happens automatically with App Router server rendering.
- **JS bundle**
  - Server components by default keeps client JS tiny.
  - Audit any new dep with `npx @next/bundle-analyzer` before shipping.
  - Avoid `lucide-react` `import * as Icons` — pulls every icon. Named imports only.
- **Caching headers**
  - Vercel handles `Cache-Control` for static assets automatically. Don't override unless you know why.
- **Accessibility (folds into Lighthouse score)**
  - Color contrast: verify `sage-500` on `cream-50` and `navy-950` on `cream-50` both clear 4.5:1 body / 3:1 large text. Adjust the OKLCH lightness if not.
  - Every interactive element has a visible focus ring (Tailwind `focus-visible:ring-2 focus-visible:ring-sage-500`).
  - Form fields labeled (Tally handles; RHF requires explicit `<label htmlFor>`).
- **Test cadence**
  - Run `npx lighthouse https://<preview-url> --view --form-factor=mobile` after every preview deploy.
  - **Target ≥ 90 on Performance, Accessibility, Best Practices, SEO before merge to `main`.**

**RECOMMENDATION: Hard rule — Lighthouse mobile ≥ 90 on every category gates merge to `main`. Hero image `priority`, fonts via `next/font/google` (Inter + Bricolage Grotesque), third-party scripts via `next/script`, Tally iframe lazy-mounts on intersection. Audit bundle size pre-deploy.**

Sources:
- `node_modules/next/dist/docs/01-app/01-getting-started/12-images.md` — Next 16 image API (unchanged from 15)
- `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md` — Next 16 font API
- [Next.js — Image optimization (online)](https://nextjs.org/docs/app/api-reference/components/image)

---

## Cross-cutting decisions summary (one-glance for Builders)

| Concern | Decision |
|---|---|
| Framework | **Next.js 16.2.4**, App Router, Server Components by default |
| Build tool | **Turbopack** for both `next dev` and `next build` (the new default — don't opt out) |
| Caching | Stay on **Previous Model** — do NOT enable `cacheComponents` flag |
| React | 19.2.4 (matches Next 16 expectations) |
| Styling | Tailwind v4 (CSS-first via `@theme inline` in `app/globals.css`) |
| Component lib | shadcn 4.6 · style=`base-nova` · baseColor=`neutral` · primitives = `@base-ui/react` (NOT Radix) |
| Brand tokens | navy-700/800/900/950, sage-500/600, cream-50, graphite-500/600 — Tailwind classes ONLY, never hex (`navy-900` added 2026-05-02 for hovers/borders/deep cards) |
| Fonts | Inter (`--font-sans`, `font-sans`) + Bricolage Grotesque (`--font-display`, `font-display`) via `next/font/google` |
| Icons | `lucide-react` with named imports only |
| Forms | Tally.so primary (lazy-mounted iframe) · RHF + Resend pre-staged for swap |
| Email sender | Resend domain pre-verify NOW (24-hr DNS) |
| Analytics | Vercel Analytics on Hobby — swap to Plausible at 2.5k/mo wall |
| SEO files | `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` per page |
| Structured data | ProfessionalService JSON-LD in root layout, `<` → `<` escape (Next 16 pattern) |
| Lighthouse target | ≥ 90 mobile on all 4 categories — gates merge |
| Authoritative docs | `node_modules/next/dist/docs/01-app/` — read before any Next-specific code |
