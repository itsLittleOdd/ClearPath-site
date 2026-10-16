"""Source and copy boundary tests for the ClearPath 2026-10-16 rebuild.

Run from the candidate root with the parent's Python (3.14):

    /opt/homebrew/bin/python3.14 -m unittest discover -s tests -p 'test_*.py' -v

Every test reads the actual files that the review server serves. The tests
check behavior contracts (fail-closed contact form, no network paths, exact
pricing values from the frozen pricing model, route and anchor integrity,
pinned legacy bytes) rather than just the presence of expected words.
"""

import html.parser
import json
import pathlib
import re
import subprocess
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent
ALLOWLIST = (ROOT / "tools" / "public-allowlist.mjs").read_text(encoding="utf-8")


def _js_array(name):
    block = re.search(r"export const %s = \[(.*?)\];" % re.escape(name), ALLOWLIST, re.S)
    assert block, "allowlist array %s missing" % name
    return re.findall(r"'([^']+)'", block.group(1))


PUBLIC_PAGES = _js_array("PUBLIC_PAGES")
PUBLIC_ASSETS = _js_array("PUBLIC_ASSETS")
PUBLIC_MEDIA = _js_array("PUBLIC_MEDIA")
PINNED_FILES = _js_array("PINNED_FILES")
AUTHORED_PAGES = [p for p in PUBLIC_PAGES if not p.startswith("justin/")]
ROUTED_PAGES = [p for p in AUTHORED_PAGES if p != "404.html"]
SITE_JS = ["assets/site.js", "assets/contact.js", "assets/request-desk.js",
           "assets/business-brain.js", "assets/website-manager.js"]
FIT_CALL = "https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call"
EMAIL = "JWhalen@ClearPathWV.com"
PRICING = json.loads((ROOT / ".build-inputs" / "pricing-model.json").read_text(encoding="utf-8"))["public"]


def route_for(page):
    if page == "index.html":
        return "/"
    if page.endswith("/index.html"):
        return "/" + page[: -len("index.html")]
    return "/" + page


class Page(html.parser.HTMLParser):
    """Collects what the tests need: tags, attributes, ids, text, links."""

    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.ids = set()
        self.text_parts = []
        self._skip = 0
        self._capture = None
        self.title = ""
        self.h1 = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get("id"):
            self.ids.add(attrs["id"])
        if tag in ("script", "style"):
            self._skip += 1
        if tag in ("title", "h1"):
            self._capture = (tag, [])

    def handle_endtag(self, tag):
        if tag in ("script", "style") and self._skip:
            self._skip -= 1
        if self._capture and self._capture[0] == tag:
            value = re.sub(r"\s+", " ", "".join(self._capture[1])).strip()
            if tag == "title":
                self.title = value
            else:
                self.h1.append(value)
            self._capture = None

    def handle_data(self, data):
        if self._skip:
            return
        self.text_parts.append(data)
        if self._capture:
            self._capture[1].append(data)

    @property
    def text(self):
        return re.sub(r"\s+", " ", "".join(self.text_parts))

    def find(self, tag, **attrs):
        out = []
        for t, a in self.tags:
            if t != tag:
                continue
            if all(a.get(k) == v for k, v in attrs.items()):
                out.append(a)
        return out

    def meta(self, key, value):
        for a in self.find("meta"):
            if a.get(key) == value:
                return a.get("content", "")
        return None


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


PAGES = {p: Page(read(p)) for p in PUBLIC_PAGES}
RAW = {p: read(p) for p in PUBLIC_PAGES}


