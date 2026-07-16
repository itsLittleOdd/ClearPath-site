"""Storefront guardrail tests for the ClearPath one-page site.

Standard library only. Run from the repo root:
    python3 -m unittest discover tests -v

These tests are written to pass both BEFORE controller wiring (safe mailto
placeholders) and AFTER wiring (live Stripe/Cal.com URLs), while rejecting
retired routes and offer regressions in either state.
"""

import html.parser
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

BOOKING_SLUG = "free-15-minute-fit-call"
CHECKOUT_SLUGS = {
    "ai-clarity-session",
    "starter-pilot",
    "core-retainer",
    "serious-business-tier",
}
EXPECTED_CTA_LABELS = {
    "ai-clarity-session": "Buy the AI Clarity Session",
    "starter-pilot": "Start the Starter Pilot",
    "core-retainer": "Start the Core Retainer",
    "serious-business-tier": "Start the Serious Business Tier",
}
EXPECTED_CHECKOUT_URLS = {
    "ai-clarity-session": "https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05",
    "starter-pilot": "https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06",
    "core-retainer": "https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07",
    "serious-business-tier": "https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08",
}
EXPECTED_BOOKING_CTA_COUNT = 8
EXPECTED_BOOKING_URL = "https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call"

RETIRED_CAL_ROUTE = "https://cal.com/justin-whalen-xpjqtn/45-min-discovery-call"
RETIRED_STRIPE_LINKS = {
    # Obsolete $395 Workflow Check product (not the AI Clarity Session).
    "https://buy.stripe.com/8x2cN54xd1dw2m27dl6Vq00",
    # Obsolete $500/month ClearPath Support product.
    "https://buy.stripe.com/8x23cv7Jp09s3q6gNV6Vq01",
}


class Anchor:
    def __init__(self, attrs):
        self.attrs = dict(attrs)
        self.text_parts = []

    @property
    def href(self):
        return self.attrs.get("href", "")

    @property
    def text(self):
        return re.sub(r"\s+", " ", "".join(self.text_parts)).strip()


class PageParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.anchors = []
        self._open_anchors = []
        self.tag_counts = {}
        self._details_stack = []
        self.details_without_summary = 0
        self.ids = []

    def handle_starttag(self, tag, attrs):
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        attr_map = dict(attrs)
        if "id" in attr_map:
            self.ids.append(attr_map["id"])
        if tag == "a":
            anchor = Anchor(attrs)
            self.anchors.append(anchor)
            self._open_anchors.append(anchor)
        elif tag == "details":
            self._details_stack.append({"summary": False})
        elif tag == "summary" and self._details_stack:
            self._details_stack[-1]["summary"] = True

    def handle_endtag(self, tag):
        if tag == "a" and self._open_anchors:
            self._open_anchors.pop()
        elif tag == "details" and self._details_stack:
            if not self._details_stack.pop()["summary"]:
                self.details_without_summary += 1

    def handle_data(self, data):
        for anchor in self._open_anchors:
            anchor.text_parts.append(data)


def load():
    raw = INDEX.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(raw)
    return raw, parser


def offer_card(raw, slug):
    """Return the one pricing card that owns a checkout offer."""
    marker = f'data-checkout-offer="{slug}"'
    marker_pos = raw.index(marker)
    card_starts = [
        match.start()
        for match in re.finditer(r'<div class="tier(?:\s[^\"]*)?">', raw)
    ]
    start = max(pos for pos in card_starts if pos < marker_pos)
    later_cards = [pos for pos in card_starts if pos > marker_pos]
    pricing_end = raw.index("</section>", marker_pos)
    end = min(later_cards) if later_cards else pricing_end
    return raw[start:end]


RAW, PAGE = load()
STYLE = RAW[RAW.index("<style>"):RAW.index("</style>")]
CHECKOUT_ANCHORS = [a for a in PAGE.anchors if "data-checkout-offer" in a.attrs]
BOOKING_ANCHORS = [a for a in PAGE.anchors if "data-booking-offer" in a.attrs]


