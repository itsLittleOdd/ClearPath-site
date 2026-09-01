"""Architecture guardrails for the 2026-09-01 rebuild.

Standard library only. Run from the repo root:
    python -m unittest discover tests -v

Earlier modules own the offer wiring (test_storefront), the contact-card and
metadata repairs (test_repair_regressions), the demo lane (test_demos) and the
2026-08-03 tightening pass (test_homepage_tightening). This module owns what
the rebuild introduced: the shared header with a script-free menu, skip links,
the ledger information architecture, the landscape social image, the founder's
public title, weight budgets, the deployment boundary for docs/, and the
restraint rules that keep the visual system honest.

Every file is read with a missing-file fallback of "" so a missing behavior
fails an assertion, never test discovery.
"""

import html.parser
import json
import pathlib
import re
import struct
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent

MAIN_PAGES = {
    "index.html": ROOT / "index.html",
    "demos/index.html": ROOT / "demos" / "index.html",
    "demos/request-desk/index.html": ROOT / "demos" / "request-desk" / "index.html",
    "demos/business-brain/index.html": ROOT / "demos" / "business-brain" / "index.html",
    "demos/website-manager/index.html": ROOT / "demos" / "website-manager" / "index.html",
}
CARD = ROOT / "justin" / "card.html"
SITE_CSS = ROOT / "assets" / "site.css"
HOME_JS = ROOT / "assets" / "home.js"
OG_IMAGE = ROOT / "og-image.png"
VERCELIGNORE = ROOT / ".vercelignore"

SITE_ORIGIN = "https://www.clearpathwv.com"
BOOKING_URL = "https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call"
PUBLIC_TITLE_HTML = "Founder &amp; Principal Consultant"
PUBLIC_TITLE = "Founder & Principal Consultant"

DEMO_ROUTES = {
    "demos/request-desk/index.html": "/demos/request-desk/",
    "demos/business-brain/index.html": "/demos/business-brain/",
    "demos/website-manager/index.html": "/demos/website-manager/",
}


def read(path):
    """Missing behavior must fail assertions, not module import."""
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8")


def slice_between(raw, start_marker, end_marker):
    start = raw.find(start_marker)
    if start == -1:
        return ""
    end = raw.find(end_marker, start)
    if end == -1:
        return ""
    return raw[start:end]


def text_of(fragment):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", fragment)).strip()


def section_of(raw, section_id):
    marker = f'id="{section_id}"'
    if marker not in raw:
        return ""
    start = raw.index(marker)
    nxt = raw.find("<section", start)
    return raw[start:nxt] if nxt != -1 else raw[start:]