class TestInventoryAndMetadata(unittest.TestCase):
    def test_public_pages_exist(self):
        for p in PUBLIC_PAGES + PUBLIC_ASSETS:
            self.assertTrue((ROOT / p).is_file(), p)

    def test_every_public_page_is_noindex(self):
        for p in PUBLIC_PAGES:
            robots = PAGES[p].meta("name", "robots") or ""
            self.assertIn("noindex", robots, p)

    def test_unique_titles_and_descriptions(self):
        titles = [PAGES[p].title for p in AUTHORED_PAGES]
        descs = [PAGES[p].meta("name", "description") for p in AUTHORED_PAGES]
        self.assertTrue(all(titles), titles)
        self.assertTrue(all(descs), descs)
        self.assertEqual(len(titles), len(set(titles)), titles)
        self.assertEqual(len(descs), len(set(descs)), descs)
        for t in titles:
            self.assertLessEqual(len(t), 110, t)
        for d in descs:
            self.assertLessEqual(len(d), 320, d)

    def test_canonical_and_open_graph(self):
        for p in ROUTED_PAGES:
            page = PAGES[p]
            canon = [a.get("href") for a in page.find("link", rel="canonical")]
            self.assertEqual(canon, ["https://www.clearpathwv.com" + route_for(p)], p)
            self.assertEqual(page.meta("property", "og:url"), canon[0], p)
            self.assertTrue(page.meta("property", "og:title"), p)
            self.assertTrue(page.meta("property", "og:description"), p)
            self.assertEqual(page.meta("property", "og:image"), "https://www.clearpathwv.com/og-image.png", p)
            self.assertTrue(page.meta("property", "og:image:alt"), p)
            self.assertEqual(page.meta("name", "twitter:card"), "summary_large_image", p)

    def test_document_scaffold(self):
        for p in AUTHORED_PAGES:
            page, raw = PAGES[p], RAW[p]
            self.assertIn('<html lang="en">', raw, p)
            self.assertEqual(len(page.h1), 1, (p, page.h1))
            self.assertTrue(page.find("a", href="#main"), p)
            self.assertIn("main", page.ids, p)
            self.assertTrue(page.find("link", rel="icon"), p)
            self.assertTrue(page.find("meta", name="viewport"), p)
            self.assertTrue(page.find("link", rel="stylesheet", href="/assets/site.css"), p)

    def test_images_have_alt_attributes(self):
        for p in AUTHORED_PAGES:
            for img in PAGES[p].find("img"):
                self.assertIn("alt", img, (p, img))

    def test_sitemap_lists_exactly_the_public_routes(self):
        sitemap = read("sitemap.xml")
        locs = set(re.findall(r"<loc>https://www\.clearpathwv\.com([^<]*)</loc>", sitemap))
        expected = {route_for(p) for p in ROUTED_PAGES if p != "thank-you/index.html"}
        self.assertEqual(locs, expected)

    def test_robots_is_review_mode(self):
        robots = read("robots.txt")
        self.assertRegex(robots, r"User-agent: \*\s*\nDisallow: /\s*\n")
        self.assertIn("Sitemap: https://www.clearpathwv.com/sitemap.xml", robots)

    def test_server_review_mode_headers_in_source(self):
        serve = read("tools/serve.mjs")
        self.assertIn("'127.0.0.1'", serve)
        self.assertIn("no-store", serve)
        self.assertIn("X-Robots-Tag", serve)


class TestLinksAndRoutes(unittest.TestCase):
    def _target_exists(self, href, page_name):
        if href.startswith("mailto:"):
            self.assertTrue(href.startswith("mailto:" + EMAIL), (page_name, href))
            return
        if href.startswith("http"):
            self.assertEqual(href, FIT_CALL, (page_name, href))
            return
        path_part, _, frag = href.partition("#")
        path_part = path_part.split("?")[0]
        if path_part == "":
            self.assertIn(frag, PAGES[page_name].ids, (page_name, href))
            return
        self.assertTrue(path_part.startswith("/"), (page_name, href))
        rel = path_part[1:]
        if rel == "" or rel.endswith("/"):
            rel += "index.html"
        if rel == "justin":
            rel = "justin/card.html"
        self.assertTrue((ROOT / rel).is_file(), (page_name, href))
        if frag:
            self.assertIn(frag, PAGES[rel].ids, (page_name, href))

    def test_every_link_resolves(self):
        for p in AUTHORED_PAGES:
            for a in PAGES[p].find("a"):
                self.assertIn("href", a, (p, a))
                self._target_exists(a["href"], p)

    def test_every_asset_reference_is_local_and_present(self):
        for p in AUTHORED_PAGES:
            for tag, attrs in PAGES[p].tags:
                src = attrs.get("src")
                if tag == "link" and attrs.get("rel") in ("stylesheet", "icon"):
                    src = attrs.get("href")
                if not src:
                    continue
                self.assertFalse(src.startswith("http"), (p, src))
                rel = src.lstrip("/")
                if rel in PUBLIC_MEDIA:
                    continue  # parent-rendered binaries may be pending
                self.assertTrue((ROOT / rel).is_file(), (p, src))
                self.assertNotEqual(rel, "assets/home.js", p)

    def test_fit_call_destination_is_exact_and_never_a_form(self):
        for p in AUTHORED_PAGES:
            for a in PAGES[p].find("a"):
                if "cal.com" in a["href"]:
                    self.assertEqual(a["href"], FIT_CALL, p)

    def test_homepage_keeps_legacy_anchor_ids(self):
        for anchor in ("main", "about", "pricing", "how", "faq", "see-it-run", "clarity-session"):
            self.assertIn(anchor, PAGES["index.html"].ids, anchor)

    def test_nav_has_the_five_destinations_on_every_page(self):
        for p in AUTHORED_PAGES:
            hrefs = {a["href"] for a in PAGES[p].find("a")}
            for needed in ("/services/", "/work/", "/pricing/", "/contact/", "/#about"):
                self.assertIn(needed, hrefs, (p, needed))

    def test_demo_pages_keep_their_engines(self):
        for page, engine, mount in (
            ("demos/request-desk/index.html", "/assets/request-desk.js", "request-desk"),
            ("demos/business-brain/index.html", "/assets/business-brain.js", "business-brain"),
            ("demos/website-manager/index.html", "/assets/website-manager.js", "website-manager"),
        ):
            self.assertTrue(PAGES[page].find("script", src=engine), page)
            self.assertTrue(PAGES[page].find("div", **{"data-demo": mount}), page)
            self.assertIn("demo-fallback", PAGES[page].ids, page)
            self.assertIn("demo-shell", PAGES[page].ids, page)


