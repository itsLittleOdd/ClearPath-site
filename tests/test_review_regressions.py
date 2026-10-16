"""Ported and corrected guardrails from the first verification (2026-10-16).

Ported from the retired September modules where still applicable: duplicate
ids, ARIA/label reference integrity, prohibited generic-container naming,
numeric contrast of the design tokens, labeled form controls. New: the exact
standalone Clarity credit sentence, parked-bar semantics, 320 px CSS rules.

    /opt/homebrew/bin/python3.14 -m unittest tests.test_review_regressions -v
"""

import html.parser
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAGES = [
    "index.html", "services/index.html", "work/index.html", "pricing/index.html",
    "contact/index.html", "thank-you/index.html", "privacy/index.html", "terms/index.html",
    "demos/index.html", "demos/request-desk/index.html", "demos/business-brain/index.html",
    "demos/website-manager/index.html", "404.html",
]
GENERIC_TAGS = {"div", "span", "p", "ul", "ol", "li", "dl", "dd", "dt"}
LANDMARK_OK = {"nav", "aside", "section", "form", "main", "header", "footer", "figure", "article", "video", "img", "input", "select", "textarea", "button", "a", "summary", "details", "iframe"}


class Dom(html.parser.HTMLParser):
    def __init__(self, raw):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = []
        self.feed(raw)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id") is not None:
            self.ids.append(attrs["id"])


RAW = {p: (ROOT / p).read_text(encoding="utf-8") for p in PAGES}
DOM = {p: Dom(RAW[p]) for p in PAGES}
CSS = (ROOT / "assets" / "site.css").read_text(encoding="utf-8")
TOKENS = dict(re.findall(r"--([a-z-]+):(#[0-9A-Fa-f]{6});", CSS))


