# Vercel deploy checklist — ClearPath site

Target live: 2026-05-16. Owner of execution: Justin (or Coord 2 once Justin has handed off Vercel + domain credentials).

## Prerequisites

- [ ] GitHub repo created and pushed (no remote exists yet — operator must confirm GitHub org/repo name).
- [ ] Vercel account with billing on a paid plan if a custom domain is required.
- [ ] Domain registered (TBD — Justin to name the production domain before Sprint 5).
- [ ] Tally.so account + lead-intake form built. Embed ID copied for the contact page.
- [ ] Resend account (only if Tally fallback path is enabled). API key generated, sender domain verified.
- [ ] Plausible account (only if Plausible chosen over Vercel Analytics). Domain set up; site key copied.

## One-time Vercel setup

- [ ] In Vercel dashboard → New Project → Import the GitHub repo `clearpath_site`.
- [ ] Framework preset: Next.js (auto-detected).
- [ ] Root directory: `clearpath_site` (only if the GitHub repo is a monorepo). If the repo IS the site, leave blank.
- [ ] Build command: default `next build` — no override needed.
- [ ] Output directory: default `.next` — no override needed.
- [ ] Node version: 22.x (matches local dev).
- [ ] Click Deploy. First deploy will fail if env vars aren't set — that's expected; continue to env-var step.

## Environment variables (production)

Set in Vercel → Project → Settings → Environment Variables. Copy from `.env.example`. Mark each as Production / Preview / Development as appropriate.

- [ ] `NEXT_PUBLIC_SITE_URL` — production domain, e.g. `https://clearpath.example.com`. Production + Preview.
- [ ] `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — Plausible site domain, or leave unset to disable. Production only.
- [ ] `RESEND_API_KEY` — only if the Tally fallback is wired. Mark Sensitive. Production + Preview.
- [ ] `LEAD_EMAIL_TO` — Justin's lead-receiving inbox. Production only.

After variables are set, redeploy from the Deployments tab.

## Custom domain

- [ ] In Vercel → Project → Settings → Domains, add the production domain.
- [ ] Vercel shows the DNS records to set (A or CNAME). Copy them.
- [ ] At the registrar (e.g. Cloudflare, Namecheap, Porkbun), add the DNS records. CNAME usually wins; A only if the domain is on apex with no CNAME flattening.
- [ ] Wait for propagation. Vercel auto-provisions an SSL cert; verify HTTPS works before announcing.
- [ ] Add `www` as a redirect to apex (or vice versa, depending on Justin's preference).
- [ ] Update `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.

## Preview / branch deploys

- [ ] Vercel auto-creates preview deploys for every PR / non-main branch. No setup needed.
- [ ] Default branch on Vercel: `main`. Confirm matches the GitHub default.
- [ ] Recommended: gate `main` with required PR review on GitHub before allowing merges.

## Analytics

Pick one (Coord 1 has flagged this as TBD):

- **Vercel Analytics** — flip the toggle in Project → Analytics. No code change required. Free tier is generous.
- **Plausible** — set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and add the Plausible script tag in `app/layout.tsx` (Builder owning that file does this).

## Pre-launch QA

- [ ] All 6 Phase-1 pages render.
- [ ] Mandatory phrases land:
  - "eliminate 5–10 hours of repetitive work every week" — hero on Home.
  - "Let me show you how we can set this up together" — How-It-Works header.
  - "This is AI-assisted analysis + Justin's human review and customization." — audit-page footer disclaimer.
- [ ] No banned words anywhere on the site (`leverage`, `synergy`, `unlock`, `transform`, `revolutionize`, `cutting-edge`, `game-changer`).
- [ ] Tally form submits and Justin gets the test email.
- [ ] Lighthouse 90+ on Performance / Accessibility / SEO / Best Practices on production.
- [ ] OG image renders correctly when the production URL is shared on a social platform.
- [ ] 404 page is in Justin's voice, not the default Next.js page.

## Post-launch

- [ ] Monitor Vercel Analytics or Plausible for the first 7 days; any 5xx errors get filed back into the swarm board.
- [ ] Tally form submission → email → reply cadence: aim for under 24 hours. If volume picks up, revisit a CRM.
- [ ] Sprint 5 content guide written so Justin can edit copy without a builder.

## Rollback plan

- [ ] In Vercel → Deployments, every deploy is preserved. To roll back, click the prior deploy → "Promote to Production." Takes about 30 seconds.
