# FABLE-REPORT: ClearPath storefront restoration and controller reconciliation (2026-07-16)

Branch `fable/storefront-restore-2026-07-16`, baseline `74a55d6`.

## Plan summary

The page had correct offers and prices but every CTA dead-ended into a
`mailto:` link: no calendar booking route, no checkout on any paid offer, and
the three implementation tiers had no purchase action at all. The restoration
gives every offer a direct action slot again, the way earlier revisions did,
without resurrecting the stale 45-minute Cal.com event or the two obsolete
Stripe payment links found in history. Full diagnosis in `FABLE-PLAN.md`.

## Files changed

- `index.html`
  - Controller notes at the top identify the verified Cal.com and Stripe wiring.
  - All 8 free-fit-call CTAs (header, hero, sample-work, one per tier, final
    band, footer) carry `data-booking-offer="free-15-minute-fit-call"` and
    use the verified public 15-minute Cal.com event.
  - Each implementation tier has a primary checkout CTA
    (`data-checkout-offer="starter-pilot" | "core-retainer" |
    "serious-business-tier"`) wired to its exact verified Stripe Payment Link,
    plus a visible first-charge and monthly-renewal disclosure and a secondary
    free-fit-call link.
  - The AI Clarity Session CTA uses
    `data-checkout-offer="ai-clarity-session"`, label "Buy the AI Clarity
    Session", and its verified $395 one-time Stripe Payment Link, plus a
    truthful after-payment line (Stripe receipt, personal follow-up to schedule).
  - A shared "What happens after checkout" paragraph in the pricing section:
    receipt, personal follow-up, written scope still approved before work.
  - Small CSS additions support the tier CTA stack and charge disclosures. No
    pricing, brand, or unsupported claim changes; all CTAs remain plain anchors
    that work without JavaScript.
- `tests/test_storefront.py` (new, Python standard library only)
- `FABLE-PLAN.md`, `CHECKOUT-CALENDAR-WIRING.md`, this report (new)

## Tests run and results

- `python3 -m unittest discover tests -v`: **20 tests, all pass**.
  Coverage: four offers with exact prices; unique checkout identifiers,
  labels, exact verified hrefs, and offer-card price binding; each implementation
  card discloses its first charge and monthly renewal; all 8 booking CTAs share
  the booking slug and exact verified Cal.com URL;
  retired Cal.com route and both obsolete Stripe links rejected anywhere in
  the file; retired offer names (Workflow Check, Ops Desk, ClearPath Support,
  $500/month support) rejected; no em dashes; single h1 and heading/list
  structure; details/summary FAQ; focus-visible styles; reduced-motion
  media query; animation opacity rules gated behind the `.js` class.
- Mutation checks: the suite was verified to fail when the retired Cal.com route,
  a retired Stripe link, a price change, or an em dash was injected. A separate
  Starter/Core setup-price swap also failed the scoped card-binding test. The
  working tree was restored after each check.
- `git diff --check`: clean.

The original Fable session did not verify browser, Stripe, Cal.com, payment,
deployment, or production behavior. The controller subsequently verified the
local render, Pa11y WCAG2AA result, four Stripe product and Payment Link mappings,
all four rendered Checkout pages, and the public Cal.com event title, scope,
15-minute duration, attendee-phone location, timezone, and availability.
Production remains unresolved.

## What was restored

- A direct-action slot on every offer: one checkout CTA per paid offer (4)
  and a one-click booking slot on every free-call CTA (8), matching the
  completeness of earlier revisions.
- Buyer-facing explanation of what happens after payment.
- A 10-second buyer path: free fit call to test relevance, $395 Clarity
  Session for a written plan, or a specific implementation tier through its
  own matching checkout.

## What intentionally remained retired

- `https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call` (advertises
  45 minutes, tool recommendations, savings claims, and a written report that
  contradict the current free-call scope).
- `https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00` (obsolete $395 Workflow
  Check product; not silently reattached to the Clarity Session despite the
  matching price).
- `https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01` (obsolete $500/month
  ClearPath Support product).
- Workflow Check, ClearPath Support, and AI Ops Desk as public offers.
- No testimonials, logos, guarantees, savings claims, refund or cancellation
  terms, or capacity promises were added.

## Controller reconciliation state

Completed:

1. Created and verified the AI Clarity Session Stripe product and $395 one-time Payment Link.
2. Created and verified the Starter, Core, and Serious Stripe products and mixed setup-plus-monthly Payment Links.
3. Wired all four exact Stripe URLs into their matching offer cards and removed the pending-checkout notes.
4. Added visible first-charge and monthly-renewal disclosures beside each implementation price.
5. Strengthened the suite so swapping prices between offer cards fails.
6. Created and publicly verified the Free 15-Minute Fit Call Cal.com event.
7. Wired all eight booking CTAs to the exact verified Cal.com URL.

Still unresolved:

1. Rerun final QA, commit, push, deploy via Vercel, and verify production.

## Recommended final release sequence

1. Run `python3 -m unittest discover tests -v` (must stay green) and
   `git diff --check`.
2. Commit on this branch, open a PR to `main`, review the rendered page
   locally (including with JavaScript disabled and reduced motion).
3. Merge, let Vercel deploy, then verify on `https://clearpathwv.com`: click
   every checkout CTA into Stripe and the booking CTA into Cal.com, confirm
   amounts and event length, and complete one test-mode transaction if
   desired before announcing.
