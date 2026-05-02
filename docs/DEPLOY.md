# Vercel deploy checklist — ClearPath site

Target live: 2026-05-16. Owner of execution: **Justin (account `justinwhalen0-2299` / `justin.whalen0@gmail.com`).** The swarm does not deploy from its own credentials; this doc is the runbook Justin (or Coord 2 with handed-off access) executes.

> **Stack notes from Scout 1 (Next 16 edition):** see `docs/STACK_NOTES.md` for the full breakdown. Deploy-relevant points are folded into the checklists below.

## Confirmed inputs (operator-locked 2026-05-02)

| Input | Value |
|---|---|
| Vercel account | `justinwhalen0-2299` (`justin.whalen0@gmail.com`) |
| Lead-intake email destination | `JWhalen@ClearPathWV.com` (the canonical ClearPath address) |
| Production domain | `clearpathwv.com` (provisional — confirm at registrar before pointing DNS) |
| Form pipeline | **Tally.so** (Path A from `docs/FORM_PIPELINE_PLAYBOOK.md`) — Resend is not wired in Phase 1 |
| Booking | Cal.com inline embed via `@calcom/embed-react`. Discovery: `https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call`. Review: `[REDACTED-INTERNAL-URL]` |
| Analytics | Vercel Analytics (operator confirmed; Plausible deferred) |

## Prerequisites

- [ ] GitHub repo created and pushed (no remote exists yet — operator must confirm GitHub org/repo name).
- [ ] Vercel account with billing on a paid plan if a custom domain is required.
- [ ] Domain registered (TBD — Justin to name the production domain before Sprint 5).
- [ ] Tally.so account + lead-intake form built. Embed ID copied for the contact page (see "Tally form setup" below). **Operator-locked: Tally is Phase 1's lead pipeline.**
- [ ] Resend domain verification — DEFERRED for Phase 1 (Tally handles email via its own SMTP). Only needed if/when the Resend fallback is wired in a future sprint. If kicking that off in advance, expect 24-hour DNS propagation.
- [ ] Plausible account — DEFERRED. Operator chose Vercel Analytics.

## One-time Vercel setup

- [ ] In Vercel dashboard → New Project → Import the GitHub repo `clearpath_site`.
- [ ] Framework preset: Next.js (auto-detected).
- [ ] Root directory: `clearpath_site` (only if the GitHub repo is a monorepo). If the repo IS the site, leave blank.
- [ ] Build command: default `next build` — no override needed. Next 16 uses Turbopack for `next build` by default; CI builds are noticeably faster than v15. No opt-in flag required.
- [ ] Output directory: default `.next` — no override needed.
- [ ] Node version: 22.x (matches local dev).
- [ ] **Do NOT enable the `cacheComponents` flag** in `next.config.ts`. Stay on the Previous Model caching for Phase 1 — opting in is a behavior change that will surprise builders mid-sprint.
- [ ] Click Deploy. First deploy will fail if env vars aren't set — that's expected; continue to env-var step.

## Environment variables (production)

Set in Vercel → Project → Settings → Environment Variables. Copy from `.env.example`. Mark each as Production / Preview / Development as appropriate.

- [ ] `NEXT_PUBLIC_SITE_URL` — production domain. Set to `https://clearpathwv.com` (or final confirmed domain). Production + Preview.
- [ ] `NEXT_PUBLIC_TALLY_FORM_ID` — the form ID from the Tally form's share URL (e.g. `wQbX4d`). Until this is set, the contact page renders the mailto-fallback to `JWhalen@ClearPathWV.com`. Production + Preview.
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — leave unset; operator chose Vercel Analytics over Plausible for Phase 1.
- [ ] `RESEND_API_KEY` — leave unset for Phase 1 (Tally handles email notifications natively). Add later only if Tally is replaced by the Resend fallback.
- [ ] `LEAD_EMAIL_TO` — `JWhalen@ClearPathWV.com`. Configured inside Tally's notification settings, not as a Vercel env var unless the Resend fallback is wired.

After variables are set, redeploy from the Deployments tab.

### Tally form setup (operator action — gate for `NEXT_PUBLIC_TALLY_FORM_ID`)