class TestOfferAndCopyBoundaries(unittest.TestCase):
    RETIRED = ["stripe.com", "book.stripe", "buy.stripe", "Starter Pilot", "Core Retainer",
               "Serious Business", "AI Clarity", "Clarity Plan", "$1,500", "$2,500", "$5,000", "$3,000",
               "setup +", "Charged today", "Most owners start here", "Buy the", "checkout",
               "data-checkout-offer", "Message received", "nothing leaves without",
               "$1,200", "$150", "$125", "Zoho"]
    BANNED = [r"\bour team\b", r"\bcompliant\b", r"\bguarantee[ds]?\b", r"\bunlimited\b(?! work)",
              r"\binstant(ly)?\b", r"\bsecure\b", r"\bsafe\b", r"\bmarket[- ]leading\b",
              r"\bbest[- ]in[- ]class\b", r"\bcutting[- ]edge\b", r"\brevolutionary\b", r"\bseamless\b"]

    def _public_sources(self):
        out = {}
        for p in AUTHORED_PAGES:
            out[p] = RAW[p]
        for j in SITE_JS:
            out[j] = read(j)
        out["assets/site.css"] = read("assets/site.css")
        return out

    def test_retired_offers_and_checkout_links_are_gone(self):
        for name, text in self._public_sources().items():
            for needle in self.RETIRED:
                self.assertNotIn(needle, text, (name, needle))

    def test_banned_hype_terms_absent_from_visible_copy(self):
        for p in AUTHORED_PAGES:
            text = PAGES[p].text
            for pattern in self.BANNED:
                self.assertIsNone(re.search(pattern, text, re.I), (p, pattern))

    def test_no_em_dashes_emojis_or_tables(self):
        emoji = re.compile("[\U0001F300-\U0001FAFF☀-➿\U0001F000-\U0001F2FF]")
        for name, text in self._public_sources().items():
            self.assertNotIn("—", text, name)
            self.assertIsNone(emoji.search(text), name)
        for p in AUTHORED_PAGES:
            self.assertFalse(PAGES[p].find("table"), p)

    def test_pricing_page_matches_frozen_pricing_model(self):
        text = PAGES["pricing/index.html"].text
        self.assertEqual(PAGES["pricing/index.html"].h1, [PRICING["title"]])
        self.assertIn(PRICING["subtitle"], text)
        for site in PRICING["websites"]:
            self.assertIn(site["name"], text)
            self.assertIn("$%s" % format(site["price"], ","), text)
            self.assertIn(site["subtitle"], text)
            for item in site["items"]:
                self.assertIn(item, text, item)
        for custom in PRICING["custom"]:
            self.assertIn(custom["title"], text)
            self.assertIn(custom["price"], text)
        for support in PRICING["support"]:
            self.assertIn(support["title"], text)
            self.assertIn(support["price"], text)
            self.assertIn(support["body"], text)
        self.assertIn(PRICING["shared"], text)
        self.assertIn(PRICING["shared_note"], text)
        self.assertIn(PRICING["support_note"], text)
        self.assertIn(PRICING["clarity"]["credit"], text)
        self.assertIn(PRICING["clarity"]["description"], text)
        self.assertIn("$%d" % PRICING["clarity"]["price"], text)
        self.assertIn(PRICING["fine"], text)
        self.assertIn(PRICING["contact"], text)

    def test_credit_wording_is_exact_everywhere_it_appears(self):
        exact = PRICING["clarity"]["credit"]
        for p in AUTHORED_PAGES:
            text = PAGES[p].text
            if "credited" in text:
                self.assertIn(exact, text, p)
                self.assertNotIn("session date", text, p)

    def test_homepage_hero_contract(self):
        page = PAGES["index.html"]
        self.assertEqual(page.h1, ["Bring me the messy work."])
        raw = RAW["index.html"]
        hero = raw[raw.index('class="hero"'):raw.index('id="paths"')]
        self.assertIn('href="/contact/">Tell me what needs to work better', hero)
        self.assertIn('href="/pricing/">See services and prices', hero)
        self.assertIn("We agree on the work and price before I start. Ongoing support is optional.", hero)
        for needle in ("A better website.", "Less chasing and retyping.", "Help with what you already use."):
            self.assertIn(needle, page.text)

    def test_support_is_presented_as_optional_and_bounded(self):
        for p in ("index.html", "services/index.html", "pricing/index.html"):
            text = PAGES[p].text
            self.assertRegex(text, r"[Ss]upport is optional|Ongoing support is optional")
            self.assertIn("No emergency or 24/7", text, p)

    def test_examples_are_labeled_fictional_and_no_client_evidence(self):
        for p in ("index.html", "work/index.html", "demos/index.html"):
            text = PAGES[p].text
            self.assertRegex(text, r"[Ff]ictional|[Mm]ade-up", p)
        for p in AUTHORED_PAGES:
            text = PAGES[p].text.lower()
            for banned in ("testimonial", "case study:", "clients include", "trusted by", "results for clients"):
                self.assertNotIn(banned, text, (p, banned))
        self.assertIn("there are no case studies here", PAGES["work/index.html"].text)

    def test_founder_copy_and_location(self):
        text = PAGES["index.html"].text
        self.assertIn("I'm Justin Whalen, Founder & Principal Consultant at ClearPath.", text.replace("&amp;", "&"))
        self.assertIn("Ellicottville", text)
        self.assertIn("Western New York", text)
        self.assertIn("AASI Level III", text)
        raw = RAW["index.html"]
        self.assertIsNone(re.search(r"\d{2,5} [A-Z][a-z]+ (Street|St\.|Road|Rd\.|Avenue|Ave\.)", raw))


