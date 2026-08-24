"""Guided pricing-picker acceptance tests.

The source page must remain useful without JavaScript, so all three plan panels
stay present in the HTML. JavaScript may progressively enhance them into one
selected detail panel.
"""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = (ROOT / "index.html").read_text(encoding="utf-8")
HOME_JS = (ROOT / "assets" / "home.js").read_text(encoding="utf-8")
SITE_CSS = (ROOT / "assets" / "site.css").read_text(encoding="utf-8")
COMPACT_CSS = re.sub(r"\s+", "", SITE_CSS)


def pricing_slice():
    start = RAW.index('<section class="pricing" id="pricing">')
    end = RAW.index("</section>", start)
    return RAW[start:end]


class TestGuidedPricingStructure(unittest.TestCase):
    def test_three_accessible_choices_control_three_source_visible_panels(self):
        pricing = pricing_slice()
        self.assertIn("data-pricing-picker", pricing)
        self.assertRegex(
            pricing,
            r'<div class="pricing-options"[^>]*role="tablist"',
        )

        tabs = re.findall(
            r'<button class="pricing-choice"[^>]*role="tab"[^>]*'
            r'id="([^"]+)"[^>]*aria-controls="([^"]+)"[^>]*'
            r'aria-selected="(true|false)"[^>]*>',
            pricing,
        )
        self.assertEqual(len(tabs), 3)
        self.assertEqual(sum(selected == "true" for _, _, selected in tabs), 1)
        self.assertEqual(
            next(tab_id for tab_id, _, selected in tabs if selected == "true"),
            "pricing-tab-core",
        )

        for tab_id, panel_id, _ in tabs:
            opening = re.search(
                rf'<div class="tier pricing-panel[^\"]*"[^>]*'
                rf'id="{re.escape(panel_id)}"[^>]*role="tabpanel"[^>]*'
                rf'aria-labelledby="{re.escape(tab_id)}"[^>]*>',
                pricing,
            )
            self.assertIsNotNone(opening, f"missing panel controlled by {tab_id}")
            if opening is None:
                continue
            self.assertNotIn(
                " hidden",
                opening.group(0),
                "all plans must remain source-visible when JavaScript is unavailable",
            )


class TestGuidedPricingEnhancement(unittest.TestCase):
    def test_home_script_progressively_enhances_the_pricing_tabs(self):
        self.assertIn("document.querySelector('[data-pricing-picker]')", HOME_JS)
        self.assertIn("querySelector('[data-pricing-tabs]')", HOME_JS)
        self.assertIn("initTablist(pricingTabs)", HOME_JS)
        self.assertIn("classList.add('pricing-ready')", HOME_JS)


class TestGuidedPricingPresentation(unittest.TestCase):
    def test_picker_has_selected_state_price_pair_and_responsive_layout(self):
        self.assertIn(
            ".pricing-picker{display:grid;grid-template-columns:minmax(260px,.78fr)minmax(0,1.22fr);",
            COMPACT_CSS,
        )
        self.assertIn(
            ".pricing-options{display:flex;flex-direction:column;gap:12px;",
            COMPACT_CSS,
        )
        self.assertIn('.pricing-choice[aria-selected="true"]{', COMPACT_CSS)
        self.assertIn(
            ".pricing-price-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));",
            COMPACT_CSS,
        )
        responsive = COMPACT_CSS[COMPACT_CSS.index("@media(max-width:900px){"):]
        self.assertIn(".pricing-picker{grid-template-columns:1fr}", responsive)


if __name__ == "__main__":
    unittest.main()
