"""Regression guards for the production repair of the site and contact card.

Standard library only. Run from the repo root:
    python3 -m unittest discover -s tests -v

test_storefront.py owns homepage offer/pricing/CTA wiring. This module owns
the defects the controller verified live on 2026-07-25: broken /justin routes,
publicly served internal build notes, retired card copy, vCard URLs pointing at
a 404, the unfinished proof placeholder, the card form's missing submit
semantics, and the absent canonical/social metadata.
"""

import html.parser
import json
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"
CARD = ROOT / "justin" / "card.html"
VCARD = ROOT / "justin" / "justin-whalen.vcf"
VERCEL = ROOT / "vercel.json"

HOME_URL = "https://www.clearpathwv.com/"
CARD_URL = "https://www.clearpathwv.com/justin/card.html"

# Offer names that no longer exist. They must not resurface on any public page.
RETIRED_OFFER_PHRASES = ("workflow check", "ops desk", "clearpath support")

# Verified live Stripe payment links, duplicated here on purpose: if someone
# edits the value in test_storefront.py to make a failure go away, this file
# still fails.
VERIFIED_CHECKOUT_URLS = {
    "ai-clarity-session": "https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05",
    "starter-pilot": "https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06",
    "core-retainer": "https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07",
    "serious-business-tier": "https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08",
}

INDEX_RAW = INDEX.read_text(encoding="utf-8")
CARD_RAW = CARD.read_text(encoding="utf-8")
VCARD_RAW = VCARD.read_text(encoding="utf-8")
PUBLIC_PAGES = {"index.html": INDEX_RAW, "justin/card.html": CARD_RAW}