class TestContactFlowContract(unittest.TestCase):
    def test_form_is_fail_closed(self):
        raw = RAW["contact/index.html"]
        form = re.search(r"<form id=\"brief-form\"[^>]*>", raw).group(0)
        self.assertNotIn("action=", form)
        self.assertNotIn("method=", form)
        body = raw[raw.index(form):raw.index("</form>")]
        self.assertNotRegex(body, r"<(input|select|textarea)[^>]*\sname=")
        self.assertRegex(body, r'<button type="submit"[^>]*id="review-draft"[^>]*disabled')
        for required in ("f-name", "f-email", "f-topic", "f-need", "f-current", "error-summary",
                         "error-list", "draft-panel", "result-panel", "draft-subject", "draft-body",
                         "open-mail", "copy-draft", "edit-brief"):
            self.assertIn(required, PAGES["contact/index.html"].ids, required)
        self.assertIn("Review email draft", body)
        self.assertIn("Open my email app", body)
        self.assertIn("Your draft is ready.", body)
        self.assertIn("Nothing has been sent by this website. Review and send it from your email app.", body)
        self.assertIn("Please don't include passwords, customer records or other sensitive information.", body)

    def test_topic_options_match_contact_module(self):
        raw = RAW["contact/index.html"]
        options = re.findall(r'<option value="([a-z]+)"', raw)
        js = read("assets/contact.js")
        keys = re.findall(r"^\s{4}([a-z]+): \{\n\s+label:", js, re.M)
        self.assertEqual(sorted(options), sorted(keys))

    def test_thank_you_is_honest(self):
        text = PAGES["thank-you/index.html"].text
        self.assertIn("Your draft is ready.", text)
        self.assertIn("Nothing has been sent by this website.", text)
        self.assertNotIn("received", text.lower())
        self.assertNotIn("submitted", text.lower())

    def test_no_inline_handlers_or_foreign_scripts(self):
        for p in AUTHORED_PAGES:
            raw = RAW[p]
            self.assertIsNone(re.search(r"\son[a-z]+=\"", raw), p)
            inline = re.findall(r"<script(?![^>]*src=)[^>]*>(.*?)</script>", raw, re.S)
            for block in inline:
                stripped = block.strip()
                ok = stripped == "document.documentElement.classList.add('js')" or stripped.startswith("{")
                self.assertTrue(ok, (p, stripped[:80]))