def luminance(hex_color):
    def channel(c):
        c = int(c, 16) / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = channel(hex_color[1:3]), channel(hex_color[3:5]), channel(hex_color[5:7])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg, bg):
    l1, l2 = luminance(fg), luminance(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


class TestReferenceIntegrity(unittest.TestCase):
    def test_no_duplicate_ids_on_any_page(self):
        for p, dom in DOM.items():
            seen = set()
            for element_id in dom.ids:
                self.assertNotIn(element_id, seen, "%s: duplicate id %r" % (p, element_id))
                seen.add(element_id)

    def test_aria_and_label_references_resolve(self):
        attr_re = re.compile(r'(aria-controls|aria-labelledby|aria-describedby|for)="([^"]+)"')
        for p, raw in RAW.items():
            ids = set(DOM[p].ids)
            for attr, value in attr_re.findall(raw):
                for token in value.split():
                    self.assertIn(token, ids, "%s: %s points at missing id %r" % (p, attr, token))

    def test_every_form_control_has_an_accessible_label(self):
        for p, dom in DOM.items():
            labels = {a.get("for") for t, a in dom.tags if t == "label"}
            for t, a in dom.tags:
                if t in ("input", "select", "textarea") and a.get("type") not in ("hidden", "submit", "button"):
                    ok = a.get("id") in labels or a.get("aria-label") or a.get("aria-labelledby")
                    self.assertTrue(ok, "%s: unlabeled %s %r" % (p, t, a.get("id")))

    def test_no_aria_label_on_generic_containers(self):
        """Generic elements (div, span, list items) must not carry aria-label
        unless they also carry an explicit role. Landmarks and widgets may."""
        for p, dom in DOM.items():
            for t, a in dom.tags:
                if "aria-label" in a and t in GENERIC_TAGS:
                    self.assertTrue(a.get("role"), "%s: aria-label on generic <%s class=%r> without a role" % (p, t, a.get("class")))
        self.assertNotIn('class="video-still" aria-label', RAW["index.html"])
        self.assertNotIn('class="video-still" aria-label', RAW["work/index.html"])
        self.assertIn('<nav class="sticky-cta" data-sticky-cta aria-label="Quote shortcut">', RAW["pricing/index.html"])
        self.assertIn('id="draft-body" role="region" tabindex="0" aria-label="Email draft text"', RAW["contact/index.html"])

    def test_exactly_one_h1_per_page(self):
        for p, dom in DOM.items():
            self.assertEqual(sum(1 for t, _ in dom.tags if t == "h1"), 1, p)


class TestContrastTokens(unittest.TestCase):
    PAIRS = [
        ("ink-soft", "paper", 4.5), ("ink-soft", "paper-deep", 4.5), ("ink-soft", "card", 4.5),
        ("teal-text", "paper", 4.5), ("teal-text", "card", 4.5), ("teal-text", "teal-tint", 4.5),
        ("clay-ink", "paper", 4.5), ("clay-ink", "clay-wash", 4.5), ("ink", "paper", 7.0),
        ("ink", "teal-tint", 7.0), ("ink", "clay-wash", 7.0),
    ]

    def test_token_pairs_meet_wcag_aa(self):
        for fg, bg, minimum in self.PAIRS:
            ratio = contrast(TOKENS[fg], TOKENS[bg])
            self.assertGreaterEqual(ratio, minimum, "%s on %s = %.2f" % (fg, bg, ratio))

    def test_literal_pairs_meet_wcag_aa(self):
        self.assertGreaterEqual(contrast("#FFFFFF", TOKENS["teal"]), 4.5, "white on teal button")
        self.assertGreaterEqual(contrast(TOKENS["paper"], TOKENS["teal-deep"]), 4.5, "paper on final band")
        self.assertGreaterEqual(contrast("#C9E2DC", TOKENS["teal-deep"]), 4.5, "band body copy")
        self.assertGreaterEqual(contrast("#D8DEE4", TOKENS["ink"]), 4.5, "hold column copy")
        self.assertGreaterEqual(contrast(TOKENS["clay"], TOKENS["paper"]), 3.0, "focus ring against paper")


class TestCorrectedCopyAndLayout(unittest.TestCase):
    CREDIT = "The full $395 is credited to your first project when you accept its quote within 30 days of the quote date."

    def test_credit_sentence_is_standalone_wherever_it_appears(self):
        # Standalone means: starts the text, follows sentence punctuation, or
        # starts its own element (tags are replaced by a "|" boundary).
        pattern = re.compile(r"(^|[.!?|] )" + re.escape(self.CREDIT))
        for p in ("index.html", "services/index.html", "pricing/index.html"):
            text = re.sub(r"<[^>]+>", " | ", RAW[p])
            text = re.sub(r"\s+", " ", text)
            self.assertIn(self.CREDIT, text, p)
            self.assertIsNotNone(pattern.search(text), "%s: credit sentence not standalone" % p)
            self.assertNotIn("and the full $395", text, p)

    def test_320px_reflow_rules_present_and_no_overflow_concealment(self):
        self.assertIn(".ledger .price,.summary-prices .price,.service-aside .line .price{white-space:normal", CSS)
        self.assertNotRegex(CSS, r"(html|body)\{[^}]*overflow-x:hidden")
        self.assertNotRegex(CSS, r"\.wrap\{[^}]*overflow:hidden")

    def test_parked_bar_semantics(self):
        js = (ROOT / "assets" / "site.js").read_text(encoding="utf-8")
        self.assertIn("sticky.contains(document.activeElement)", js)
        self.assertIn("setAttribute('inert', '')", js)
        self.assertIn(".sticky-cta.is-parked{visibility:hidden", CSS)

    def test_website_manager_engine_withdraws_indicators_on_input(self):
        js = (ROOT / "assets" / "website-manager.js").read_text(encoding="utf-8")
        self.assertIn("function withdrawApprovalIndicators()", js)
        body = js[js.index("function onDraftInput()"):js.index("function approveForDemo()")]
        self.assertIn("withdrawApprovalIndicators();", body)
        # The empty-draft branch specifically (not the earlier !selected guard)
        # must reset the approval chip before it returns.
        empty_branch = body.split("if (!draft) {", 1)[1].split("return;", 1)[0]
        self.assertIn("setChip(approveChip, 'is-ready', 'Waiting for a draft');", empty_branch)
        self.assertIn("approveButton.disabled = true;", empty_branch)
        # The withdrawal helper itself clears every published indicator.
        helper = js[js.index("function withdrawApprovalIndicators()"):js.index("function onDraftInput()")]
        for needle in ("approved = false;", "publishButton.disabled = true;", "pubNote.hidden = true;", "setText(pubBadge, 'Preview');"):
            self.assertIn(needle, helper, needle)

    def test_retired_test_stubs_are_described_honestly(self):
        for name in ("test_demos.py", "test_repair_regressions.py", "test_storefront.py", "test_rebuild_architecture.py"):
            text = (ROOT / "tests" / name).read_text(encoding="utf-8")
            self.assertIn("Retired", text, name)
        self.assertTrue((ROOT / "docs" / "regression-coverage-map.md").is_file())


if __name__ == "__main__":
    unittest.main()