class TestOffersAndPricing(unittest.TestCase):
    def test_all_four_offers_named(self):
        for name in ("AI Clarity Session", "Starter Pilot", "Core Retainer",
                     "Serious Business Tier"):
            self.assertIn(name, RAW, f"offer name missing: {name}")

    def test_clarity_session_price(self):
        self.assertIn("$395 one time", RAW)

    def test_tier_cards_bind_prices_charge_terms_and_checkout(self):
        cases = [
            ("starter-pilot", "Starter Pilot", r"\$1,500<small>\s*setup",
             r"\$500<small>/mo", "Charged today: $2,000.",
             "After that, $500 renews monthly."),
            ("core-retainer", "Core Retainer", r"\$2,500<small>\s*setup",
             r"\$1,500<small>/mo", "Charged today: $4,000.",
             "After that, $1,500 renews monthly."),
            ("serious-business-tier", "Serious Business Tier",
             r"\$5,000<small>\s*setup", r"\$3,000<small>/mo",
             "Charged today: $8,000.",
             "After that, $3,000 renews monthly."),
        ]
        for slug, name, setup_re, monthly_re, first_charge, renewal in cases:
            card = offer_card(RAW, slug)
            self.assertIn(name, card, f"{slug}: offer name missing from its card")
            self.assertRegex(card, setup_re,
                             f"{slug}: setup price not bound to its card")
            self.assertRegex(card, monthly_re,
                             f"{slug}: monthly price not bound to its card")
            self.assertIn(first_charge, card,
                          f"{slug}: first-charge disclosure missing")
            self.assertIn(renewal, card,
                          f"{slug}: renewal cadence disclosure missing")
            self.assertIn(EXPECTED_CHECKOUT_URLS[slug], card,
                          f"{slug}: verified checkout not bound to its card")

    def test_old_offers_do_not_reappear(self):
        lowered = RAW.lower()
        for phrase in ("workflow check", "ops desk", "clearpath support"):
            self.assertNotIn(phrase, lowered, f"retired offer resurfaced: {phrase}")
        self.assertNotRegex(
            RAW, r"\$500\s*/\s*(mo|month)[^<]*support",
            "retired $500/month Support offer resurfaced")


class TestCheckoutCtas(unittest.TestCase):
    def test_exactly_one_cta_per_paid_offer(self):
        slugs = [a.attrs["data-checkout-offer"] for a in CHECKOUT_ANCHORS]
        self.assertEqual(sorted(slugs), sorted(CHECKOUT_SLUGS),
                         "each paid offer must have exactly one checkout CTA")

    def test_checkout_hrefs_are_unique_mapping_slots(self):
        hrefs = [a.href for a in CHECKOUT_ANCHORS]
        self.assertEqual(len(hrefs), len(set(hrefs)),
                         "checkout CTAs must not share an href")
        for a in CHECKOUT_ANCHORS:
            for b in BOOKING_ANCHORS:
                self.assertNotEqual(a.href, b.href,
                                    "checkout CTA href collides with booking CTA")

    def test_checkout_cta_labels(self):
        for a in CHECKOUT_ANCHORS:
            slug = a.attrs["data-checkout-offer"]
            self.assertEqual(a.text, EXPECTED_CTA_LABELS[slug],
                             f"unexpected CTA label for {slug}")

    def test_checkout_urls_match_verified_stripe_products(self):
        for a in CHECKOUT_ANCHORS:
            slug = a.attrs["data-checkout-offer"]
            self.assertEqual(a.href, EXPECTED_CHECKOUT_URLS[slug],
                             f"wrong Stripe checkout URL for {slug}")

    def test_checkout_routes_safe_or_live(self):
        for a in CHECKOUT_ANCHORS:
            slug = a.attrs["data-checkout-offer"]
            if a.href.startswith("mailto:JWhalen@ClearPathWV.com"):
                # Unresolved: must be visibly explained so it cannot be
                # confused with live checkout.
                note_id = a.attrs.get("aria-describedby", "")
                self.assertTrue(note_id, f"{slug}: pending mailto CTA needs "
                                         "aria-describedby pending note")
                self.assertIn(note_id, PAGE.ids,
                              f"{slug}: pending note id {note_id} missing")
                self.assertIn("Checkout is not live yet", RAW)
            elif a.href.startswith(("https://buy.stripe.com/",
                                    "https://book.stripe.com/")):
                self.assertNotIn(a.href, RETIRED_STRIPE_LINKS,
                                 f"{slug}: wired to a retired Stripe link")
            else:
                self.fail(f"{slug}: href is neither the safe mailto route nor "
                          f"a Stripe checkout URL: {a.href!r}")