class Collector(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.anchors = []
        self.metas = []
        self.links = []
        self.buttons = []
        self.images = []
        self.ids = []
        self.tag_counts = {}
        self.body_seen = False
        self.first_body_anchor = None
        self._open = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        if tag == "body":
            self.body_seen = True
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "a":
            a["_text"] = []
            self.anchors.append(a)
            if self.body_seen and self.first_body_anchor is None:
                self.first_body_anchor = a
        elif tag == "meta":
            self.metas.append(a)
        elif tag == "link":
            self.links.append(a)
        elif tag == "button":
            self.buttons.append(a)
        elif tag == "img":
            self.images.append(a)
        self._open.append((tag, a))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self._open.pop()

    def handle_endtag(self, tag):
        for i in range(len(self._open) - 1, -1, -1):
            if self._open[i][0] == tag:
                del self._open[i]
                break

    def handle_data(self, data):
        for tag, a in self._open:
            if tag == "a":
                a["_text"].append(data)

    def anchor_text(self, a):
        return re.sub(r"\s+", " ", "".join(a.get("_text", []))).strip()

    def meta(self, key, value):
        for m in self.metas:
            if m.get(key) == value:
                return m.get("content")
        return None


def parse(raw):
    p = Collector()
    p.feed(raw)
    return p


RAW = {name: read(path) for name, path in MAIN_PAGES.items()}
DOM = {name: parse(raw) for name, raw in RAW.items()}
INDEX = RAW["index.html"]
CARD_RAW = read(CARD)
CARD_DOM = parse(CARD_RAW)
CSS = read(SITE_CSS)
COMPACT_CSS = re.sub(r"\s+", "", CSS)
JS = read(HOME_JS)

ALL_PAGES = dict(RAW)
ALL_PAGES["justin/card.html"] = CARD_RAW


class TestSkipLinksAndLandmarks(unittest.TestCase):
    """Every main page opens with a skip link to one main landmark."""

    def test_skip_link_is_the_first_thing_in_the_body(self):
        for name, dom in DOM.items():
            first = dom.first_body_anchor
            self.assertIsNotNone(first, f"{name}: no anchor in body")
            self.assertIn("skip", first.get("class", ""),
                          f"{name}: first anchor is not the skip link")
            self.assertEqual(first.get("href"), "#main",
                             f"{name}: skip link must target #main")

    def test_main_landmark_carries_the_skip_target(self):
        for name, raw in RAW.items():
            self.assertRegex(raw, r'<main[^>]*\bid="main"',
                             f"{name}: <main id=\"main\"> missing")
            self.assertEqual(raw.count("<main"), 1, f"{name}: one main only")

    def test_one_header_one_nav_one_footer_per_page(self):
        for name, raw in RAW.items():
            self.assertEqual(raw.count('<header class="top"'), 1, name)
            self.assertEqual(raw.count('<nav class="nav" aria-label="Main"'), 1,
                             f"{name}: exactly one main navigation landmark")
            self.assertEqual(raw.count("<footer>"), 1, name)

    def test_document_basics(self):
        for name, (raw, dom) in {n: (RAW[n], DOM[n]) for n in RAW}.items():
            self.assertIn('<html lang="en">', raw, name)
            self.assertIn('name="viewport"', raw, name)
            self.assertEqual(dom.tag_counts.get("h1", 0), 1, name)
            self.assertIsNotNone(dom.meta("name", "theme-color"),
                                 f"{name}: theme-color meta missing")


class TestSharedHeader(unittest.TestCase):
    """One header component on every page: text wordmark, desktop links, a
    script-free details menu for phones, and the fit-call button."""

    def header(self, raw):
        return slice_between(raw, '<header class="top"', "</header>")

    def test_wordmark_is_text_in_logo_colors_not_an_image(self):
        for name, raw in RAW.items():
            head = self.header(raw)
            self.assertIn('<span class="brand-clear">Clear</span>', head, name)
            self.assertIn('<span class="brand-path">Path</span>', head, name)
            self.assertNotIn("<img", head, f"{name}: header must not load an image")

    def test_desktop_links_and_phone_menu_both_exist(self):
        for name, raw in RAW.items():
            head = self.header(raw)
            self.assertIn('<ul class="nav-links"', head, f"{name}: nav-links missing")
            menu = slice_between(head, '<details class="menu"', "</details>")
            self.assertTrue(menu, f"{name}: details.menu missing")
            self.assertIn("<summary", menu, f"{name}: menu needs a summary")
            self.assertGreaterEqual(menu.count("<a "), 3,
                                    f"{name}: menu should list the main routes")
            self.assertNotIn(" open", menu[:menu.index(">")],
                             f"{name}: menu must ship closed")

    def test_menu_and_links_reach_demos_pricing_and_email(self):
        for name, raw in RAW.items():
            head = self.header(raw)
            for target in ("/demos/", "pricing", "mailto:JWhalen@ClearPathWV.com"):
                self.assertIn(target, head, f"{name}: header lacks {target}")

    def test_header_keeps_the_fit_call_button_with_short_and_long_labels(self):
        for name, raw in RAW.items():
            head = self.header(raw)
            cta = re.search(r'<a class="btn nav-cta"[^>]*>(.*?)</a>', head, re.S)
            self.assertIsNotNone(cta, f"{name}: header fit-call button missing")
            tag = re.search(r'<a class="btn nav-cta"[^>]*>', head).group(0)
            self.assertIn(BOOKING_URL, tag, f"{name}: header button must book the fit call")
            self.assertIn('class="cta-long"', cta.group(1), name)
            self.assertIn('class="cta-short"', cta.group(1), name)
            self.assertIn("15-minute", cta.group(1), name)
        self.assertIn("data-booking-offer", self.header(INDEX),
                      "homepage header button must carry the booking slug")

    def test_menu_does_not_add_an_eighth_booking_cta(self):
        menu = slice_between(self.header(INDEX), '<details class="menu"', "</details>")
        self.assertNotIn("data-booking-offer", menu,
                         "the phone menu must not duplicate the fit-call CTA")


class TestHomepageLedgerArchitecture(unittest.TestCase):
    """Ten blocks in a fixed order, no duplicated sections."""

    ORDER = ("familiar", "see-it-run", "capabilities", "how", "clarity-session",
             "pricing", "fit", "faq", "about")

    def test_section_order(self):
        positions = []
        for section_id in self.ORDER:
            marker = f'id="{section_id}"'
            self.assertIn(marker, INDEX, f"section missing: {section_id}")
            positions.append(INDEX.index(marker))
        self.assertEqual(positions, sorted(positions), "sections out of order")
        self.assertLess(INDEX.index('<section class="hero"'), positions[0])

    def test_merged_and_retired_blocks_are_gone(self):
        for retired in ('id="control"', 'class="offer-path', 'class="hero-outcomes',
                        'class="artifact-panel', 'class="cap-grid"'):
            self.assertNotIn(retired, INDEX, f"retired block survived: {retired}")

    def test_hero_has_two_actions_and_the_expectation_note(self):
        hero = slice_between(INDEX, '<section class="hero"', 'id="familiar"')
        cta = slice_between(hero, 'class="hero-cta', "</div>")
        self.assertEqual(cta.count("<a "), 2, "hero keeps exactly two actions")
        self.assertIn('href="#see-it-run"', cta)
        self.assertIn(BOOKING_URL, cta)
        self.assertIn("No custom plan or written deliverable", text_of(hero))

    def test_ways_strip_names_both_paid_paths(self):
        hero = slice_between(INDEX, '<section class="hero"', 'id="familiar"')
        ways = slice_between(hero, '<ul class="ways"', "</ul>")
        self.assertTrue(ways, "hero ways strip missing")
        self.assertEqual(ways.count("<li"), 2, "two ways in: clarity and implementation")
        self.assertIn('class="hero-clarity"', ways)
        self.assertIn('href="#pricing"', ways)
        text = text_of(ways)
        for needed in ("$395", "AI Clarity Session", "$1,500 setup", "$500/mo",
                       "written scope"):
            self.assertIn(needed, text, f"ways strip missing {needed!r}")

    def test_how_is_an_ordered_six_step_list_with_free_and_monthly(self):
        how = section_of(INDEX, "how")
        steps = slice_between(how, '<ol class="steps"', "</ol>")
        self.assertTrue(steps, "steps must be an ordered list")
        items = re.findall(r'<li class="step[^"]*"', steps)
        self.assertEqual(len(items), 6, "six steps")
        first = steps[:steps.index("</li>")]
        last = steps[steps.rfind("<li"):]
        self.assertIn('price-chip free">Free<', first)
        self.assertIn('price-chip">Monthly<', last)
        self.assertNotIn('aria-hidden="true">1<', steps,
                         "numbering comes from the list, not decorative spans")

    def test_how_carries_the_who_does_what_ledger_and_privacy(self):
        how = section_of(INDEX, "how")
        text = text_of(how)
        for heading in ("What comes off your plate", "What always waits for you",
                        "What you end up with"):
            self.assertIn(heading, text, f"ledger heading missing: {heading}")
        for waits in ("Prices, quotes, and discounts", "Promises to customers",
                      "Anything touching money or payments",
                      "Judgment calls, every single one"):
            self.assertIn(waits, text, f"waits-for-you item missing: {waits}")
        privacy = text_of(slice_between(how, 'class="privacy', "</p>"))
        self.assertIn("stays in your accounts", privacy)
        self.assertIn("without your approval", privacy)
        lowered = privacy.lower()
        for overpromise in ("encrypt", "never stored", "hipaa", "gdpr", "soc 2",
                            "compliant", "secure by"):
            self.assertNotIn(overpromise, lowered,
                             f"privacy copy promises more than the site can support: {overpromise}")

    def test_pricing_keeps_is_and_is_not_and_the_fit_check_follows(self):
        pricing = section_of(INDEX, "pricing")
        text = text_of(pricing)
        self.assertIn("What the monthly is", text)
        self.assertIn("What the monthly is not", text)
        self.assertIn("Not work that goes out without your approval", text)
        self.assertIn("What happens after checkout", text)
        fit = section_of(INDEX, "fit")
        self.assertIn("A good fit if", text_of(fit))
        self.assertIn("Probably not yet if", text_of(fit))
        self.assertGreater(INDEX.index('id="fit"'), INDEX.index('id="pricing"'))

    def test_capability_rows_use_the_ledger_not_cards(self):
        cap = section_of(INDEX, "capabilities")
        self.assertIn('<ol class="cap-list"', cap)
        self.assertEqual(len(re.findall(r'<li class="cap(?:\s|")', cap)), 4)

    def test_faq_has_at_least_eight_short_answers(self):
        faq = section_of(INDEX, "faq")
        answers = re.findall(r'<div class="faq-a">(.*?)</div>', faq, re.S)
        self.assertGreaterEqual(len(answers), 8)
        for answer in answers:
            self.assertLessEqual(len(text_of(answer)), 420,
                                 "FAQ answers stay short enough to scan on a phone")


class TestFounderStory(unittest.TestCase):
    def test_public_title_on_homepage_card_and_structured_data(self):
        self.assertIn(PUBLIC_TITLE_HTML, INDEX)
        self.assertIn(PUBLIC_TITLE_HTML, CARD_RAW)
        block = re.search(r'<script type="application/ld\+json">(.*?)</script>',
                          INDEX, re.S)
        self.assertIsNotNone(block)
        data = json.loads(block.group(1))
        self.assertEqual(data["founder"]["name"], "Justin Whalen")
        self.assertEqual(data["founder"]["jobTitle"], PUBLIC_TITLE)

    def test_background_is_the_credible_one(self):
        about = section_of(INDEX, "about")
        text = text_of(about)
        self.assertIn("AASI Level III", text)
        self.assertIn("Ellicottville", text)
        self.assertIn("Western New York", text)
        for lead in ("<strong>I'm Justin Whalen.</strong>",
                     "<strong>Built with your team.</strong>",
                     "<strong>Local and reachable.</strong>"):
            self.assertIn(lead, about)

    def test_no_inflated_expertise_anywhere(self):
        for name, raw in ALL_PAGES.items():
            lowered = raw.lower()
            for phrase in ("guarantee", "enterprise-grade", "award-winning",
                           "certified partner", "trusted by", "clients include",
                           "hipaa", "soc 2", "cybersecurity", "our clients",
                           "results may vary", "10x", "roi of"):
                self.assertNotIn(phrase, lowered, f"{name}: {phrase!r}")


def png_size(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    width, height = struct.unpack(">II", data[16:24])
    return width, height


class TestSocialImage(unittest.TestCase):
    """One landscape social image, composed from the real logo, on every page."""

    def test_asset_is_a_real_1200_by_630_png_under_budget(self):
        self.assertTrue(OG_IMAGE.is_file(), "og-image.png missing")
        self.assertEqual(png_size(OG_IMAGE), (1200, 630))
        self.assertLess(OG_IMAGE.stat().st_size, 120_000,
                        "social image must stay under 120 KB")

    def test_every_page_points_social_previews_at_it(self):
        expected = SITE_ORIGIN + "/og-image.png"
        doms = dict(DOM)
        doms["justin/card.html"] = CARD_DOM
        for name, dom in doms.items():
            self.assertEqual(dom.meta("property", "og:image"), expected, name)
            self.assertEqual(dom.meta("name", "twitter:image"), expected, name)
            self.assertEqual(dom.meta("property", "og:image:width"), "1200", name)
            self.assertEqual(dom.meta("property", "og:image:height"), "630", name)
            self.assertEqual(dom.meta("name", "twitter:card"),
                             "summary_large_image", name)
            alt = dom.meta("property", "og:image:alt") or ""
            self.assertIn("ClearPath", alt, f"{name}: social image alt")


class TestWeightBudgets(unittest.TestCase):
    def test_html_css_and_js_budgets(self):
        self.assertLess(len(INDEX.encode("utf-8")), 60_000, "index.html budget")
        self.assertLess(len(CSS.encode("utf-8")), 60_000, "site.css budget")
        total_js = sum(p.stat().st_size for p in (ROOT / "assets").glob("*.js"))
        self.assertLess(total_js, 45_000, "total shipped JavaScript budget")

    def test_no_inline_image_payloads_or_remote_fonts(self):
        for name, raw in ALL_PAGES.items():
            self.assertNotIn("base64", raw, f"{name}: inline base64 payload")
            self.assertNotIn("fonts.googleapis", raw, name)
            self.assertNotIn("fonts.gstatic", raw, name)
            self.assertNotIn("preconnect", raw, name)
        self.assertNotIn("@import", CSS)
        self.assertNotIn("@font-face", CSS)
        self.assertNotIn("url(", CSS, "all icons are inline SVG; no CSS asset requests")

    def test_only_local_scripts_and_no_new_engines(self):
        engines = sorted(p.name for p in (ROOT / "assets").glob("*.js"))
        self.assertEqual(engines, ["business-brain.js", "home.js",
                                   "request-desk.js", "website-manager.js"])


class TestDeploymentBoundary(unittest.TestCase):
    def rules(self):
        return {line.strip() for line in read(VERCELIGNORE).splitlines()
                if line.strip() and not line.strip().startswith("#")}

    def test_docs_tests_and_markdown_never_ship(self):
        rules = self.rules()
        for rule in ("*.md", "tests/", "docs/"):
            self.assertIn(rule, rules, f".vercelignore lacks {rule}")

    def test_docs_folder_holds_only_markdown(self):
        docs = ROOT / "docs"
        self.assertTrue(docs.is_dir())
        for path in docs.rglob("*"):
            if path.is_file():
                self.assertEqual(path.suffix, ".md", f"non-markdown in docs: {path}")

    def test_no_evidence_or_screenshots_inside_the_worktree(self):
        for pattern in ("**/screenshots", "**/.chrome-tmp", "**/*.log"):
            hits = [p for p in ROOT.glob(pattern) if ".git" not in p.parts]
            self.assertEqual(hits, [], f"run evidence leaked into the worktree: {hits}")


class TestTargetsFocusAndSticky(unittest.TestCase):
    """Touch targets, focus rings and header clearance live in the stylesheet."""

    def test_controls_reserve_44px(self):
        for rule in (".cite{", ".menusummary{", ".nav-linksa{", ".reset-btn{",
                     ".choice{", ".faq-itemsummary{", "[role=\"tab\"]{"):
            self.assertIn(rule, COMPACT_CSS, f"rule missing: {rule}")
            block = COMPACT_CSS[COMPACT_CSS.index(rule):]
            block = block[:block.index("}")]
            self.assertIn("min-height:44px", block, f"{rule} lacks a 44px floor")

    def test_inline_prose_links_keep_their_natural_line_box(self):
        """Controller Pa11y run, 2026-09-01: enlarged hit boxes on inline links
        overlapped neighbouring lines of text, so axe could not determine the
        background of the hero proof note (bgOverlap) and reported contrast
        errors. Inline targets in sentences are exempt from WCAG 2.5.8 and
        2.5.5, so prose links must not carry vertical padding."""
        self.assertNotIn("pa,lia{", COMPACT_CSS, "overlapping inline hit-box rule is back")
        for rule in re.finditer(r"([^{}]+)\{([^{}]*)\}", CSS):
            selector, body = rule.group(1).strip(), rule.group(2)
            if "padding-block" in body and re.search(r"(^|[\s,])(p|li)\s+a\b", selector):
                self.fail(f"inline links padded again: {selector!r}")

    def test_focus_visible_and_scroll_margin(self):
        self.assertIn(":focus-visible", CSS)
        self.assertIn("scroll-margin-top", CSS)
        self.assertIn("outline:3pxsolid", COMPACT_CSS)

    def test_no_looping_animation_on_public_pages(self):
        self.assertNotIn("infinite", CSS, "site motion must be finite")
        self.assertNotIn("infinite", CARD_RAW, "card motion must be finite")


class TestHomeScriptEnhancements(unittest.TestCase):
    def test_menu_closes_on_escape_and_after_navigation(self):
        self.assertIn("details.menu", JS)
        self.assertIn("Escape", JS)
        self.assertIn("removeAttribute('open')", JS)

    def test_tabs_accept_vertical_arrows_for_the_stacked_layout(self):
        for token in ("ArrowDown", "ArrowUp"):
            self.assertIn(token, JS)

    def test_still_no_network_storage_or_unsafe_dom(self):
        for banned in ("fetch(", "XMLHttpRequest", "localStorage", "sessionStorage",
                       "innerHTML", "insertAdjacentHTML", "document.cookie"):
            self.assertNotIn(banned, JS)


class TestDemoCrossLinks(unittest.TestCase):
    def test_each_demo_page_links_the_other_two(self):
        for name, own in DEMO_ROUTES.items():
            hrefs = [a.get("href", "") for a in DOM[name].anchors]
            for other_name, other in DEMO_ROUTES.items():
                if other != own:
                    self.assertIn(other, hrefs, f"{name}: no route to {other}")

    def test_hub_entries_are_ruled_rows_with_all_three_routes(self):
        hub = RAW["demos/index.html"]
        self.assertIn('<ol class="desk-list"', hub)
        for route in DEMO_ROUTES.values():
            self.assertIn(f'href="{route}"', hub)


class TestCardAlignment(unittest.TestCase):
    def test_card_states_the_public_title_and_links_the_demos(self):
        self.assertIn(PUBLIC_TITLE_HTML, CARD_RAW)
        hrefs = [a.get("href", "") for a in CARD_DOM.anchors]
        self.assertIn("/demos/", hrefs, "card should offer the demos")

    def test_card_keeps_the_dark_phone_first_shell(self):
        self.assertIn('name="color-scheme" content="dark"', CARD_RAW)
        self.assertIn('class="bar"', CARD_RAW)


def css_hex(token):
    """Value of a :root hex token in the shared stylesheet, e.g. '--ink-soft'."""
    m = re.search(re.escape(token) + r":\s*(#[0-9A-Fa-f]{6})", CSS)
    return m.group(1) if m else None


def card_color(token):
    """Value of a :root token in the card's inline stylesheet (hex or rgba)."""
    m = re.search(re.escape(token) + r":\s*(#[0-9A-Fa-f]{6}|rgba?\([^)]*\))", CARD_RAW)
    return m.group(1) if m else None


def to_rgb(value, over=None):
    """Hex or rgba() to an (r, g, b) tuple, compositing rgba over a hex."""
    value = value.strip()
    if value.startswith("#"):
        return tuple(int(value[i:i + 2], 16) for i in (1, 3, 5))
    parts = [p.strip() for p in value[value.index("(") + 1:value.index(")")].split(",")]
    r, g, b = (float(parts[0]), float(parts[1]), float(parts[2]))
    a = float(parts[3]) if len(parts) > 3 else 1.0
    if a < 1 and over is not None:
        orr, og, ob = to_rgb(over)
        return (r * a + orr * (1 - a), g * a + og * (1 - a), b * a + ob * (1 - a))
    return (r, g, b)


def contrast(fg, bg):
    def lum(rgb):
        def chan(c):
            c = c / 255
            return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
        r, g, b = rgb
        return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)
    hi, lo = sorted((lum(fg), lum(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


class TestControllerAccessibilityRepair(unittest.TestCase):
    """Closure for the controller's Pa11y 9.0.1 receipt of 2026-09-01 (Axe and
    HTML CodeSniffer, WCAG2AA, 390 px route matrix plus desktop homepage):
    15 instances in four categories. Each test pins the repair that closed a
    category so it cannot quietly return."""

    ARIA_NAME_HOSTS = {"a", "button", "summary", "nav", "section", "aside", "main",
                       "form", "img", "svg", "input", "textarea", "select", "table",
                       "iframe", "dialog", "fieldset", "figure", "footer", "header",
                       "ul", "ol"}
    ARIA_NAME_ROLES = {"group", "region", "list", "tablist", "tab", "tabpanel",
                       "separator", "status", "note", "navigation", "img", "button",
                       "dialog", "search", "complementary", "contentinfo", "banner"}

    def test_no_aria_label_on_generic_containers(self):
        """Category 3: aria-label is prohibited on generic div, span and p."""
        tag_re = re.compile(r"<([a-zA-Z][a-zA-Z0-9]*)([^>]*)\baria-label=", re.S)
        for name, raw in ALL_PAGES.items():
            for m in tag_re.finditer(raw):
                tag, attrs = m.group(1).lower(), m.group(2)
                role = re.search(r'\brole="([^"]+)"', attrs)
                allowed = tag in self.ARIA_NAME_HOSTS or (
                    role is not None and role.group(1) in self.ARIA_NAME_ROLES)
                self.assertTrue(allowed, f"{name}: aria-label on generic <{tag}{attrs[:60]}>")

    def test_other_demos_strip_is_a_labeled_paragraph(self):
        for name in DEMO_ROUTES:
            raw = RAW[name]
            self.assertIn('<p class="other-demos">', raw, name)
            self.assertNotIn('class="other-demos" aria-label', raw, name)
            strip = slice_between(raw, '<p class="other-demos">', "</p>")
            self.assertIn("Try another demo", text_of(strip), name)
            self.assertEqual(strip.count("<a "), 2, name)

    def test_card_actions_container_is_a_named_group(self):
        self.assertIn('<div class="actions" id="actions" role="group" aria-label="Primary actions">',
                      CARD_RAW)

    def test_stage_connector_is_a_border_not_a_filled_pseudo_element(self):
        """Category 2: axe treats an absolutely positioned pseudo-element with
        a fill as content that may sit under text (pseudoContent). The stage
        connector line is drawn with a border on a zero-width pseudo instead,
        so the stage titles keep their state colors and the line still shows."""
        block = COMPACT_CSS[COMPACT_CSS.index(".stage-list::before{"):]
        block = block[:block.index("}")]
        self.assertIn("width:0", block)
        self.assertIn("border-left:2pxsolidvar(--line)", block)
        self.assertIn("background:transparent", block)
        self.assertNotIn("background:var(--line)", block)
        title = COMPACT_CSS[COMPACT_CSS.index(".stage-title{"):]
        title = title[:title.index("}")]
        self.assertIn("color:var(--ink-soft)", title, "inactive titles stay readable ink")
        self.assertIn(".stage.is-done.stage-title{color:var(--teal-text)}", COMPACT_CSS)
        self.assertIn(".stage.is-active.stage-title{color:var(--clay-ink)}", COMPACT_CSS)

    def test_proof_note_and_stage_title_colors_meet_aa_on_their_surfaces(self):
        """Categories 1 and 2: the text colors themselves, computed from the
        tokens, on the white card and on paper."""
        card, paper = css_hex("--card"), css_hex("--paper")
        self.assertIsNotNone(card)
        self.assertIsNotNone(paper)
        for token in ("--ink-soft", "--teal-text", "--clay-ink"):
            color = css_hex(token)
            self.assertIsNotNone(color, token)
            for surface in (card, paper):
                self.assertGreaterEqual(contrast(to_rgb(color), to_rgb(surface)), 4.5,
                                        f"{token} on {surface}")
        note = COMPACT_CSS[COMPACT_CSS.index(".proof-note{"):]
        note = note[:note.index("}")]
        self.assertIn("color:var(--ink-soft)", note)
        ticket = COMPACT_CSS[COMPACT_CSS.index(".ticket{"):]
        ticket = ticket[:ticket.index("}")]
        self.assertIn("background:var(--card)", ticket)

    def test_card_textarea_scroll_box_matches_its_painted_box(self):
        """Category 4: a textarea scrolls (overflow auto), so axe compares its
        text box with scrollHeight, which excludes borders; a bordered textarea
        therefore never fully contains its own text and reads as partially
        obscured. The boundary is an inset ring instead."""
        bodies = [re.sub(r"\s+", "", m.group(1)) for m in
                  re.finditer(r"\.field textarea \{([^}]*)\}", CARD_RAW, re.S)]
        own = [b for b in bodies if "min-height:96px" in b]
        self.assertEqual(len(own), 1, "standalone textarea rule missing")
        body = own[0]
        self.assertIn("border:0", body)
        self.assertIn("box-shadow:inset0001pxvar(--field-line)", body)
        focus_bodies = [re.sub(r"\s+", "", m.group(1)) for m in
                        re.finditer(r"\.field textarea:focus-visible \{([^}]*)\}", CARD_RAW, re.S)]
        self.assertTrue(any("inset0001pxvar(--focus)" in b for b in focus_bodies),
                        "textarea focus state must redraw the inset ring in the focus color")

    def test_card_field_text_and_boundary_contrast(self):
        bg, field, text, faint = (card_color("--bg"), card_color("--bg-soft"),
                                  card_color("--text"), card_color("--text-faint"))
        line = card_color("--field-line")
        for value in (bg, field, text, faint, line):
            self.assertIsNotNone(value, "card token missing")
        self.assertGreaterEqual(contrast(to_rgb(text), to_rgb(field)), 4.5, "entered text")
        self.assertGreaterEqual(contrast(to_rgb(faint), to_rgb(field)), 4.5, "placeholder text")
        ring_on_field = to_rgb(line, over=field)
        self.assertGreaterEqual(contrast(ring_on_field, to_rgb(bg)), 3.0, "boundary vs page")
        self.assertGreaterEqual(contrast(ring_on_field, to_rgb(field)), 3.0, "boundary vs field")
        self.assertIn("border: 1px solid var(--field-line)", CARD_RAW,
                      "inputs share the same boundary token")


if __name__ == "__main__":
    unittest.main()
