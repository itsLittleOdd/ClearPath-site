"""Post-release homepage tightening guardrails.

Standard library only. Run from the repo root:
    python3 -m unittest discover -s tests -v

test_storefront.py owns offer/pricing/CTA wiring, test_demos.py owns the demo
lane, and test_repair_regressions.py owns the contact-card and metadata
repairs. This module owns the 2026-08-03 tightening pass: the explicitly
fictional hero before/after proof surface, the high-page Clarity Session
path, the concrete hero demo action and high-page demo-lane routes, the
script-off fallback that leads with sample transformations instead of a
technical complaint, the mobile scanability trims, and the browser harness's
ability to write evidence outside the Git worktree.

Every file is read with a missing-file fallback of "" so a missing behavior
fails an assertion, never test discovery.
"""

import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent

INDEX = ROOT / "index.html"
SITE_CSS = ROOT / "assets" / "site.css"
HARNESS = ROOT / "tests" / "browser_journeys.mjs"

DEMO_ROUTES = (
    "/demos/request-desk/",
    "/demos/business-brain/",
    "/demos/website-manager/",
)


def read(path):
    """Missing behavior must fail assertions, not module import."""
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8")


def slice_between(raw, start_marker, end_marker):
    """Raw slice between two markers, or "" when either is missing."""
    start = raw.find(start_marker)
    if start == -1:
        return ""
    end = raw.find(end_marker, start)
    if end == -1:
        return ""
    return raw[start:end]