class Collector(html.parser.HTMLParser):
    """Collects ids, anchors, form controls and link/meta tags."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.anchors = []
        self.buttons = []
        self.forms = []
        self.links = []
        self.metas = []
        self.images = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if tag == "a":
            self.anchors.append(a)
        elif tag == "button":
            self.buttons.append(a)
        elif tag == "form":
            self.forms.append(a)
        elif tag == "link":
            self.links.append(a)
        elif tag == "meta":
            self.metas.append(a)
        elif tag == "img":
            self.images.append(a)

    handle_startendtag = handle_starttag


def parse(raw):
    p = Collector()
    p.feed(raw)
    return p


INDEX_DOM = parse(INDEX_RAW)
CARD_DOM = parse(CARD_RAW)
DOMS = {"index.html": INDEX_DOM, "justin/card.html": CARD_DOM}


def vcard_fields(raw):
    """Return {property-name-without-params: [values]} for a vCard."""
    fields = {}
    for line in raw.splitlines():
        if not line or ":" not in line:
            continue
        name, value = line.split(":", 1)
        fields.setdefault(name.split(";")[0].upper(), []).append(value)
    return fields


VCARD_FIELDS = vcard_fields(VCARD_RAW)


class TestProductionExposure(unittest.TestCase):
    """Internal build notes and the unused portrait were served publicly."""

    INTERNAL_DOCS = (
        "FABLE-REPORT.md", "FABLE-PLAN.md", "FABLE-SESSION-BRIEF.md",
        "CHECKOUT-CALENDAR-WIRING.md",
    )

    def test_internal_build_docs_are_not_in_the_deployed_tree(self):
        for name in self.INTERNAL_DOCS:
            self.assertFalse((ROOT / name).exists(),
                             f"{name} would be served publicly")

    def test_unused_public_portraits_are_gone(self):
        for name in ("justin.jpg", "justin.webp"):
            self.assertFalse((ROOT / name).exists(),
                             f"unreferenced {name} would be served publicly")

    def test_no_markdown_is_deployable_from_the_site_root(self):
        """Catches the next internal .md, not just the four known ones.

        Markdown may legitimately live in the repo root (LANE-REPORT.md), so
        the real requirement is that it never reaches the deployment. That is
        what .vercelignore is for, and this asserts the rule is actually there
        rather than assuming it.
        """
        ignore = ROOT / ".vercelignore"
        self.assertTrue(ignore.is_file(),
                        ".vercelignore is missing, so repo markdown would ship")
        rules = {line.strip() for line in
                 ignore.read_text(encoding="utf-8").splitlines()
                 if line.strip() and not line.strip().startswith("#")}
        self.assertIn("*.md", rules,
                      "markdown is not excluded from the deployment")
        self.assertIn("tests/", rules,
                      "the test suite is not excluded from the deployment")

    def test_no_html_or_asset_in_the_tree_is_an_internal_document(self):
        """.vercelignore only covers markdown, so nothing internal may hide
        in a shipped file type."""
        shipped = [p for p in ROOT.rglob("*")
                   if p.is_file()
                   and ".git" not in p.parts
                   and "tests" not in p.parts
                   and p.suffix not in (".md",)
                   and not p.name.startswith(".")]
        for path in shipped:
            self.assertNotIn("FABLE", path.name,
                             f"internal artifact would ship: {path.name}")

    def test_public_html_carries_no_internal_developer_notes(self):
        banned = ("NOTES FOR JUSTIN", "owned by the", "LANE-REPORT",
                  "CHECKOUT-CALENDAR-WIRING", "FABLE", "PHONE-OPTIONAL",
                  "TODO", "FIXME", "approved by Justin", "lane:",
                  "Coordinate on merge")
        for name, raw in PUBLIC_PAGES.items():
            comments = re.findall(r"<!--(.*?)-->", raw, re.S)
            for comment in comments:
                for phrase in banned:
                    self.assertNotIn(
                        phrase, comment,
                        f"{name}: internal note leaked in a comment: {phrase!r}")
            # These never belong anywhere in shipped markup, comment or not.
            for phrase in ("NOTES FOR JUSTIN", "LANE-REPORT",
                           "CHECKOUT-CALENDAR-WIRING", "FABLE"):
                self.assertNotIn(phrase, raw,
                                 f"{name}: internal reference leaked: {phrase!r}")


class TestAboutRouteRedirect(unittest.TestCase):
    """Google still indexes /about, so both URL forms must reach the live About section."""

    def setUp(self):
        self.config = json.loads(VERCEL.read_text(encoding="utf-8"))
        self.redirects = self.config.get("redirects", [])
        self.by_source = {r.get("source"): r for r in self.redirects}

    def test_both_about_forms_redirect_permanently_to_the_homepage_section(self):
        for source in ("/about", "/about/"):
            self.assertIn(source, self.by_source,
                          f"no redirect configured for indexed route {source}")
            rule = self.by_source[source]
            self.assertEqual(rule.get("destination"), "/#about",
                             f"{source}: wrong About destination")
            self.assertIs(rule.get("permanent"), True,
                          f"{source}: redirect must be permanent (308)")

    def test_destination_anchor_exists_on_the_homepage(self):
        self.assertIn("about", INDEX_DOM.ids,
                      "redirect destination #about is missing from the homepage")


class TestJustinRouteRedirect(unittest.TestCase):
    """/justin and /justin/ both returned 404 in www and non-www forms."""

    def setUp(self):
        self.config = json.loads(VERCEL.read_text(encoding="utf-8"))
        self.redirects = self.config.get("redirects", [])
        self.by_source = {r.get("source"): r for r in self.redirects}

    def test_both_short_forms_redirect_permanently_to_the_card(self):
        for source in ("/justin", "/justin/"):
            self.assertIn(source, self.by_source,
                          f"no redirect configured for {source}")
            rule = self.by_source[source]
            self.assertEqual(rule.get("destination"), "/justin/card.html",
                             f"{source}: wrong redirect destination")
            self.assertIs(rule.get("permanent"), True,
                          f"{source}: redirect must be permanent (308)")

    def test_redirects_do_not_capture_the_real_assets(self):
        """A greedy /justin/(.*) rule would break the card and the vCard."""
        for asset in ("/justin/card.html", "/justin/justin-whalen.vcf"):
            for source in self.by_source:
                self.assertNotEqual(
                    source, asset, f"{asset} must not be redirected")
                self.assertFalse(
                    source.rstrip("/").endswith("*") and
                    asset.startswith(source.rstrip("*").rstrip("/")),
                    f"wildcard redirect {source!r} would swallow {asset}")

    def test_static_no_build_deployment_is_preserved(self):
        self.assertIsNone(self.config.get("framework"))
        self.assertIsNone(self.config.get("buildCommand"))
        self.assertEqual(self.config.get("outputDirectory"), ".")


class TestVCard(unittest.TestCase):
    """The saved contact must never carry a URL that 404s."""

    def test_required_structure(self):
        lines = VCARD_RAW.strip().splitlines()
        self.assertEqual(lines[0], "BEGIN:VCARD")
        self.assertEqual(lines[1], "VERSION:3.0")
        self.assertEqual(lines[-1], "END:VCARD")
        for required in ("N", "FN", "ORG", "EMAIL", "TEL", "UID", "SOURCE",
                         "URL", "REV"):
            self.assertIn(required, VCARD_FIELDS,
                          f"vCard missing required property: {required}")

    def test_source_is_the_canonical_card_url(self):
        self.assertEqual(VCARD_FIELDS["SOURCE"], [CARD_URL])

    def test_url_fields_are_the_homepage_and_the_canonical_card(self):
        self.assertEqual(sorted(VCARD_FIELDS["URL"]), sorted([HOME_URL, CARD_URL]))

    def test_no_url_field_uses_the_bare_justin_path(self):
        for name in ("SOURCE", "URL"):
            for value in VCARD_FIELDS[name]:
                self.assertNotRegex(
                    value, r"clearpathwv\.com/justin/?$",
                    f"{name} still points at the bare /justin path: {value}")

    def test_rev_is_a_valid_utc_timestamp_and_was_refreshed(self):
        rev = VCARD_FIELDS["REV"][0]
        self.assertRegex(rev, r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
        self.assertNotEqual(rev, "2026-05-15T12:00:00Z",
                            "REV was not refreshed for this revision")

    def test_no_new_personal_information_was_exposed(self):
        for banned in ("ADR", "BDAY", "GEO", "PHOTO", "X-SOCIALPROFILE",
                       "IMPP", "RELATED"):
            self.assertNotIn(banned, VCARD_FIELDS,
                             f"vCard exposes new personal detail: {banned}")

    def test_only_the_one_public_phone_and_email(self):
        self.assertEqual(VCARD_FIELDS["TEL"], ["+17169696155"])
        self.assertEqual(VCARD_FIELDS["EMAIL"], ["JWhalen@ClearPathWV.com"])


class TestCardBuyerJourney(unittest.TestCase):
    def test_retired_offer_phrases_are_absent_from_both_public_pages(self):
        for name, raw in PUBLIC_PAGES.items():
            lowered = raw.lower()
            for phrase in RETIRED_OFFER_PHRASES:
                self.assertNotIn(phrase, lowered,
                                 f"{name}: retired offer resurfaced: {phrase}")

    def test_card_offers_the_current_fit_call_language(self):
        self.assertIn("fit call", CARD_RAW.lower(),
                      "card should point at the current free fit call")

    def test_card_links_to_the_homepage_over_https(self):
        homes = [a for a in CARD_DOM.anchors
                 if a.get("href", "").rstrip("/") == HOME_URL.rstrip("/")]
        self.assertTrue(homes, "card has no clickable HTTPS path to the homepage")
        self.assertEqual(len(homes), 1,
                         "card should carry exactly one restrained homepage link")

    def test_card_does_not_grow_a_second_nav_or_price_menu(self):
        self.assertNotIn("$", CARD_RAW, "card must not turn into a price menu")
        self.assertEqual(CARD_RAW.count("<nav"), 1,
                         "card should keep exactly the one sticky action nav")

    def test_hero_portrait_is_local_sized_and_not_lazy_loaded(self):
        hero = CARD_RAW[:CARD_RAW.index('id="actions"')]
        portraits = [i for i in CARD_DOM.images if "portrait" in i.get("class", "")]
        self.assertEqual(len(portraits), 1, "expected one hero portrait")
        img = portraits[0]
        self.assertIn(img["src"], hero, "portrait must sit above the actions")
        self.assertFalse(img["src"].startswith(("http://", "https://")),
                         "portrait must be a local asset, not a network call")
        self.assertTrue((CARD.parent / img["src"]).is_file(),
                        f"portrait asset missing: {img['src']}")
        self.assertIn("width", img)
        self.assertIn("height", img)
        self.assertNotEqual(img.get("loading"), "lazy",
                            "above-fold portrait must not be lazy-loaded")

    def test_primary_actions_stay_above_the_fold_and_in_order(self):
        head = CARD_RAW[:CARD_RAW.index('class="actions-hint"')]
        self.assertLess(head.index("justin-whalen.vcf"), head.index("sms:"),
                        "Save must come before Text")
        self.assertLess(head.index("sms:"), head.index("mailto:"),
                        "Text must come before Email")

    def test_sticky_mobile_action_bar_is_intact(self):
        bar = CARD_RAW[CARD_RAW.index('class="bar"'):]
        for route in ("justin-whalen.vcf", "sms:+17169696155",
                      "mailto:JWhalen@ClearPathWV.com"):
            self.assertIn(route, bar, f"sticky bar lost its {route} action")

    def test_phone_and_email_plumbing_is_unchanged(self):
        self.assertEqual(CARD_RAW.count("sms:+17169696155"), 3)
        self.assertGreaterEqual(CARD_RAW.count("mailto:JWhalen@ClearPathWV.com"), 3)

    def test_user_preference_media_queries_are_preserved(self):
        for query in ("prefers-reduced-motion: reduce",
                      "prefers-reduced-transparency: reduce",
                      "prefers-contrast: more",
                      "forced-colors: active"):
            self.assertIn(query, CARD_RAW,
                          f"card dropped its @media ({query}) support")


class TestCardFormSemanticsAndPrivacy(unittest.TestCase):
    """Pa11y H32.2: the intake form had no semantic submit control."""

    def test_form_has_exactly_one_semantic_submit_control(self):
        submits = [b for b in CARD_DOM.buttons if b.get("type") == "submit"]
        self.assertEqual(len(submits), 1,
                         "intake form needs exactly one submit button")
        self.assertEqual(submits[0].get("id"), "send-email",
                         "the mail-draft action should be the submit control")

    def test_secondary_actions_stay_non_submitting(self):
        for btn_id in ("send-sms", "send-copy"):
            btn = next(b for b in CARD_DOM.buttons if b.get("id") == btn_id)
            self.assertEqual(btn.get("type"), "button",
                             f"{btn_id} must not submit the form")

    def test_submit_handler_prevents_default_before_opening_a_draft(self):
        match = re.search(
            r"form\.addEventListener\(\s*['\"]submit['\"]\s*,\s*"
            r"function\s*\([^)]*\)\s*\{(.*?)\}\s*\)", CARD_RAW, re.S)
        self.assertIsNotNone(match, "no submit handler bound to the intake form")
        body = match.group(1)
        self.assertIn("preventDefault()", body,
                      "submit handler must call preventDefault()")
        self.assertLess(
            body.index("preventDefault()"), body.index("sendByEmail"),
            "preventDefault() must run before the mail draft is opened")

    def test_form_has_no_native_submission_routing_at_all(self):
        """An earlier revision used method="post" and called that privacy.

        It was not. POST only keeps typed detail out of the URL; it still
        transmits name, business, contact and problem to the host, which this
        card promises never happens. The only safe configuration is no
        submission routing whatsoever.
        """
        form = next(f for f in CARD_DOM.forms if f.get("id") == "intake-form")
        self.assertNotIn("method", form,
                         "intake form must declare no submission method")
        self.assertNotIn("action", form,
                         "intake form must declare no submission target")
        self.assertNotIn("formaction", CARD_RAW,
                         "a formaction attribute would reintroduce routing")
        self.assertNotIn("formmethod", CARD_RAW,
                         "a formmethod attribute would reintroduce routing")

    def test_intake_fields_cannot_be_natively_serialized(self):
        """Without a name attribute a control is skipped by form
        serialization, so even a submission that somehow escaped would carry
        no visitor data."""
        named = re.findall(r'<(?:input|textarea|select)\b[^>]*\bname\s*=',
                           CARD_RAW)
        self.assertEqual(named, [],
                         "an intake control has a name attribute, so its value "
                         "could be serialized into a native submission")
        for field_id in ("i-name", "i-business", "i-contact", "i-problem"):
            self.assertIn(f'id="{field_id}"', CARD_RAW,
                          f"intake field {field_id} disappeared")

    def test_submit_button_is_disabled_in_source(self):
        """Fail-closed: with JS off, or if the script throws before it
        finishes wiring up, the button must stay disabled. A disabled default
        button also makes Enter a no-op under the HTML implicit-submission
        rules, so nothing is transmitted or navigated."""
        button = re.search(r'<button[^>]*id="send-email"[^>]*>', CARD_RAW)
        self.assertIsNotNone(button, "submit button not found")
        self.assertRegex(button.group(0), r'\bdisabled\b',
                         "submit button must ship disabled")

    def test_button_is_enabled_only_after_every_handler_is_installed(self):
        """Ordering is the whole guarantee, so assert the ordering."""
        enable = "document.getElementById('send-email').disabled = false;"
        self.assertIn(enable, CARD_RAW, "script never enables the submit button")
        enable_at = CARD_RAW.index(enable)

        must_precede = {
            "submit guard": "form.addEventListener('submit'",
            "sms handler": "document.getElementById('send-sms')",
            "copy handler": "document.getElementById('send-copy')",
            "form reference": "var form = document.getElementById('intake-form')",
        }
        for label, snippet in must_precede.items():
            self.assertIn(snippet, CARD_RAW, f"missing {label}")
            self.assertLess(
                CARD_RAW.index(snippet), enable_at,
                f"{label} is installed after the button is enabled; the button "
                "must be enabled last so an early failure stays fail-closed")

        # Nothing may run after the enable line except the closing script tag.
        tail = CARD_RAW[enable_at + len(enable):CARD_RAW.index("</script>")]
        self.assertEqual(tail.strip(), "",
                         "code runs after the enable line, so a later failure "
                         f"would leave the button live: {tail.strip()[:80]!r}")

    def test_no_backend_and_no_network_calls(self):
        for banned in ("fetch(", "XMLHttpRequest", "navigator.sendBeacon",
                       "<form action=", "https://api."):
            self.assertNotIn(banned, CARD_RAW,
                             f"card gained a network path: {banned}")

    def test_validation_feedback_fallbacks_and_privacy_note_survive(self):
        self.assertIn('id="empty-hint"', CARD_RAW)
        self.assertIn('aria-live="polite"', CARD_RAW)
        self.assertIn("navigator.clipboard", CARD_RAW, "clipboard fallback lost")
        self.assertIn("execCommand", CARD_RAW, "manual copy fallback lost")
        self.assertIn("sendBySms", CARD_RAW, "SMS fallback lost")
        self.assertIn("Nothing sends automatically", CARD_RAW,
                      "the no-auto-send privacy explanation was removed")

    def test_every_intake_button_describes_the_no_auto_send_boundary(self):
        for btn in CARD_DOM.buttons:
            note = btn.get("aria-describedby", "")
            self.assertTrue(note, f"{btn.get('id')}: missing aria-describedby")
            self.assertIn(note, CARD_DOM.ids,
                          f"{btn.get('id')}: aria-describedby {note!r} resolves "
                          "to nothing")


class TestSampleWorkPlaceholderRemoved(unittest.TestCase):
    """No invented proof: the unfinished placeholder was deleted, not filled."""

    def test_placeholder_section_and_styles_are_gone(self):
        self.assertNotIn('id="sample-work"', INDEX_RAW)
        self.assertNotIn("Proof beats promises", INDEX_RAW)
        self.assertNotIn(".sample{", INDEX_RAW, "dead placeholder CSS remains")

    def test_no_href_points_at_the_removed_anchor(self):
        for name, dom in DOMS.items():
            for a in dom.anchors:
                self.assertNotIn("sample-work", a.get("href", ""),
                                 f"{name}: dangling #sample-work link")

    def test_former_placeholder_links_now_target_a_truthful_section(self):
        """The placeholder's replacement is now real: the hero routes to the
        interactive demo surface, which exists on the page, and the process
        section it once pointed at still exists too. No stale sample-work
        language survives (the dangling-anchor ban is asserted above)."""
        self.assertNotIn("See sample work", INDEX_RAW,
                         "the old placeholder link text survived")
        self.assertIn("see-it-run", INDEX_DOM.ids,
                      "#see-it-run demo surface does not exist")
        hero = INDEX_RAW[INDEX_RAW.index('<section class="hero"'):
                         INDEX_RAW.index('id="familiar"')]
        self.assertIn('href="#see-it-run"', hero,
                      "hero lost its route to the working demo surface")
        self.assertIn("how", INDEX_DOM.ids, "#how target section does not exist")

    def test_no_invented_proof_language_replaced_it(self):
        lowered = INDEX_RAW.lower()
        for phrase in ("case study", "testimonial", "clients say",
                       "trusted by", "% savings", "hours saved"):
            self.assertNotIn(phrase, lowered,
                             f"unverifiable proof claim appeared: {phrase}")


class TestCheckoutScopeGuardrails(unittest.TestCase):
    def setUp(self):
        self.ctas = [a for a in INDEX_DOM.anchors
                     if "data-checkout-offer" in a]

    def test_every_checkout_cta_keeps_its_verified_url(self):
        self.assertEqual(len(self.ctas), len(VERIFIED_CHECKOUT_URLS))
        for a in self.ctas:
            slug = a["data-checkout-offer"]
            self.assertEqual(a["href"], VERIFIED_CHECKOUT_URLS[slug],
                             f"{slug}: checkout URL drifted")

    def test_every_checkout_cta_has_a_resolving_aria_describedby(self):
        for a in self.ctas:
            slug = a["data-checkout-offer"]
            note = a.get("aria-describedby", "")
            self.assertTrue(note, f"{slug}: checkout CTA has no scope note")
            self.assertIn(note, INDEX_DOM.ids,
                          f"{slug}: aria-describedby {note!r} resolves to nothing")

    def test_implementation_tiers_state_the_written_scope_boundary(self):
        expected_charge = {
            "starter-pilot": "$2,000",
            "core-retainer": "$4,000",
            "serious-business-tier": "$8,000",
        }
        for a in self.ctas:
            slug = a["data-checkout-offer"]
            if slug not in expected_charge:
                continue
            note = re.search(
                r'id="%s"[^>]*>(.*?)</p>' % re.escape(a["aria-describedby"]),
                INDEX_RAW, re.S).group(1)
            self.assertIn(expected_charge[slug], note,
                          f"{slug}: scope note omits the first charge")
            self.assertIn("written scope", note,
                          f"{slug}: scope note omits the written-scope gate")

    def test_clarity_session_note_is_offer_appropriate(self):
        cta = next(a for a in self.ctas
                   if a["data-checkout-offer"] == "ai-clarity-session")
        note = re.search(
            r'id="%s"[^>]*>(.*?)</p>' % re.escape(cta["aria-describedby"]),
            INDEX_RAW, re.S).group(1)
        self.assertIn("$395", note)
        self.assertNotIn("written scope", note,
                         "the one-time session must not claim written "
                         "implementation scope")

    def test_first_charge_disclosures_survive(self):
        for amount in ("Charged today: $2,000.", "Charged today: $4,000.",
                       "Charged today: $8,000."):
            self.assertIn(amount, INDEX_RAW)


class TestMetadataAndAssets(unittest.TestCase):
    CANONICALS = {"index.html": HOME_URL, "justin/card.html": CARD_URL}

    def test_both_pages_declare_a_canonical_url(self):
        for name, dom in DOMS.items():
            canon = [l for l in dom.links if l.get("rel") == "canonical"]
            self.assertEqual(len(canon), 1, f"{name}: expected one canonical tag")
            self.assertEqual(canon[0]["href"], self.CANONICALS[name])

    def test_both_pages_carry_open_graph_and_twitter_card_metadata(self):
        for name, dom in DOMS.items():
            props = {m.get("property") for m in dom.metas}
            names = {m.get("name") for m in dom.metas}
            for required in ("og:title", "og:description", "og:url",
                             "og:image", "og:type"):
                self.assertIn(required, props, f"{name}: missing {required}")
            for required in ("twitter:card", "twitter:title",
                             "twitter:description", "twitter:image"):
                self.assertIn(required, names, f"{name}: missing {required}")

    def test_social_images_point_at_an_asset_that_exists(self):
        for name, dom in DOMS.items():
            for meta in dom.metas:
                if meta.get("property") == "og:image" or \
                        meta.get("name") == "twitter:image":
                    url = meta["content"]
                    self.assertTrue(url.startswith(HOME_URL),
                                    f"{name}: social image is off-site: {url}")
                    self.assertTrue((ROOT / url[len(HOME_URL):]).is_file(),
                                    f"{name}: social image missing: {url}")

    def test_homepage_json_ld_states_only_published_facts(self):
        block = re.search(
            r'<script type="application/ld\+json">(.*?)</script>',
            INDEX_RAW, re.S)
        self.assertIsNotNone(block, "homepage has no JSON-LD block")
        data = json.loads(block.group(1))
        self.assertEqual(data["@context"], "https://schema.org")
        self.assertEqual(data["name"], "ClearPath")
        self.assertEqual(data["url"], HOME_URL)
        self.assertEqual(data["email"], "JWhalen@ClearPathWV.com")
        served = json.dumps(data["areaServed"])
        self.assertIn("Ellicottville", served)
        self.assertIn("Western New York", served)
        for invented in ("address", "openingHours", "openingHoursSpecification",
                         "aggregateRating", "review", "telephone", "priceRange"):
            self.assertNotIn(invented, data,
                             f"JSON-LD invents an unpublished fact: {invented}")

    def test_homepage_favicon_is_a_small_real_asset(self):
        icons = [l for l in INDEX_DOM.links if "icon" in l.get("rel", "")]
        self.assertEqual(len(icons), 1, "expected one homepage favicon link")
        href = icons[0]["href"].lstrip("/")
        asset = ROOT / href
        self.assertTrue(asset.is_file(), f"favicon asset missing: {href}")
        self.assertLess(asset.stat().st_size, 20_000,
                        "favicon should be a small purpose-built asset, "
                        "not the full-size logo")
        self.assertNotIn("clearpath-logo", href)

    def test_images_declare_dimensions(self):
        for name, dom in DOMS.items():
            for img in dom.images:
                self.assertIn("width", img, f"{name}: image without width")
                self.assertIn("height", img, f"{name}: image without height")

    def test_founder_image_is_a_real_external_asset_not_a_data_uri(self):
        """Controller browser QA, 390x844: the founder image stayed blank
        after scrollIntoView + 700ms (complete=false, naturalWidth=0), and
        the full-page desktop capture showed an empty portrait box. Cause was
        a ~122 KB inline base64 data URI carrying loading="lazy". A real file
        loads normally on scroll, in full-page capture, and on cold load.
        """
        portraits = [i for i in INDEX_DOM.images
                     if "portrait" in i.get("class", "")]
        self.assertEqual(len(portraits), 1, "expected one founder image")
        img = portraits[0]
        src = img["src"]

        self.assertFalse(src.startswith("data:"),
                         "founder image regressed to an inline data URI")
        self.assertNotIn("base64", src)
        self.assertFalse(src.startswith(("http://", "https://")),
                         "founder image must be served from this origin")

        asset = ROOT / src.lstrip("/")
        self.assertTrue(asset.is_file(),
                        f"founder image asset does not exist: {src}")
        self.assertGreater(asset.stat().st_size, 1024,
                           "founder image asset looks empty or truncated")
        self.assertLess(asset.stat().st_size, 250_000,
                        "founder image asset is not optimized")

        self.assertIn("width", img, "founder image needs an explicit width")
        self.assertIn("height", img, "founder image needs an explicit height")
        self.assertNotEqual(
            img.get("loading"), "lazy",
            "the founder image is the one that failed QA while deferred; "
            "keep it eager so scroll, full-page capture and cold load agree")

    def test_no_page_embeds_a_base64_image_payload(self):
        """The inline payload was also why index.html was 177 KB."""
        for name, raw in PUBLIC_PAGES.items():
            self.assertNotIn("data:image/jpeg;base64", raw,
                             f"{name}: inline JPEG payload")
            self.assertNotIn("data:image/png;base64", raw,
                             f"{name}: inline PNG payload")
            self.assertNotIn("data:image/webp;base64", raw,
                             f"{name}: inline WebP payload")

    def test_founder_image_keeps_its_descriptive_alt_text(self):
        img = next(i for i in INDEX_DOM.images
                   if "portrait" in i.get("class", ""))
        self.assertEqual(
            img.get("alt"),
            "Justin Whalen, founder of ClearPath, smiling on a snowy ski slope",
            "founder image alt text changed")


class TestPublicCopyVoice(unittest.TestCase):
    def test_no_em_dashes_on_any_public_page(self):
        for name, raw in PUBLIC_PAGES.items():
            self.assertNotIn("—", raw, f"{name}: em dash in public copy")

    def test_no_em_dashes_in_the_vcard(self):
        self.assertNotIn("—", VCARD_RAW)

    def test_public_ladder_prices_are_unchanged(self):
        for amount in ("$395", "$1,500", "$500", "$2,500", "$5,000", "$3,000"):
            self.assertIn(amount, INDEX_RAW, f"ladder price missing: {amount}")

    def test_human_approval_boundary_is_still_stated(self):
        lowered = INDEX_RAW.lower()
        self.assertIn("approve", lowered)
        self.assertIn("without your approval", lowered)


if __name__ == "__main__":
    unittest.main()
