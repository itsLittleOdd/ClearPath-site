# Legacy route and anchor map (rebuild 2026-10-16)

Every destination in `.build-inputs/current-route-and-link-inventory.json` and how the rebuild handles it. Hosting redirects in `vercel.json` are unchanged (bytes pinned); the local server mirrors them.

| Old destination | Now | Mechanism |
| --- | --- | --- |
| `/` | `/` (new homepage) | same route |
| `/about`, `/about/` | `/#about` | `vercel.json` redirect, unchanged; homepage keeps `id="about"` |
| `/#about` | About section on the homepage | anchor kept |
| `/#pricing` | Starting-prices section on the homepage, linking to `/pricing/` | anchor kept |
| `/#how` | How a project works | anchor kept |
| `/#faq` | FAQ | anchor kept |
| `/#see-it-run` | Video demonstration section | anchor kept |
| `/#clarity-session` | Clarity row in the homepage price list | anchor kept on the list item |
| `/#main` | main landmark | kept on every page |
| `/demos/` | `/demos/` (hub, new chrome, same engines) | same route |
| `/demos/request-desk/`, `/demos/business-brain/`, `/demos/website-manager/` | same routes, same engines | same route |
| `/justin`, `/justin/` | `/justin/card.html` | `vercel.json` redirect, unchanged; card bytes pinned |
| `https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call` | kept as a link only, never submitted | link |
| `mailto:JWhalen@ClearPathWV.com` | kept everywhere | link |
| `https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05` (Clarity checkout) | removed; `/contact/?topic=clarity` | contact-gated path; payment wiring is a held release decision |
| `https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06` (Starter Pilot) | removed; offer retired | none |
| `https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07` (Core Retainer) | removed; offer retired | none |
| `https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08` (Serious Business Tier) | removed; offer retired | none |
| `/assets/home.js` | retired stub, not referenced, not in the release allowlist | file kept because the writer cannot delete |

New routes: `/services/`, `/work/`, `/pricing/`, `/contact/` (accepts `?topic=website|tools|clarity|support|unsure`), `/thank-you/`, `/privacy/`, `/terms/`, `/404.html`, `/robots.txt`, `/sitemap.xml`.

Note on `cleanUrls`: the rebuild uses directory indexes (`/services/` to `services/index.html`), which the current `vercel.json` already serves without any change. A request for `/services` (no slash) gets a 308 to `/services/` on the local server; Vercel's default behavior for directory indexes is equivalent. If a different behavior is wanted at release, see `docs/proposals/hosting-config-proposal.md`.