def text_of(fragment):
    """Tag-stripped, whitespace-normalized text of an HTML fragment."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)).strip()


RAW = read(INDEX)
CSS_RAW = read(SITE_CSS)
HERO = slice_between(RAW, '<section class="hero"', 'id="familiar"')


class TestHeroProofSurface(unittest.TestCase):
    """A. The hero carries a compact, explicitly fictional before/after
    proof surface that shows the transformation at a glance."""

    def proof(self):
        return slice_between(HERO, 'id="hero-proof"', "</aside>")

    def test_hero_contains_the_proof_surface(self):
        self.assertIn('id="hero-proof"', HERO,
                      "hero has no before/after proof surface")

    def test_proof_is_labeled_sample_and_fictional(self):
        proof = self.proof()
        self.assertIn("Sample workflow", proof,
                      "proof surface must call itself a sample workflow")
        self.assertIn("fictional", proof,
                      "proof surface must say the business is fictional")
        self.assertIn("not a client result", proof,
                      "proof surface must deny being a client result")

    def test_proof_walks_before_and_after(self):
        proof = self.proof()
        for label in (">Before<", ">After<"):
            self.assertIn(label, proof.replace("</span>", "<"),
                          f"proof surface missing the {label} label")
        lowered = text_of(proof).lower()
        for beat in ("facts", "flagged", "draft", "owner approv"):
            self.assertIn(beat, lowered,
                          f"proof surface missing the {beat!r} beat")

    def test_proof_shows_a_concrete_messy_request(self):
        lowered = text_of(self.proof()).lower()
        self.assertIn("catered", lowered,
                      "the before pane should quote a concrete request")
        self.assertIn("missing", lowered,
                      "the before/after must show a missing-detail gap")

    def test_proof_claims_no_real_results(self):
        lowered = text_of(self.proof()).lower()
        for banned in ("hours", "saved", "%", "revenue", "conversion",
                       "accuracy", "faster"):
            self.assertNotIn(banned, lowered,
                             f"proof surface claims a result: {banned!r}")

    def test_proof_styles_exist_in_the_shared_stylesheet(self):
        for selector in (".hero-grid", ".hero-proof", ".proof-label"):
            self.assertIn(selector, CSS_RAW,
                          f"stylesheet missing {selector} for the proof "
                          "surface")


class TestHeroClarityPath(unittest.TestCase):
    """C. A high-page path to the one-time $395 AI Clarity Session sits in
    the hero, naming the personalized Clarity Plan, without becoming a
    second checkout CTA."""

    def test_hero_links_to_the_clarity_session(self):
        self.assertIn('href="#clarity-session"', HERO,
                      "hero has no path to the Clarity Session")

    def test_path_names_price_offer_and_plan(self):
        path = text_of(slice_between(HERO, 'class="hero-clarity', "</p>"))
        self.assertIn("$395", path,
                      "clarity path must name the $395 price")
        self.assertIn("AI Clarity Session", path,
                      "clarity path must name the offer")
        self.assertIn("personalized Clarity Plan", path,
                      "clarity path must mention the Clarity Plan")
        self.assertIn("one-time", path,
                      "clarity path must say the session is one-time")

    def test_path_is_not_a_second_checkout_cta(self):
        self.assertNotIn("data-checkout-offer", HERO,
                         "the hero must not gain a checkout CTA; the only "
                         "Clarity Session checkout stays in its own section")

    def test_approved_clarity_section_is_untouched(self):
        clarity = slice_between(RAW, 'id="clarity-session"',
                                'id="pricing"')
        self.assertIn("$395 one time", clarity)
        self.assertIn(
            'href="https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05"', clarity)
        self.assertIn("30-45 minute working session", clarity)
        self.assertIn("ClearPath does not provide legal, tax, medical, "
                      "insurance, financial, or compliance advice.", clarity)


class TestHeroDemoLane(unittest.TestCase):
    """B. The hero demo action is concrete, and the three full demo routes
    are reachable from the first screen."""

    def test_primary_demo_cta_names_the_action(self):
        self.assertNotIn(">Try a working demo<", RAW,
                         "the hero demo CTA may not stay generic")
        cta = re.search(r'<a class="btn" href="#see-it-run">([^<]+)</a>',
                        HERO)
        self.assertIsNotNone(cta, "hero primary demo CTA missing")
        self.assertEqual(cta.group(1).strip(), "Run a sample request now",
                         "hero demo CTA must name the concrete action")

    def test_hero_routes_to_all_three_full_demos(self):
        for route in DEMO_ROUTES:
            self.assertIn('href="%s"' % route, HERO,
                          f"hero demo lane missing route {route}")


class TestFallbackLeadsWithTransformations(unittest.TestCase):
    """B. The script-off fallback leads with the sample transformations,
    keeps all three full demo routes, and stays honest about scripts."""

    def fallback(self):
        return slice_between(RAW, 'id="see-fallback"', 'id="see-shell"')

    def test_banned_technical_headline_is_gone(self):
        self.assertNotIn("The interactive demos need JavaScript.", RAW,
                         "the fallback still opens with the technical "
                         "complaint instead of the demos")

    def test_fallback_leads_with_sample_transformations(self):
        heading = re.search(r"<h3[^>]*>(.*?)</h3>", self.fallback(), re.S)
        self.assertIsNotNone(heading, "fallback lost its heading")
        self.assertEqual(
            text_of(heading.group(1)),
            "Three sample transformations, one fictional cafe.",
            "fallback must open with the transformations, not a limitation")

    def test_fallback_still_links_all_three_demo_routes(self):
        fallback = self.fallback()
        for route in DEMO_ROUTES:
            self.assertIn('href="%s"' % route, fallback,
                          f"script-off visitors lost the route {route}")

    def test_fallback_still_describes_each_transformation(self):
        lowered = text_of(self.fallback()).lower()
        for beat in ("facts", "flagged", "reply", "owner approval",
                     "cannot-confirm", "publish"):
            self.assertIn(beat, lowered,
                          f"fallback no longer describes the {beat!r} step")

    def test_fallback_keeps_a_short_honest_script_note(self):
        self.assertIn("scripts off", text_of(self.fallback()).lower(),
                      "fallback should still say, briefly and honestly, "
                      "that scripts are off in this view")


class TestMobileScanability(unittest.TestCase):
    """D. Dense copy is tightened without losing the safety language:
    shorter hero lede, bold lead lines in the Clarity and About paragraphs,
    and no decorative hero squiggle delaying phones."""

    def test_hero_lede_is_tight_and_keeps_the_safety_promise(self):
        lede = text_of(slice_between(HERO, '<p class="lede', "</p>"))
        self.assertLessEqual(
            len(lede), 260,
            f"hero lede is {len(lede)} characters; keep it phone-scannable")
        self.assertIn("nothing leaves without your okay", lede,
                      "the safety promise may not be trimmed away")
        self.assertIn("A person checks anything important", lede,
                      "the human-check promise may not be trimmed away")

    def test_clarity_copy_opens_with_bold_lead_lines(self):
        clarity = slice_between(RAW, 'class="clarity-copy"',
                                'class="clarity-scope"')
        for lead in ("<strong>Bring the pile.</strong>",
                     "<strong>Leave with a plan.</strong>"):
            self.assertIn(lead, clarity,
                          f"clarity paragraph missing bold lead {lead!r}")
        self.assertIn("personalized Clarity Plan", clarity,
                      "the Clarity Plan deliverable may not be trimmed away")

    def test_about_paragraphs_open_with_bold_lead_lines(self):
        about = slice_between(RAW, 'class="about-copy', "</div>")
        for lead in ("<strong>I'm Justin Whalen.</strong>",
                     "<strong>Built with your team.</strong>",
                     "<strong>Local and reachable.</strong>"):
            self.assertIn(lead, about,
                          f"about paragraph missing bold lead {lead!r}")

    def test_decorative_hero_line_is_skipped_on_small_screens(self):
        marker = "@media (max-width:680px)"
        self.assertIn(marker, CSS_RAW, "small-screen media block missing")
        block = CSS_RAW[CSS_RAW.index(marker):CSS_RAW.index(marker) + 1400]
        self.assertIn(".hero-line{display:none}", block,
                      "the decorative squiggle should not spend first-screen "
                      "pixels on phones")


class TestBrowserEvidenceRedirect(unittest.TestCase):
    """Verification 6. The browser harness can write its evidence outside
    the Git worktree through CLEARPATH_BROWSER_OUT while keeping its
    current tests/ default."""

    def test_harness_honors_the_external_out_env_var(self):
        self.assertIn("process.env.CLEARPATH_BROWSER_OUT", read(HARNESS),
                      "harness has no external evidence destination hook")

    def test_harness_retains_its_default_location(self):
        self.assertIn("process.env.CLEARPATH_BROWSER_OUT || HERE",
                      read(HARNESS),
                      "with the variable unset, evidence must still land "
                      "in tests/ exactly as before")

    def test_screenshots_and_chrome_profile_both_follow_the_destination(self):
        raw = read(HARNESS)
        self.assertIn("join(OUT, 'screenshots')", raw,
                      "screenshots must derive from the destination base")
        self.assertIn("join(OUT, '.chrome-tmp')", raw,
                      "the throwaway Chrome profile must also leave the "
                      "worktree when evidence is redirected")


if __name__ == "__main__":
    unittest.main()
