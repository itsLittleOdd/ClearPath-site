# CHECKOUT-CALENDAR-WIRING: verified controller state

Updated after the Fable build and controller reconciliation on 2026-07-16.

## Stripe destinations: complete and verified

Each paid CTA is wired to its own active Stripe Payment Link. API readback and rendered Checkout inspection confirmed the product names, line items, first charges, and recurring amounts.

### AI Clarity Session

- Selector: `a[data-checkout-offer="ai-clarity-session"]`
- Product: ClearPath AI Clarity Session
- Checkout: `https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05`
- Charge: $395 one time
- CTA: `Buy the AI Clarity Session`

### Starter Pilot

- Selector: `a[data-checkout-offer="starter-pilot"]`
- Product: ClearPath Starter Pilot
- Checkout: `https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06`
- First charge: $2,000, consisting of $1,500 setup plus the first $500 month
- Renewal: $500 monthly after the first charge
- CTA: `Start the Starter Pilot`

### Core Retainer

- Selector: `a[data-checkout-offer="core-retainer"]`
- Product: ClearPath Core Retainer
- Checkout: `https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07`
- First charge: $4,000, consisting of $2,500 setup plus the first $1,500 month
- Renewal: $1,500 monthly after the first charge
- CTA: `Start the Core Retainer`

### Serious Business Tier

- Selector: `a[data-checkout-offer="serious-business-tier"]`
- Product: ClearPath Serious Business Tier
- Checkout: `https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08`
- First charge: $8,000, consisting of $5,000 setup plus the first $3,000 month
- Renewal: $3,000 monthly after the first charge
- CTA: `Start the Serious Business Tier`

## Calendar destination: complete and verified

All eight free-call CTAs use the same verified public Cal.com event.

- Selector: `a[data-booking-offer="free-15-minute-fit-call"]`
- Event: Free 15-Minute Fit Call
- URL: `https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call`
- Duration: 15 minutes
- Timezone shown to the owner: America/New York
- Location: attendee phone number
- Public scope: quick relevance check with no custom plan, tool recommendations, or written deliverable
- CTA: `Book a free 15-minute fit call`

## Retired destinations

Never restore:

- `https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call`
- `https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00`
- `https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01`

These belong to the retired 45-minute event, Workflow Check, and ClearPath Support offers.

## Verification

Run:

```bash
python3 -m unittest discover tests -v
git diff --check
```

The tests bind each visible price, first-charge disclosure, renewal disclosure, and exact Stripe URL to the correct offer card. They also reject the retired routes.