class TestBookingCtas(unittest.TestCase):
    def test_booking_cta_count_and_shared_slug(self):
        self.assertEqual(len(BOOKING_ANCHORS), EXPECTED_BOOKING_CTA_COUNT)
        for a in BOOKING_ANCHORS:
            self.assertEqual(a.attrs["data-booking-offer"], BOOKING_SLUG)

    def test_every_fit_call_link_carries_slug(self):
        for a in PAGE.anchors:
            if "Book a free 15-minute fit call" in a.text:
                self.assertIn("data-booking-offer", a.attrs,
                              f"fit-call CTA missing booking slug: {a.href!r}")

    def test_booking_routes_match_verified_event(self):
        for a in BOOKING_ANCHORS:
            self.assertEqual(a.href, EXPECTED_BOOKING_URL,
                             "booking CTA is not wired to the verified 15-minute event")

    def test_retired_routes_absent_everywhere(self):
        self.assertNotIn(RETIRED_CAL_ROUTE, RAW)
        self.assertNotIn("45-min-discovery-call", RAW)
        for link in RETIRED_STRIPE_LINKS:
            self.assertNotIn(link, RAW)


class TestCopyAndStructure(unittest.TestCase):
    def test_no_em_dashes(self):
        self.assertNotIn("—", RAW, "em dash found in page")

    def test_single_h1_and_section_headings(self):
        self.assertEqual(PAGE.tag_counts.get("h1", 0), 1)
        self.assertGreaterEqual(PAGE.tag_counts.get("h2", 0), 6)
        self.assertGreaterEqual(PAGE.tag_counts.get("ul", 0), 5)

    def test_faq_uses_native_disclosure(self):
        self.assertGreaterEqual(PAGE.tag_counts.get("details", 0), 8)
        self.assertEqual(PAGE.details_without_summary, 0,
                         "every details element needs a summary")

    def test_focus_visible_styles_present(self):
        self.assertIn(":focus-visible", STYLE)

    def test_reduced_motion_supported(self):
        marker = "@media (prefers-reduced-motion: reduce)"
        self.assertIn(marker, STYLE, "prefers-reduced-motion media query missing")
        block = STYLE[STYLE.index(marker):STYLE.index(marker) + 600]
        self.assertIn("animation:none", block)

    def test_animations_gated_for_no_js(self):
        # Hidden-by-default animation styles must only apply when JS has
        # added the .js class, so content renders with JavaScript disabled.
        for hidden_rule in re.finditer(r"([^{}]+)\{[^{}]*opacity:0[;}]", STYLE):
            selector = hidden_rule.group(1).strip().splitlines()[-1].strip()
            if selector.startswith("@") or "keyframes" in selector or \
                    selector.startswith("from") or selector.startswith("to"):
                continue
            self.assertTrue(
                all(part.strip().startswith(".js ")
                    for part in selector.split(",")),
                f"opacity:0 rule not gated behind .js class: {selector!r}")

    def test_no_javascript_hrefs(self):
        for a in PAGE.anchors:
            self.assertFalse(a.href.lower().startswith("javascript:"),
                             f"javascript: href found: {a.href!r}")


if __name__ == "__main__":
    unittest.main()