- [ ] Create a Tally.so account if not already done.
- [ ] New form → name `ClearPath Lead Intake`. Add five fields:
  1. Short answer — `Name` (required)
  2. Short answer — `Business name` (required)
  3. Email — `Email` (required)
  4. Phone — `Phone` (optional)
  5. Long answer — `What's one repetitive task eating your time right now?` (required)
- [ ] Type `/recaptcha` before the submit button to insert Google reCAPTCHA (no keys needed).
- [ ] Notifications → enable "Send email on submission" → set destination to `JWhalen@ClearPathWV.com`.
- [ ] Copy the form ID (the segment after `tally.so/forms/` in the share URL). Paste into Vercel as `NEXT_PUBLIC_TALLY_FORM_ID`.
- [ ] Open `/contact` after redeploy and submit a test lead — confirm the email lands in the ClearPathWV inbox.

## Custom domain

Provisional production domain: **`clearpathwv.com`** (operator confirm before pointing DNS — if the actual domain is different, swap it everywhere `clearpathwv.com` appears in this doc, in `lib/site.ts`'s `SITE.url`, and in the Vercel env vars).

- [ ] In Vercel → Project → Settings → Domains, add `clearpathwv.com` (and `www.clearpathwv.com`).
- [ ] Vercel shows the DNS records to set (A or CNAME). Copy them.
- [ ] At the registrar, add the DNS records. CNAME usually wins; A only if the domain is on apex with no CNAME flattening.
- [ ] Wait for propagation. Vercel auto-provisions an SSL cert; verify HTTPS works before announcing.
- [ ] Decide canonical: apex (`clearpathwv.com`) or www. Add the other as a redirect to the canonical.
- [ ] Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.

## Preview / branch deploys

- [ ] Vercel auto-creates preview deploys for every PR / non-main branch. No setup needed.
- [ ] Default branch on Vercel: `main`. Confirm matches the GitHub default.
- [ ] Recommended: gate `main` with required PR review on GitHub before allowing merges.

## Analytics

**Operator chose Vercel Analytics for Phase 1.** Plausible is deferred — revisit after the first paid campaign or once the Vercel Hobby cap (~2,500 events/month, no overage billing) starts to bite.

- [ ] In Vercel → Project → Analytics, flip on Web Analytics.
- [ ] No code change is required for the page-view counter — Vercel injects the script for you. If you later want custom events, install `@vercel/analytics` and import `<Analytics />` in `app/layout.tsx` (Builder 1's file).
- [ ] If Vercel Speed Insights is wanted, flip on the Speed Insights toggle separately and install `@vercel/speed-insights` per its docs.

## Pre-launch QA

- [ ] All 6 Phase-1 pages render.
- [ ] Mandatory phrases land:
  - "eliminate 5–10 hours of repetitive work every week" — hero on Home.
  - "Let me show you how we can set this up together" — How-It-Works header.
  - "This is AI-assisted analysis + Justin's human review and customization." — audit-page footer disclaimer.
- [ ] No banned words anywhere on the site (`leverage`, `synergy`, `unlock`, `transform`, `revolutionize`, `cutting-edge`, `game-changer`).
- [ ] Tally form submits and Justin gets the test email.
- [ ] **Tally embed is lazy-mounted** — eager iframe injection tanks Lighthouse on the contact page. The Builder owning `app/contact/page.tsx` should defer the iframe until intersection / interaction. Verify in production that the page-load doesn't pull the Tally iframe immediately.
- [ ] **Lighthouse mobile ≥ 90** on Performance / Accessibility / SEO / Best Practices on production. **This gates merge to `main`** — if a PR drops mobile Lighthouse below 90, fix it before merging. Run on production, not localhost.
- [ ] OG image renders correctly when the production URL is shared on a social platform.
- [ ] 404 page is in Justin's voice, not the default Next.js page.

## Post-launch

- [ ] Monitor Vercel Analytics or Plausible for the first 7 days; any 5xx errors get filed back into the swarm board.
- [ ] Tally form submission → email → reply cadence: aim for under 24 hours. If volume picks up, revisit a CRM.
- [ ] Sprint 5 content guide written so Justin can edit copy without a builder.

## Rollback plan

- [ ] In Vercel → Deployments, every deploy is preserved. To roll back, click the prior deploy → "Promote to Production." Takes about 30 seconds.
