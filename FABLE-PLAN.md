# FABLE-PLAN: ClearPath storefront restoration (2026-07-16)

Baseline: `74a55d6` on branch `fable/storefront-restore-2026-07-16`.

## 1. Current-state diagnosis

The live page (`index.html`, single static file) has strong copy, a clear offer
ladder, and correct pricing, but the buyer path dead-ends into email:

- All 8 free-fit-call CTAs are `mailto:` links with the subject
  `Free 15-minute fit call`. There is no calendar booking route anywhere.
- The AI Clarity Session ($395) has one CTA (`data-offer="ai-clarity-session"`)
  that is also a `mailto:` link. No checkout.
- The three implementation tiers (Starter Pilot, Core Retainer, Serious
  Business Tier) show correct prices but have **no purchase CTA at all**. Their
  only button is the same free-fit-call mailto. A buyer ready to start a
  package has no way to do so.
- No `data-booking-offer` identifiers exist, so there is no stable wiring
  target for the controller's Cal.com link.
- Only one of four paid offers has any offer identifier.

What regressed relative to history: earlier revisions (`16252f0` through
`02380e0`) had every CTA wired to a real one-click booking route, and the
Next.js era (`7efc2ae`/`f76105c`) had direct Stripe checkout on paid offers.
The current page lost both behaviors when the stale links were (correctly)
removed, but nothing structured replaced them.

## 2. Historical features worth restoring

- One-click booking on every free-call CTA (was: Cal.com href on all buttons).
  Restore as a wiring slot; controller supplies the new 15-minute event URL.
- Direct checkout CTA on every paid offer (was: `buy.stripe.com` links on
  Workflow Check / Support). Restore the *pattern* with one CTA per current
  offer; controller supplies four new Stripe URLs.
- A short "what happens after payment" explanation near paid CTAs (the old
  pricing page explained what the purchase started).

## 3. Historical elements that must remain retired

- Cal.com route `https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call`
  (advertises 45 minutes, tool recommendations, savings claims, a 2-3 page
  report; contradicts current free-call scope).
- Stripe link `https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00` (obsolete $395
  Workflow Check product; same price as the Clarity Session but a different
  product, so it must not be silently reattached).
- Stripe link `https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01` (obsolete
  $500/month ClearPath Support product).
- Offer names: Workflow Check, ClearPath Support ($500/mo), AI Ops Desk.
- Testimonials, guarantees, savings claims, report-page-count promises.

## 4. Buyer journey (target)

- **Free 15-minute fit call** (8 CTAs: header, hero, sample-work, one per
  tier as secondary, final band, footer). Each carries
  `data-booking-offer="free-15-minute-fit-call"`. Until the controller injects
  the Cal.com URL, the href stays the existing safe mailto route and nearby
  copy already frames it as a quick relevance check.
- **AI Clarity Session, $395 one time.** One primary checkout CTA in the
  clarity card, `data-checkout-offer="ai-clarity-session"` (replaces the old
  `data-offer` attribute). Pending state: mailto with offer-specific subject
  plus a visible "checkout is not live yet" note. After wiring: Stripe URL,
  note swapped for an after-payment explanation.
- **Starter Pilot, $1,500 setup + $500/month.** New primary CTA
  `data-checkout-offer="starter-pilot"`, label "Start the Starter Pilot",
  plus a secondary free-fit-call link.
- **Core Retainer, $2,500 setup + $1,500/month.** New primary CTA
  `data-checkout-offer="core-retainer"`, label "Start the Core Retainer",
  plus a secondary free-fit-call link.
- **Serious Business Tier, $5,000 setup + $3,000/month.** New primary CTA
  `data-checkout-offer="serious-business-tier"`, label "Start the Serious
  Business Tier", plus a secondary free-fit-call link.
- Each tier CTA gets a short pending note; the pricing section gets one shared
  "after checkout" paragraph that only describes a receipt and an email
  follow-up, with no scheduling automation or timing promises.

All pricing stays byte-identical. No new claims, no em dashes, JS-free
operation preserved (all CTAs are plain anchors).

## 5. Controller handoff fields (exactly five)

Documented in `CHECKOUT-CALENDAR-WIRING.md`:

1. Stripe checkout URL, AI Clarity Session ($395 one time) →
   `a[data-checkout-offer="ai-clarity-session"]`
2. Stripe checkout URL, Starter Pilot ($1,500 setup + $500/mo, both parts) →
   `a[data-checkout-offer="starter-pilot"]`
3. Stripe checkout URL, Core Retainer ($2,500 setup + $1,500/mo, both parts) →
   `a[data-checkout-offer="core-retainer"]`
4. Stripe checkout URL, Serious Business Tier ($5,000 setup + $3,000/mo, both
   parts) → `a[data-checkout-offer="serious-business-tier"]`
5. Cal.com URL, free 15-minute fit call →
   every `a[data-booking-offer="free-15-minute-fit-call"]`

Each pending href is unique per offer (unique mailto subject), so the
controller can wire by exact find-and-replace; a wiring comment at the top of
`index.html` lists the exact strings.

## 6. File and test plan

Files:
- `index.html`: wiring comment block, `data-booking-offer` on all 8 free-call
  CTAs, `data-checkout-offer` on 4 paid CTAs (3 new tier buttons + notes,
  1 converted clarity button), shared after-checkout paragraph, small CSS for
  tier CTA stack and notes.
- `tests/test_storefront.py`: Python 3 stdlib (`unittest`, `html.parser`, `re`).
- `CHECKOUT-CALENDAR-WIRING.md`, `FABLE-REPORT.md`.

Tests (all against `index.html` as text + parsed anchors):
1. Four paid offers present with exact prices ($395 one time; $1,500 + $500/mo;
   $2,500 + $1,500/mo; $5,000 + $3,000/mo) and old prices/names absent.
2. `data-checkout-offer` values are exactly the four slugs, one CTA each,
   with four distinct hrefs.
3. Every free-fit-call CTA has `data-booking-offer="free-15-minute-fit-call"`,
   and every anchor using the fit-call mailto subject carries it (count == 8).
4. Checkout hrefs are safe: `mailto:` now, or later a `https://buy.stripe.com/`
   URL that is not an obsolete link. Booking hrefs: `mailto:` now or later a
   `https://cal.com/` URL that is not the 45-minute route.
5. The 45-minute Cal.com route and both obsolete Stripe links are absent.
6. "Workflow Check", "Ops Desk" and a $500/month support offer do not reappear.
7. No em dash (U+2014) anywhere in the file.
8. Exactly one `h1`; `h2` structure present; FAQ uses `details`/`summary`.
9. `:focus-visible` styles and `prefers-reduced-motion` media query present;
   animation opacity rules gated behind the `.js` class so content renders
   without JavaScript.

Run: `python3 -m unittest discover tests -v` and `git diff --check`.
