"""Per-project pricing guardrails (replaces the three-plan picker tests).

Standard library only. Run from the repo root:
    python3 -m unittest discover tests -v
"""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "assets" / "site.css").read_text(encoding="utf-8")
PAGES = [ROOT / "index.html"] + sorted((ROOT / "demos").rglob("index.html"))


def section(sid):
    start = RAW.index(f'id="{sid}"')
    return RAW[start:RAW.index("</section>", start)]


class TestPerProjectPricing(unittest.TestCase):
    def test_old_plan_picker_is_gone(self):
        pricing = section("pricing")
        self.assertNotIn("data-pricing-picker", pricing)
        self.assertNotIn('role="tablist"', pricing)

    def test_path_runs_session_quote_pay_build(self):
        path = section("pricing")
        path = path[path.index('<ol class="path"'):path.index("</ol>")]
        self.assertEqual(path.count("<li"), 4)
        for step in ("Clarity Session", "Fixed quote", "You approve and pay",
                     "I build, test, and hand off"):
            self.assertIn(step, path)

    def test_session_terms_state_non_refundable_and_credit(self):
        clarity = section("clarity-session")
        self.assertIn("non-refundable", clarity)
        self.assertIn("Credited in full toward your project", clarity)

    def test_caveat_line_is_body_text_not_monospace(self):
        rule = re.search(r"\.pricing-foot\{[^}]*\}", CSS).group(0)
        self.assertNotIn("var(--mono)", rule)
        self.assertNotIn('class="pricing-foot', RAW)

    def test_single_badge_no_popularity_claims(self):
        for claim in ("Main offer", "Most owners start here",
                      "This is where most owners start"):
            self.assertNotIn(claim, RAW)

    def test_nav_links_clarity_and_pricing_on_every_page(self):
        for page in PAGES:
            raw = page.read_text(encoding="utf-8")
            nav = raw[raw.index('class="top"'):raw.index("</header>")]
            self.assertIn("#clarity-session", nav, f"{page}: nav lacks Clarity Session")
            self.assertIn("#pricing", nav, f"{page}: nav lacks Pricing")

    def test_footer_names_billing_entity_and_policies(self):
        for page in PAGES:
            raw = page.read_text(encoding="utf-8")
            foot = raw[raw.index("<footer"):]
            self.assertIn("Whalen Ventures LLC", foot, f"{page}: billing note missing")
            self.assertIn('href="/privacy/"', foot)
            self.assertIn('href="/terms/"', foot)

    def test_internal_retainer_levels_and_client_names_never_ship(self):
        for page in PAGES + sorted((ROOT / "terms").rglob("index.html")) + sorted((ROOT / "privacy").rglob("index.html")):
            raw = page.read_text(encoding="utf-8")
            for hidden in ("$1,500/mo", "$3,000/mo", "$1,500 a month", "$3,000 a month",
                           "$1,500 per month", "$3,000 per month", "$125", "Zoho",
                           "Route Manager", "B&amp;B", "B&B", "Hope's"):
                self.assertNotIn(hidden, raw, f"{page}: internal or client detail in public copy: {hidden!r}")

    def test_public_monthly_options_are_care_250_and_upkeep_500(self):
        pricing = section("pricing")
        self.assertIn("$250/mo", pricing)
        self.assertIn("$500/mo", pricing)
        self.assertIn("manager backend", pricing)
        self.assertIn("Not web hosting", pricing)

    def test_milestones_match_the_confirmed_splits(self):
        pricing = section("pricing")
        self.assertIn("Projects under $2,500 are paid in full upfront", pricing)
        self.assertIn("50% to start and 50% before handoff", pricing)
        self.assertIn("40% to start, 30% midway, and 30% before handoff", pricing)

    def test_placeholders_are_visibly_marked(self):
        marks = re.findall(r'<mark class="tbc">(.*?)</mark>', RAW, re.S)
        self.assertTrue(marks, "draft placeholders must use <mark class=\"tbc\">")
        self.assertIn("mark.tbc", CSS)
        stray = re.sub(r'<mark class="tbc">.*?</mark>', "", RAW, flags=re.S)
        self.assertNotIn("JUSTIN TO CONFIRM", stray,
                         "an unmarked placeholder would read as final copy")


if __name__ == "__main__":
    unittest.main()
