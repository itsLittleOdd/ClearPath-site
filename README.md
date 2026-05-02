# ClearPath site

Justin Whalen's marketing site + lead intake. Phase 1 — Home / How It Works / Who It's For / Pricing / About Justin / Contact-Lead-Intake.

## Stack

- **Next.js 16.2.4** (App Router) — note: the locked brief said Next.js 15, but `create-next-app@latest` defaults to v16 as of 2026-05-02. v16 is API-compatible with the brief; flagged in the C2-W1 status to Coordinator 1.
- **TypeScript 5**
- **Tailwind CSS v4** + `@tailwindcss/postcss`
- **shadcn/ui** (preset: `base-nova` — Lucide icons + Geist fonts; baseColor `neutral` — Builder 2 can override CSS variables in `app/globals.css` to land the brand palette: deep navy + warm gray + soft green accent)
- **Package manager:** npm (pnpm not available on this host; documented per Coordinator 1's request)
- **Hosting:** Vercel (see `docs/DEPLOY.md`)

> **Heads-up for builders:** `AGENTS.md` (root of this repo) warns that this Next.js version has breaking changes vs. older training data. Read `node_modules/next/dist/docs/` before writing route handlers, server actions, or middleware.

## Local dev

```bash
cd clearpath_site
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build      # type-check + production build
npm start          # serve the production build locally
npm run lint       # eslint
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in. `.env.local` is gitignored. `.env.example` is committed (whitelisted in `.gitignore`).

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Used for canonicals, OG, sitemap. Default localhost. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain. Leave blank to disable. |
| `RESEND_API_KEY` | Only needed if React Hook Form fallback is in use; primary lead intake is Tally.so. |
| `LEAD_EMAIL_TO` | Where lead-form submissions get emailed. |

## File ownership (Sprint 1, locked by Coordinator 1)

The site is being built by a swarm. Don't write to a file you don't own — use `bs-mail` to coordinate.

| Owner | Owned files |
|---|---|
| Coord 2 (this scaffold) | `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `.env.example`, `README.md`, `postcss.config.mjs`, `components.json`, `docs/DEPLOY.md` |
| Builder 1 onward | TBD per Sprint 1 dispatch |

## Deploy

See `docs/DEPLOY.md` for the Vercel rollout checklist.

## Where the content guide lives

A 1-page "how to update content" guide is planned for Sprint 5. Until then, this README is the dev-side documentation.