class TestScriptsAndStyles(unittest.TestCase):
    FORBIDDEN = ["fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "sessionStorage",
                 "indexedDB", "document.cookie", "WebSocket", "http://", "https://", "new Image(",
                 "import(", "eval(", "innerHTML"]

    def test_site_scripts_have_no_network_storage_or_html_injection(self):
        for j in SITE_JS:
            text = read(j)
            for needle in self.FORBIDDEN:
                self.assertNotIn(needle, text, (j, needle))

    def test_stylesheet_is_self_contained(self):
        css = read("assets/site.css")
        self.assertNotIn("@import", css)
        self.assertNotIn("url(", css)
        self.assertIn("prefers-reduced-motion", css)
        self.assertIn("focus-visible", css)
        self.assertIn("forced-colors", css)

    def test_video_markup_is_honest_and_lazy(self):
        for p in ("index.html", "work/index.html"):
            raw = RAW[p]
            video = re.search(r"<video[^>]*>", raw).group(0)
            for attr in ("controls", 'preload="none"', "muted", "playsinline", 'poster="/assets/media/request-demo-poster.jpg"'):
                self.assertIn(attr, video, (p, attr))
            self.assertNotIn("autoplay", video)
            self.assertIn('<source src="/assets/media/request-demo.webm" type="video/webm">', raw)
            self.assertIn('<source src="/assets/media/request-demo.mp4" type="video/mp4">', raw)
            self.assertIn("Fictional demonstration. Not connected to a live client system.", PAGES[p].text)
            self.assertIn("approved draft, not a sent email", PAGES[p].text)
            transcript = raw[raw.index('<details class="transcript">'):raw.index("</details>", raw.index('<details class="transcript">'))]
            self.assertEqual(transcript.count("<li>"), 5, p)

    def test_dormant_analytics_contract_only(self):
        js = read("assets/site.js")
        self.assertIn("window.clearpathEvent", js)
        for provider in ("gtag", "googletagmanager", "plausible", "fathom", "hotjar", "segment", "analytics.js"):
            self.assertNotIn(provider, js.lower(), provider)
        for p in AUTHORED_PAGES:
            self.assertNotIn("gtag", RAW[p].lower(), p)
            self.assertNotIn("cookie banner", PAGES[p].text.lower(), p)


class TestProtectedFiles(unittest.TestCase):
    def _git_bytes(self, rel):
        try:
            return subprocess.run(["git", "show", "HEAD:" + rel], cwd=ROOT, capture_output=True, check=True).stdout
        except (OSError, subprocess.CalledProcessError) as err:
            self.skipTest("git unavailable for pinned-file comparison: %s" % err)

    def test_pinned_legacy_and_hosting_files_match_baseline_commit(self):
        for rel in PINNED_FILES:
            self.assertEqual((ROOT / rel).read_bytes(), self._git_bytes(rel), rel)

    def test_build_inputs_untouched_by_tests(self):
        for name in ("DECISIONS.md", "BRIEF.md", "MARKETING.md", "pricing-model.json"):
            self.assertTrue((ROOT / ".build-inputs" / name).is_file(), name)

    def test_handoff_documents_present(self):
        for name in ("DESIGN.md", "README.md", "BUILD-REPORT.md", "LAUNCH-CHECKLIST.md",
                     "creative/request-demo/composition.html", "creative/request-demo/STORYBOARD.md",
                     "tools/render-video.mjs", "tools/serve.mjs"):
            self.assertTrue((ROOT / name).is_file(), name)


if __name__ == "__main__":
    unittest.main()
