"""Guardrails for the interactive demo build: hub, three demos, homepage
integration, and the honesty/safety boundaries they must never cross.

Standard library only. Run from the repo root:
    python3 -m unittest discover -s tests -v

test_storefront.py owns homepage offer/pricing/CTA wiring and
test_repair_regressions.py owns the contact-card and metadata repairs. This
module owns everything the demo lane added: the /demos/ routes, the
browser-local demo engines, synthetic-data honesty labels, the no-network and
safe-DOM boundaries, and the homepage demo entry points.

Every file is read with a missing-file fallback of "" so a missing route
fails an assertion (the behavior is missing), never test discovery.
"""

import html.parser
import pathlib
import re
import unittest

ROOT = pathlib.Path(__file__).resolve().parent.parent

INDEX = ROOT / "index.html"
CARD = ROOT / "justin" / "card.html"
HUB = ROOT / "demos" / "index.html"
RD = ROOT / "demos" / "request-desk" / "index.html"
BB = ROOT / "demos" / "business-brain" / "index.html"
WM = ROOT / "demos" / "website-manager" / "index.html"

SITE_CSS = ROOT / "assets" / "site.css"
HOME_JS = ROOT / "assets" / "home.js"
RD_JS = ROOT / "assets" / "request-desk.js"
BB_JS = ROOT / "assets" / "business-brain.js"
WM_JS = ROOT / "assets" / "website-manager.js"

BOOKING_URL = "https://cal.com/justin-whalen-xpjqtn/free-15-minute-fit-call"
SITE_ORIGIN = "https://www.clearpathwv.com"

DEMO_ROUTES = {
    "request-desk": "/demos/request-desk/",
    "business-brain": "/demos/business-brain/",
    "website-manager": "/demos/website-manager/",
}


def read(path):
    """Missing behavior must fail assertions, not module import."""
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8")


class Collector(html.parser.HTMLParser):
    """Collects ids, anchors, buttons, roles, headings and comments."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.anchors = []
        self.buttons = []
        self.forms = []
        self.links = []
        self.metas = []
        self.images = []
        self.scripts = []
        self.tag_counts = {}
        self.roles = []
        self.comments = []
        self.title_parts = []
        self.h1_parts = []
        self._open = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        if "id" in a:
            self.ids.append(a["id"])
        if "role" in a:
            self.roles.append((tag, a))
        if tag == "a":
            a["_text"] = []
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
        elif tag == "script":
            self.scripts.append(a)
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
            elif tag == "title":
                self.title_parts.append(data)
            elif tag == "h1":
                self.h1_parts.append(data)

    def handle_comment(self, data):
        self.comments.append(data)

    @property
    def title(self):
        return re.sub(r"\s+", " ", "".join(self.title_parts)).strip()

    def anchor_text(self, a):
        return re.sub(r"\s+", " ", "".join(a.get("_text", []))).strip()

    def hrefs(self):
        return [a.get("href", "") for a in self.anchors]


def parse(raw):
    p = Collector()
    p.feed(raw)
    return p


def canonical_of(dom):
    canon = [l for l in dom.links if l.get("rel") == "canonical"]
    return canon[0]["href"] if len(canon) == 1 else None


HUB_RAW = read(HUB)
HUB_DOM = parse(HUB_RAW)


class TestDemoHubRoute(unittest.TestCase):
    """/demos/ must exist as an honest hub with routes in and out."""

    def test_hub_route_exists(self):
        self.assertTrue(HUB.is_file(), "demos/index.html does not exist")

    def test_hub_is_labeled_synthetic_and_send_free(self):
        for phrase in ("sample data", "fictional", "Nothing is sent"):
            self.assertIn(phrase, HUB_RAW,
                          f"hub is missing the honesty phrase: {phrase!r}")
        self.assertNotIn("live client", HUB_RAW.replace(
            "not a live client system", ""),
            "hub may only mention live client systems to deny being one")

    def test_hub_links_every_full_demo(self):
        hrefs = HUB_DOM.hrefs()
        for slug, route in DEMO_ROUTES.items():
            self.assertIn(route, hrefs, f"hub does not link {slug} at {route}")

    def test_hub_routes_back_to_home_fit_call_and_paid_start(self):
        hrefs = HUB_DOM.hrefs()
        self.assertIn("/", hrefs, "hub has no route back to the homepage")
        self.assertIn(BOOKING_URL, hrefs, "hub has no free fit call route")
        self.assertIn("/#pricing", hrefs,
                      "hub has no route to the paid starting points")

    def test_hub_has_one_h1_a_title_and_a_canonical(self):
        self.assertEqual(HUB_DOM.tag_counts.get("h1", 0), 1,
                         "hub needs exactly one h1")
        self.assertIn("ClearPath", HUB_DOM.title, "hub title missing brand")
        self.assertIn("demo", HUB_DOM.title.lower(),
                      "hub title should say it is the demos page")
        self.assertEqual(canonical_of(HUB_DOM), SITE_ORIGIN + "/demos/",
                         "hub canonical URL wrong or missing")


CSS_RAW = read(SITE_CSS)


class TestSharedStylesheet(unittest.TestCase):
    """One shared design-system stylesheet serves every public page."""

    def test_stylesheet_exists(self):
        self.assertTrue(SITE_CSS.is_file(), "assets/site.css does not exist")

    def test_hub_loads_the_shared_stylesheet(self):
        sheets = [l for l in HUB_DOM.links if l.get("rel") == "stylesheet"]
        self.assertEqual([l.get("href") for l in sheets], ["/assets/site.css"],
                         "hub must load exactly the shared local stylesheet")

    def test_brand_tokens_survive_the_extraction(self):
        for token in ("--paper:", "--pine:", "--clay:", "--ink:", "--serif:",
                      "--mono:"):
            self.assertIn(token, CSS_RAW, f"brand token missing: {token}")

    def test_focus_visible_styles_present(self):
        self.assertIn(":focus-visible", CSS_RAW)

    def test_reduced_motion_supported(self):
        marker = "@media (prefers-reduced-motion: reduce)"
        self.assertIn(marker, CSS_RAW, "prefers-reduced-motion query missing")
        block = CSS_RAW[CSS_RAW.index(marker):CSS_RAW.index(marker) + 700]
        self.assertIn("animation:none", block)

    def test_interactive_controls_reserve_touch_target_height(self):
        self.assertIn("min-height:44px", CSS_RAW,
                      "44px touch-target floor missing from control styles")

    def test_no_imports_or_external_urls_in_css(self):
        self.assertNotIn("@import", CSS_RAW)
        self.assertNotIn("http://", CSS_RAW)
        self.assertNotIn("https://", CSS_RAW)


RD_RAW = read(RD)
RD_DOM = parse(RD_RAW)


def data_values(raw, attr):
    """Ordered attribute values, e.g. data_values(raw, 'data-stage')."""
    return re.findall(attr + r'="([^"]+)"', raw)


RD_STAGES = ["request", "facts", "missing", "action", "draft", "approval",
             "record"]


class TestRequestDeskPage(unittest.TestCase):
    """/demos/request-desk/ shows the full visible pipeline of the brief."""

    def test_route_exists(self):
        self.assertTrue(RD.is_file(),
                        "demos/request-desk/index.html does not exist")

    def test_one_h1_title_canonical_and_shared_css(self):
        self.assertEqual(RD_DOM.tag_counts.get("h1", 0), 1)
        self.assertIn("ClearPath", RD_DOM.title)
        self.assertEqual(canonical_of(RD_DOM),
                         SITE_ORIGIN + "/demos/request-desk/")
        sheets = [l.get("href") for l in RD_DOM.links
                  if l.get("rel") == "stylesheet"]
        self.assertEqual(sheets, ["/assets/site.css"])

    def test_page_loads_only_its_own_deferred_engine(self):
        srcs = [s.get("src") for s in RD_DOM.scripts if s.get("src")]
        self.assertEqual(srcs, ["/assets/request-desk.js"],
                         "page must load exactly its local engine")
        script = next(s for s in RD_DOM.scripts if s.get("src"))
        self.assertIn("defer", script, "engine script must be deferred")

    def test_honesty_label_present(self):
        for phrase in ("sample data", "fictional", "Nothing is sent"):
            self.assertIn(phrase, RD_RAW, f"missing honesty phrase {phrase!r}")

    def test_fallback_visible_and_shell_hidden_in_source(self):
        self.assertIn('id="demo-fallback"', RD_RAW)
        fallback_tag = re.search(r"<div[^>]*id=\"demo-fallback\"[^>]*>",
                                 RD_RAW).group(0)
        self.assertNotIn("hidden", fallback_tag,
                         "no-JS fallback must ship visible")
        shell_tag = re.search(r"<div[^>]*id=\"demo-shell\"[^>]*>", RD_RAW)
        self.assertIsNotNone(shell_tag, "demo shell missing")
        self.assertIn("hidden", shell_tag.group(0),
                      "shell must ship hidden until the engine wires it")

    def test_fallback_explains_and_links_out(self):
        self.assertIn('id="demo-fallback"', RD_RAW, "fallback block missing")
        self.assertIn('id="demo-shell"', RD_RAW, "shell block missing")
        fallback = RD_RAW[RD_RAW.index('id="demo-fallback"'):
                          RD_RAW.index('id="demo-shell"')]
        self.assertIn("JavaScript", fallback,
                      "fallback should say why the demo is not running")
        self.assertIn(BOOKING_URL, fallback,
                      "fallback must still offer the fit call")

    def test_mount_declares_the_request_desk_demo(self):
        self.assertIn('data-demo="request-desk"', RD_RAW)

    def test_three_sample_requests_cover_three_channels(self):
        samples = data_values(RD_RAW, "data-sample")
        self.assertEqual(sorted(set(samples)),
                         ["catering-email", "phone-note", "web-form"],
                         "expected email, phone-note and web-form samples")
        for name in set(samples):
            button = re.search(
                r"<button[^>]*data-sample=\"%s\"[^>]*>" % name, RD_RAW)
            self.assertIsNotNone(button, f"sample {name} must be a button")
            self.assertIn("aria-pressed", button.group(0),
                          f"sample {name} needs aria-pressed state")

    def test_all_seven_stages_present_in_brief_order(self):
        stages = [s for s in data_values(RD_RAW, "data-stage")]
        self.assertEqual(stages, RD_STAGES,
                         "pipeline stages missing or out of order")

    def test_run_approve_and_reset_controls_exist(self):
        for role in ("run", "approve", "reset"):
            control = re.search(
                r"<button[^>]*data-role=\"%s\"[^>]*>" % role, RD_RAW)
            self.assertIsNotNone(control, f"missing {role} control")
        approve = re.search(
            r'<button[^>]*data-role="approve"[^>]*>(.*?)</button>',
            RD_RAW, re.S).group(1)
        self.assertIn("Approve for demo", approve,
                      "approval control must say it is demo-only")

    def test_approval_gate_states_nothing_sends(self):
        self.assertIn('class="gate"', RD_RAW, "approval gate block missing")
        self.assertIn("only changes this demo", RD_RAW,
                      "gate must say approval only changes the demo")
        self.assertIn("Nothing is sent to anyone", RD_RAW,
                      "gate must state the never-sends boundary")

    def test_live_status_region_exists(self):
        status = re.search(r'<p[^>]*data-role="status"[^>]*>', RD_RAW)
        self.assertIsNotNone(status, "status line missing")
        self.assertIn('aria-live="polite"', status.group(0))

    def test_routes_back_to_home_hub_fit_call_and_paid_start(self):
        hrefs = RD_DOM.hrefs()
        for target in ("/", "/demos/", BOOKING_URL, "/#pricing"):
            self.assertIn(target, hrefs, f"missing route to {target}")


RD_JS_RAW = read(RD_JS)


def last_listener_before_reveal(js_raw):
    """True when every addEventListener is bound before the shell reveal.

    Only the shell reveal counts: engines may legitimately toggle other
    elements' hidden state inside their handlers.
    """
    reveal = js_raw.find("shell.hidden = false")
    if reveal == -1:
        return False
    return all(m.start() < reveal
               for m in re.finditer(r"addEventListener\(", js_raw))


class TestRequestDeskEngine(unittest.TestCase):
    """assets/request-desk.js runs the pipeline deterministically and
    fail-closed, with demo-only approval."""

    def test_engine_exists(self):
        self.assertTrue(RD_JS.is_file(), "assets/request-desk.js missing")

    def test_engine_targets_its_declared_mounts(self):
        self.assertIn('[data-demo="request-desk"]', RD_JS_RAW,
                      "engine must find mounts by their data-demo contract")

    def test_engine_carries_full_pipeline_data_for_every_sample(self):
        for slug in ("catering-email", "phone-note", "web-form"):
            self.assertIn(slug, RD_JS_RAW, f"sample data missing: {slug}")
        for field in ("request:", "facts:", "missing:", "action:", "draft:",
                      "record:"):
            self.assertIn(field, RD_JS_RAW, f"pipeline field missing: {field}")

    def test_engine_builds_dom_with_text_content_only(self):
        self.assertIn("textContent", RD_JS_RAW)
        for banned in ("innerHTML", "outerHTML", "insertAdjacentHTML",
                       "document.write", "eval("):
            self.assertNotIn(banned, RD_JS_RAW,
                             f"unsafe DOM construction: {banned}")

    def test_approval_state_is_demo_only(self):
        self.assertIn("Approved for demo", RD_JS_RAW,
                      "approval must land in the demo-only state")
        self.assertIn("Nothing was sent", RD_JS_RAW,
                      "approved status must restate that nothing was sent")

    def test_reset_returns_to_the_ready_state(self):
        self.assertIn("Pick a sample request to begin.", RD_JS_RAW,
                      "reset must restore the ready status text")

    def test_shell_reveal_is_fail_closed(self):
        self.assertTrue(last_listener_before_reveal(RD_JS_RAW),
                        "the shell may only be revealed after every handler "
                        "is bound, so a script failure leaves the honest "
                        "fallback visible")

    def test_reduced_motion_is_respected(self):
        self.assertIn("prefers-reduced-motion", RD_JS_RAW,
                      "staged reveal must collapse under reduced motion")


BB_RAW = read(BB)
BB_DOM = parse(BB_RAW)

BB_SOURCES = ["bb-src-hours", "bb-src-policies", "bb-src-kitchen",
              "bb-src-staff"]


class TestBusinessBrainPage(unittest.TestCase):
    """/demos/business-brain/ shows a visible approved source library and an
    honest, deterministic ask surface."""

    def test_route_exists(self):
        self.assertTrue(BB.is_file(),
                        "demos/business-brain/index.html does not exist")

    def test_one_h1_title_canonical_and_shared_css(self):
        self.assertEqual(BB_DOM.tag_counts.get("h1", 0), 1)
        self.assertIn("ClearPath", BB_DOM.title)
        self.assertEqual(canonical_of(BB_DOM),
                         SITE_ORIGIN + "/demos/business-brain/")
        sheets = [l.get("href") for l in BB_DOM.links
                  if l.get("rel") == "stylesheet"]
        self.assertEqual(sheets, ["/assets/site.css"])

    def test_page_loads_only_its_own_deferred_engine(self):
        srcs = [s.get("src") for s in BB_DOM.scripts if s.get("src")]
        self.assertEqual(srcs, ["/assets/business-brain.js"])

    def test_honesty_denies_a_live_model_and_live_system(self):
        for phrase in ("sample data", "fictional", "Nothing is sent",
                       "No AI model runs on this page",
                       "workflow and controls ClearPath can build"):
            self.assertIn(phrase, BB_RAW, f"missing honesty phrase {phrase!r}")

    def test_fallback_visible_and_shell_hidden_in_source(self):
        self.assertIn('id="demo-fallback"', BB_RAW)
        self.assertIn('id="demo-shell"', BB_RAW)
        fallback_tag = re.search(r"<div[^>]*id=\"demo-fallback\"[^>]*>",
                                 BB_RAW).group(0) if BB_RAW else ""
        self.assertNotIn("hidden", fallback_tag)
        shell_tag = re.search(r"<div[^>]*id=\"demo-shell\"[^>]*>", BB_RAW)
        self.assertIsNotNone(shell_tag)
        self.assertIn("hidden", shell_tag.group(0))

    def test_mount_declares_the_business_brain_demo(self):
        self.assertIn('data-demo="business-brain"', BB_RAW)

    def test_source_library_is_displayed_with_quotable_fact_lines(self):
        for source_id in BB_SOURCES:
            self.assertIn(f'id="{source_id}"', BB_RAW,
                          f"approved source card missing: {source_id}")
        facts = data_values(BB_RAW, "data-fact")
        self.assertGreaterEqual(len(facts), 10,
                                "source cards need quotable fact lines")
        self.assertEqual(len(facts), len(set(facts)),
                         "data-fact ids must be unique")

    def test_preset_questions_include_one_the_sources_cannot_answer(self):
        presets = re.findall(r'<button[^>]*data-question="([^"]+)"[^>]*>',
                             BB_RAW)
        self.assertGreaterEqual(len(presets), 5,
                                "expected at least five preset questions")
        unanswerable = re.search(
            r'<button[^>]*data-question="[^"]*"[^>]*'
            r'data-expect="cannot-confirm"[^>]*>', BB_RAW)
        self.assertIsNotNone(unanswerable,
                             "one preset must be declared unanswerable so "
                             "the cannot-confirm path is always reachable")

    def test_typed_question_form_cannot_transmit_anything(self):
        form = re.search(r"<form[^>]*class=\"ask-form\"[^>]*>", BB_RAW)
        self.assertIsNotNone(form, "ask form missing")
        self.assertNotIn("action", form.group(0))
        self.assertNotIn("method", form.group(0))
        ask_input = re.search(r"<input[^>]*data-role=\"ask-input\"[^>]*>",
                              BB_RAW)
        self.assertIsNotNone(ask_input, "ask input missing")
        self.assertNotIn("name=", ask_input.group(0),
                         "input must carry no name so native serialization "
                         "is empty")
        self.assertIn("maxlength", ask_input.group(0))
        self.assertIn("not stored or sent", BB_RAW,
                      "local-only disclosure missing beside the input")

    def test_answer_region_approval_gate_and_reset_exist(self):
        self.assertIn('data-role="answer"', BB_RAW)
        approve = re.search(
            r'<button[^>]*data-role="approve"[^>]*>(.*?)</button>',
            BB_RAW, re.S)
        self.assertIsNotNone(approve, "approve control missing")
        self.assertIn("Approve draft for demo", approve.group(1))
        self.assertIsNotNone(
            re.search(r'<button[^>]*data-role="reset"[^>]*>', BB_RAW),
            "reset control missing")
        status = re.search(r'<p[^>]*data-role="status"[^>]*>', BB_RAW)
        self.assertIsNotNone(status, "status line missing")
        self.assertIn('aria-live="polite"', status.group(0))

    def test_routes_back_to_home_hub_fit_call_and_paid_start(self):
        hrefs = BB_DOM.hrefs()
        for target in ("/", "/demos/", BOOKING_URL, "/#pricing"):
            self.assertIn(target, hrefs, f"missing route to {target}")


BB_JS_RAW = read(BB_JS)


class TestBusinessBrainEngine(unittest.TestCase):
    """assets/business-brain.js must ground every answer in the displayed
    sources, refuse to guess, and keep drafts behind the owner gate."""

    def test_engine_exists(self):
        self.assertTrue(BB_JS.is_file(), "assets/business-brain.js missing")

    def test_engine_targets_its_declared_mounts(self):
        self.assertIn('[data-demo="business-brain"]', BB_JS_RAW)

    def test_answers_are_quoted_from_the_displayed_source_dom(self):
        self.assertIn("data-fact", BB_JS_RAW,
                      "engine must look up quoted lines by their data-fact id")
        for source_id in BB_SOURCES:
            self.assertIn(source_id, BB_JS_RAW,
                          f"rules never cite source {source_id}")
        for duplicated in ("8:00 am to 2:00 pm",
                           "patio only",
                           "sold at the register"):
            self.assertNotIn(duplicated, BB_JS_RAW,
                             "source text is duplicated in the script; "
                             "quotes must come from the displayed cards")

    def test_cannot_confirm_path_refuses_to_guess(self):
        self.assertIn("cannot confirm", BB_JS_RAW)
        self.assertIn("will not guess", BB_JS_RAW)
        self.assertIn("owner", BB_JS_RAW)

    def test_draft_stays_separate_from_approval(self):
        self.assertIn("Draft reply", BB_JS_RAW)
        self.assertIn("Approved for demo", BB_JS_RAW)
        self.assertIn("Nothing was sent", BB_JS_RAW)

    def test_typed_questions_are_handled_locally_and_safely(self):
        self.assertIn("preventDefault", BB_JS_RAW,
                      "submit must never navigate or transmit")
        self.assertIn("toLowerCase", BB_JS_RAW,
                      "matching should normalize typed text")
        self.assertIn("textContent", BB_JS_RAW)
        for banned in ("innerHTML", "outerHTML", "insertAdjacentHTML",
                       "document.write", "eval("):
            self.assertNotIn(banned, BB_JS_RAW,
                             f"unsafe DOM construction: {banned}")

    def test_reset_returns_to_the_ready_state(self):
        self.assertIn("Pick a question or type your own to begin.", BB_JS_RAW)

    def test_shell_reveal_is_fail_closed(self):
        self.assertTrue(last_listener_before_reveal(BB_JS_RAW),
                        "shell reveal must come after every handler binding")


WM_RAW = read(WM)
WM_DOM = parse(WM_RAW)


class TestWebsiteManagerPage(unittest.TestCase):
    """/demos/website-manager/ walks published value, draft, preview,
    summary, approval, and a browser-local publish."""

    def test_route_exists(self):
        self.assertTrue(WM.is_file(),
                        "demos/website-manager/index.html does not exist")

    def test_one_h1_title_canonical_and_shared_css(self):
        self.assertEqual(WM_DOM.tag_counts.get("h1", 0), 1)
        self.assertIn("ClearPath", WM_DOM.title)
        self.assertEqual(canonical_of(WM_DOM),
                         SITE_ORIGIN + "/demos/website-manager/")
        sheets = [l.get("href") for l in WM_DOM.links
                  if l.get("rel") == "stylesheet"]
        self.assertEqual(sheets, ["/assets/site.css"])

    def test_page_loads_only_its_own_deferred_engine(self):
        srcs = [s.get("src") for s in WM_DOM.scripts if s.get("src")]
        self.assertEqual(srcs, ["/assets/website-manager.js"])

    def test_honesty_says_no_real_website_changes(self):
        for phrase in ("sample data", "fictional", "Nothing is sent",
                       "No real website"):
            self.assertIn(phrase, WM_RAW, f"missing honesty phrase {phrase!r}")

    def test_fallback_visible_and_shell_hidden_in_source(self):
        self.assertIn('id="demo-fallback"', WM_RAW)
        self.assertIn('id="demo-shell"', WM_RAW)
        fallback_tag = re.search(r"<div[^>]*id=\"demo-fallback\"[^>]*>",
                                 WM_RAW).group(0) if WM_RAW else ""
        self.assertNotIn("hidden", fallback_tag)
        shell_tag = re.search(r"<div[^>]*id=\"demo-shell\"[^>]*>", WM_RAW)
        self.assertIsNotNone(shell_tag)
        self.assertIn("hidden", shell_tag.group(0))

    def test_mount_declares_the_website_manager_demo(self):
        self.assertIn('data-demo="website-manager"', WM_RAW)

    def test_three_editable_items_offered_as_pressed_state_buttons(self):
        items = data_values(WM_RAW, "data-item")
        self.assertEqual(sorted(set(items)), ["event", "hours", "note"])
        for name in set(items):
            button = re.search(
                r"<button[^>]*data-item=\"%s\"[^>]*>" % name, WM_RAW)
            self.assertIsNotNone(button, f"item {name} must be a button")
            self.assertIn("aria-pressed", button.group(0))

    def test_full_editorial_flow_surfaces_exist(self):
        for role in ("published", "draft-input", "preview", "summary",
                     "state-chip", "status"):
            self.assertIn(f'data-role="{role}"', WM_RAW,
                          f"flow surface missing: {role}")
        draft = re.search(r"<input[^>]*data-role=\"draft-input\"[^>]*>",
                          WM_RAW)
        self.assertIsNotNone(draft, "draft input missing")
        self.assertNotIn("name=", draft.group(0),
                         "draft input must carry no name attribute")
        self.assertIn("maxlength", draft.group(0))

    def test_page_has_no_form_element_at_all(self):
        self.assertTrue(WM.is_file(), "page missing")
        self.assertNotIn("<form", WM_RAW,
                         "an editor with no form cannot natively submit")

    def test_approve_publish_and_reset_controls_exist(self):
        approve = re.search(
            r'<button[^>]*data-role="approve"[^>]*>(.*?)</button>',
            WM_RAW, re.S)
        self.assertIsNotNone(approve, "approve control missing")
        self.assertIn("Approve change for demo", approve.group(1))
        publish = re.search(
            r'<button[^>]*data-role="publish"[^>]*>(.*?)</button>',
            WM_RAW, re.S)
        self.assertIsNotNone(publish, "publish control missing")
        self.assertIn("Publish demo", publish.group(1))
        self.assertIsNotNone(
            re.search(r'<button[^>]*data-role="reset"[^>]*>', WM_RAW),
            "reset control missing")
        self.assertIn("No real website changed", WM_RAW,
                      "publish boundary language missing")

    def test_routes_back_to_home_hub_fit_call_and_paid_start(self):
        hrefs = WM_DOM.hrefs()
        for target in ("/", "/demos/", BOOKING_URL, "/#pricing"):
            self.assertIn(target, hrefs, f"missing route to {target}")


WM_JS_RAW = read(WM_JS)


class TestWebsiteManagerEngine(unittest.TestCase):
    """assets/website-manager.js keeps draft, approval and publish as
    separate browser-local states."""

    def test_engine_exists(self):
        self.assertTrue(WM_JS.is_file(), "assets/website-manager.js missing")

    def test_engine_targets_its_declared_mounts(self):
        self.assertIn('[data-demo="website-manager"]', WM_JS_RAW)

    def test_engine_owns_the_three_published_baseline_values(self):
        for key in ("hours:", "event:", "note:"):
            self.assertIn(key, WM_JS_RAW, f"item state missing: {key}")
        self.assertIn("Sunday: 8:00 am to 2:00 pm", WM_JS_RAW,
                      "published Sunday hours baseline missing; it must "
                      "match the Business Brain source sheet")

    def test_draft_edits_produce_a_plain_change_summary(self):
        self.assertIn("'input'", WM_JS_RAW,
                      "draft field must update the preview live")
        self.assertIn("Was: ", WM_JS_RAW)
        self.assertIn("Now: ", WM_JS_RAW)

    def test_publish_requires_approval_and_stays_local(self):
        self.assertIn("Approved for demo", WM_JS_RAW)
        self.assertIn("Published (demo)", WM_JS_RAW)
        self.assertIn("No real website changed", WM_JS_RAW)

    def test_reset_returns_to_the_ready_state(self):
        self.assertIn("Pick something on the sample site to edit.", WM_JS_RAW)

    def test_engine_builds_dom_with_text_content_only(self):
        self.assertIn("textContent", WM_JS_RAW)
        for banned in ("innerHTML", "outerHTML", "insertAdjacentHTML",
                       "document.write", "eval("):
            self.assertNotIn(banned, WM_JS_RAW,
                             f"unsafe DOM construction: {banned}")

    def test_shell_reveal_is_fail_closed(self):
        self.assertTrue(last_listener_before_reveal(WM_JS_RAW),
                        "shell reveal must come after every handler binding")


IDX_RAW = read(INDEX)
IDX_DOM = parse(IDX_RAW)


def section_of(raw, section_id):
    """Raw slice from a section id to the next section tag (or EOF)."""
    marker = f'id="{section_id}"'
    if marker not in raw:
        return ""
    start = raw.index(marker)
    nxt = raw.find("<section", start)
    return raw[start:nxt] if nxt != -1 else raw[start:]


class TestHomepageDemoEntryPoints(unittest.TestCase):
    """The buyer journey must reach the demos from nav, hero, and body."""

    def test_nav_has_a_demos_path(self):
        self.assertIn("<main", IDX_RAW, "homepage has no main landmark")
        header = IDX_RAW[:IDX_RAW.index("<main")]
        self.assertIn('href="/demos/"', header,
                      "header navigation has no Demos path")

    def test_hero_offers_try_a_demo_beside_the_fit_call(self):
        self.assertIn('<section class="hero"', IDX_RAW, "hero missing")
        self.assertIn('id="familiar"', IDX_RAW, "familiar section missing")
        hero = IDX_RAW[IDX_RAW.index('<section class="hero"'):
                       IDX_RAW.index('id="familiar"')]
        self.assertIn('href="#see-it-run"', hero,
                      "hero must offer the try-a-demo action")
        self.assertIn("data-booking-offer", hero,
                      "hero must keep the fit-call action")

    def test_homepage_links_every_full_demo_route(self):
        hrefs = IDX_DOM.hrefs()
        self.assertIn("/demos/", hrefs)
        for slug, route in DEMO_ROUTES.items():
            self.assertIn(route, hrefs,
                          f"homepage never links the {slug} demo")


class TestHomepageDemoSurface(unittest.TestCase):
    """A compact, playable, honestly-labeled proof surface sits above the
    process and pricing explanations."""

    def test_surface_sits_before_how_pricing_and_clarity(self):
        for section_id in ("see-it-run", "how", "pricing", "clarity-session"):
            self.assertIn(f'id="{section_id}"', IDX_RAW,
                          f"section missing: {section_id}")
        surface = IDX_RAW.index('id="see-it-run"')
        self.assertLess(surface, IDX_RAW.index('id="how"'),
                        "demos must come before the process explanation")
        self.assertLess(surface, IDX_RAW.index('id="clarity-session"'),
                        "demos must come before the offer ladder")
        self.assertLess(surface, IDX_RAW.index('id="pricing"'),
                        "demos must come before pricing")

    def test_surface_declares_honesty(self):
        surface = section_of(IDX_RAW, "see-it-run")
        for phrase in ("sample data", "fictional", "Nothing is sent"):
            self.assertIn(phrase, surface,
                          f"surface missing honesty phrase {phrase!r}")

    def test_surface_ships_fallback_visible_shell_hidden(self):
        surface = section_of(IDX_RAW, "see-it-run")
        fallback_tag = re.search(r"<div[^>]*id=\"see-fallback\"[^>]*>",
                                 surface)
        self.assertIsNotNone(fallback_tag, "surface fallback missing")
        self.assertNotIn("hidden", fallback_tag.group(0))
        shell_tag = re.search(r"<div[^>]*id=\"see-shell\"[^>]*>", surface)
        self.assertIsNotNone(shell_tag, "surface shell missing")
        self.assertIn("hidden", shell_tag.group(0))
        for route in DEMO_ROUTES.values():
            fallback = surface[surface.index('id="see-fallback"'):
                               surface.index('id="see-shell"')]
            self.assertIn(route, fallback,
                          "no-JS visitors need the full demo routes")

    def test_tablist_semantics_are_complete(self):
        surface = section_of(IDX_RAW, "see-it-run")
        self.assertIn('role="tablist"', surface)
        tabs = re.findall(r"<button[^>]*role=\"tab\"[^>]*>", surface)
        self.assertEqual(len(tabs), 3, "expected exactly three tabs")
        selected = [t for t in tabs if 'aria-selected="true"' in t]
        self.assertEqual(len(selected), 1,
                         "exactly one tab may start selected")
        panel_ids = re.findall(
            r"<div[^>]*role=\"tabpanel\"[^>]*id=\"([^\"]+)\"", surface)
        if not panel_ids:
            panel_ids = re.findall(
                r"<div[^>]*id=\"([^\"]+)\"[^>]*role=\"tabpanel\"", surface)
        self.assertEqual(len(panel_ids), 3, "expected three tabpanels")
        for tab in tabs:
            controls = re.search(r'aria-controls="([^"]+)"', tab)
            self.assertIsNotNone(controls, f"tab missing aria-controls: {tab}")
            self.assertIn(controls.group(1), panel_ids,
                          "tab aria-controls must point at a tabpanel")

    def test_three_compact_playable_mounts_with_gates_and_resets(self):
        surface = section_of(IDX_RAW, "see-it-run")
        for slug in DEMO_ROUTES:
            mount = re.search(
                r"<div[^>]*data-demo=\"%s\"[^>]*>" % slug, surface)
            self.assertIsNotNone(mount, f"compact mount missing: {slug}")
            self.assertIn('data-variant="compact"', mount.group(0))
        self.assertGreaterEqual(surface.count('data-role="approve"'), 3,
                                "every compact demo needs its approval gate")
        self.assertGreaterEqual(surface.count('data-role="reset"'), 3,
                                "every compact demo needs its reset")
        self.assertIn('data-role="publish"', surface,
                      "compact website manager needs its publish control")

    def test_each_panel_links_to_its_full_demo(self):
        surface = section_of(IDX_RAW, "see-it-run")
        self.assertIn('id="see-shell"', surface, "surface shell missing")
        shell = surface[surface.index('id="see-shell"'):]
        for route in DEMO_ROUTES.values():
            self.assertIn(route, shell,
                          f"panel missing link to full demo {route}")

    def test_homepage_loads_all_engines_then_home_script_deferred(self):
        srcs = [s.get("src") for s in IDX_DOM.scripts if s.get("src")]
        self.assertEqual(srcs, ["/assets/request-desk.js",
                                "/assets/business-brain.js",
                                "/assets/website-manager.js",
                                "/assets/home.js"],
                         "homepage must load the three engines then home.js")
        for s in IDX_DOM.scripts:
            if s.get("src"):
                self.assertIn("defer", s, f"{s.get('src')} must be deferred")


class TestHomepageCapabilityMap(unittest.TestCase):
    def test_capability_map_links_each_lane_to_its_proof(self):
        self.assertIn('id="capabilities"', IDX_RAW,
                      "capability map section missing")
        cap = section_of(IDX_RAW, "capabilities")
        for route in DEMO_ROUTES.values():
            self.assertIn(route, cap, f"capability map must link {route}")
        self.assertIn('href="#pricing"', cap,
                      "operations lane must route to the starting points")
        self.assertGreaterEqual(cap.count('class="cap'), 4,
                                "expected four capability cards")


HOME_JS_RAW = read(HOME_JS)


class TestHomeScript(unittest.TestCase):
    """assets/home.js: tab a11y, gated reveal animation, fail-closed
    surface reveal."""

    def test_script_exists(self):
        self.assertTrue(HOME_JS.is_file(), "assets/home.js missing")

    def test_tabs_implement_the_full_keyboard_contract(self):
        for token in ("ArrowRight", "ArrowLeft", "Home", "End",
                      "aria-selected", "tabindex"):
            self.assertIn(token, HOME_JS_RAW,
                          f"tab keyboard contract missing: {token}")

    def test_scroll_reveal_hiding_is_gated_behind_the_script_itself(self):
        self.assertIn("js-anim", HOME_JS_RAW,
                      "home.js must add the class that enables hide-then-"
                      "reveal, so a missing script never hides content")
        self.assertIn("IntersectionObserver", HOME_JS_RAW)

    def test_surface_reveal_requires_every_mount_ready(self):
        self.assertIn("data-ready", HOME_JS_RAW,
                      "surface reveal must check that every engine wired")
        self.assertIn("see-shell", HOME_JS_RAW)
        self.assertIn("see-fallback", HOME_JS_RAW)

    def test_shell_reveal_is_fail_closed(self):
        self.assertTrue(last_listener_before_reveal(HOME_JS_RAW),
                        "surface reveal must come after every binding")

    def test_no_unsafe_dom_construction(self):
        for banned in ("innerHTML", "outerHTML", "insertAdjacentHTML",
                       "document.write", "eval("):
            self.assertNotIn(banned, HOME_JS_RAW)


CARD_RAW = read(CARD)
CARD_DOM = parse(CARD_RAW)

ALL_PAGES = {
    "index.html": (IDX_RAW, IDX_DOM),
    "demos/index.html": (HUB_RAW, HUB_DOM),
    "demos/request-desk/index.html": (RD_RAW, RD_DOM),
    "demos/business-brain/index.html": (BB_RAW, BB_DOM),
    "demos/website-manager/index.html": (WM_RAW, WM_DOM),
    "justin/card.html": (CARD_RAW, CARD_DOM),
}
DEMO_PAGES = {
    "demos/index.html": HUB_RAW,
    "demos/request-desk/index.html": RD_RAW,
    "demos/business-brain/index.html": BB_RAW,
    "demos/website-manager/index.html": WM_RAW,
}
ASSET_JS = {
    "assets/home.js": HOME_JS_RAW,
    "assets/request-desk.js": RD_JS_RAW,
    "assets/business-brain.js": BB_JS_RAW,
    "assets/website-manager.js": WM_JS_RAW,
}
SHIPPED_TEXT = dict(
    [(n, r[0]) for n, r in ALL_PAGES.items()] + list(ASSET_JS.items()) +
    [("assets/site.css", CSS_RAW),
     ("justin/justin-whalen.vcf", read(ROOT / "justin" / "justin-whalen.vcf"))]
)

STRIPE_URLS = {
    "https://book.stripe.com/3cI14nfbRcWe4uadBJ6Vq05",
    "https://buy.stripe.com/fZu28rbZFaO64ua9lt6Vq06",
    "https://buy.stripe.com/14A4gz6FlbSa6CifJR6Vq07",
    "https://buy.stripe.com/9B614n3t9f4m1hY9lt6Vq08",
}


class TestNoNetworkOrStorageAnywhere(unittest.TestCase):
    """Demo assets must be incapable of transmitting or persisting."""

    BANNED_JS = ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket",
                 "EventSource", "serviceWorker", "localStorage",
                 "sessionStorage", "indexedDB", "document.cookie",
                 "importScripts", "navigator.share")

    def test_asset_scripts_have_no_network_or_storage_path(self):
        for name, raw in ASSET_JS.items():
            self.assertTrue(raw, f"{name} is missing or empty")
            for banned in self.BANNED_JS:
                self.assertNotIn(banned, raw, f"{name}: found {banned}")
            self.assertNotIn("http://", raw, f"{name}: external URL")
            self.assertNotIn("https://", raw, f"{name}: external URL")

    def test_demo_pages_have_no_submission_routing(self):
        for name, raw in DEMO_PAGES.items():
            self.assertFalse(
                re.search(r"<form[^>]*\b(action|method)\s*=", raw),
                f"{name}: a form declares submission routing")
            self.assertNotIn("formaction", raw, name)
            self.assertNotIn("formmethod", raw, name)
            for banned in ("fetch(", "XMLHttpRequest", "sendBeacon",
                           "localStorage", "sessionStorage"):
                self.assertNotIn(banned, raw, f"{name}: found {banned}")

    def test_no_inline_event_handlers_in_demo_markup(self):
        for name, raw in DEMO_PAGES.items():
            for tag in re.findall(r"<[a-zA-Z][^>]*>", raw):
                self.assertFalse(
                    re.search(r"\son[a-z]+\s*=", tag),
                    f"{name}: inline event handler in {tag[:60]!r}")

    def test_only_local_scripts_and_stylesheets_load(self):
        for name, (raw, dom) in ALL_PAGES.items():
            for s in dom.scripts:
                src = s.get("src")
                if src is not None:
                    self.assertTrue(src.startswith("/assets/"),
                                    f"{name}: non-local script {src!r}")
            for l in dom.links:
                rel = l.get("rel", "")
                if rel in ("stylesheet", "icon"):
                    href = l.get("href", "")
                    self.assertFalse(
                        href.startswith(("http://", "https://", "//")),
                        f"{name}: external {rel} {href!r}")


class TestExternalUrlAllowlist(unittest.TestCase):
    """Every absolute URL on every public page must be accounted for."""

    URL_RE = re.compile(r"https?://[^\s\"'<>)]+")

    def allowed_for(self, name):
        allowed = {"https://www.clearpathwv.com"}
        if name != "justin/card.html":
            allowed.add(BOOKING_URL)
        if name == "index.html":
            allowed |= STRIPE_URLS
            allowed.add("https://schema.org")
            allowed.add("http://www.w3.org/2000/svg")
        if name == "justin/card.html":
            allowed.add("http://www.w3.org/2000/svg")
        return allowed

    def test_every_absolute_url_is_allowlisted(self):
        for name, (raw, dom) in ALL_PAGES.items():
            allowed = self.allowed_for(name)
            for url in self.URL_RE.findall(raw):
                url = url.rstrip("/")
                ok = any(url == a.rstrip("/") or
                         url.startswith(a.rstrip("/") + "/")
                         for a in allowed)
                self.assertTrue(ok, f"{name}: unexpected external URL {url}")

    def test_demo_routes_carry_no_checkout_paths(self):
        for name, raw in DEMO_PAGES.items():
            self.assertNotIn("stripe.com", raw,
                             f"{name}: demo surfaces must never route to "
                             "checkout")


class TestPublicTextRules(unittest.TestCase):
    def test_no_em_dashes_in_any_shipped_text(self):
        for name, raw in SHIPPED_TEXT.items():
            self.assertTrue(raw, f"{name} is missing or empty")
            self.assertNotIn("—", raw, f"{name}: em dash found")

    def test_no_internal_markers_in_any_shipped_text(self):
        for name, raw in SHIPPED_TEXT.items():
            for marker in ("FABLE", "LANE-REPORT", "CHECKOUT-CALENDAR-WIRING",
                           "NOTES FOR JUSTIN", "TODO", "FIXME"):
                self.assertNotIn(marker, raw, f"{name}: internal marker "
                                              f"{marker!r} leaked")

    def test_no_invented_proof_claims_on_any_page(self):
        for name, (raw, dom) in ALL_PAGES.items():
            lowered = raw.lower()
            for phrase in ("case study", "testimonial", "clients say",
                           "trusted by", "% savings", "hours saved",
                           "client logo"):
                self.assertNotIn(phrase, lowered,
                                 f"{name}: unverifiable proof claim "
                                 f"{phrase!r}")

    def test_retired_offers_stay_retired_on_new_pages(self):
        for name, raw in DEMO_PAGES.items():
            lowered = raw.lower()
            for phrase in ("workflow check", "ops desk", "clearpath support"):
                self.assertNotIn(phrase, lowered,
                                 f"{name}: retired offer resurfaced")

    def test_demo_contact_details_are_synthetic(self):
        email_re = re.compile(r"[A-Za-z0-9_.+-]+@[A-Za-z0-9-]+\.[A-Za-z.]+")
        phone_re = re.compile(r"\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}")
        scans = dict(DEMO_PAGES)
        scans.update(ASSET_JS)
        for name, raw in scans.items():
            for email in email_re.findall(raw):
                self.assertTrue(
                    email.endswith("@example.com") or
                    email == "JWhalen@ClearPathWV.com",
                    f"{name}: non-synthetic email {email}")
            self.assertEqual(phone_re.findall(raw), [],
                             f"{name}: phone-like number in demo content")


class TestLinkAndIdIntegrity(unittest.TestCase):
    """Ids resolve, fragments resolve, local paths resolve, one H1 each."""

    def test_no_duplicate_ids_on_any_page(self):
        for name, (raw, dom) in ALL_PAGES.items():
            seen = set()
            for element_id in dom.ids:
                self.assertNotIn(element_id, seen,
                                 f"{name}: duplicate id {element_id!r}")
                seen.add(element_id)

    def test_exactly_one_h1_per_page(self):
        for name, (raw, dom) in ALL_PAGES.items():
            self.assertEqual(dom.tag_counts.get("h1", 0), 1,
                             f"{name}: expected exactly one h1")

    def test_aria_and_label_references_resolve(self):
        attr_re = re.compile(
            r'(aria-controls|aria-labelledby|aria-describedby|for)='
            r'"([^"]+)"')
        for name, (raw, dom) in ALL_PAGES.items():
            ids = set(dom.ids)
            for attr, value in attr_re.findall(raw):
                for token in value.split():
                    self.assertIn(token, ids,
                                  f"{name}: {attr} points at missing id "
                                  f"{token!r}")

    def test_fragment_links_resolve_on_their_page(self):
        for name, (raw, dom) in ALL_PAGES.items():
            ids = set(dom.ids)
            for a in dom.anchors:
                href = a.get("href", "")
                if href.startswith("#") and href != "#":
                    self.assertIn(href[1:], ids,
                                  f"{name}: dangling fragment {href}")

    def test_cross_page_fragment_links_resolve(self):
        index_ids = set(IDX_DOM.ids)
        for name, (raw, dom) in ALL_PAGES.items():
            for a in dom.anchors:
                href = a.get("href", "")
                if href.startswith("/#"):
                    self.assertIn(href[2:], index_ids,
                                  f"{name}: dangling homepage fragment {href}")

    def test_local_paths_resolve_to_real_files(self):
        skip = ("http://", "https://", "mailto:", "sms:", "tel:", "data:",
                "#")
        for name, (raw, dom) in ALL_PAGES.items():
            page_dir = (ROOT / name).parent
            targets = []
            for a in dom.anchors:
                targets.append(a.get("href", ""))
            for l in dom.links:
                targets.append(l.get("href", ""))
            for s in dom.scripts:
                targets.append(s.get("src") or "")
            for i in dom.images:
                targets.append(i.get("src", ""))
            for target in targets:
                if not target or target.startswith(skip):
                    continue
                path = target.split("#")[0].split("?")[0]
                if not path:
                    continue
                if path.startswith("/"):
                    resolved = ROOT / path.lstrip("/")
                else:
                    resolved = page_dir / path
                if path.endswith("/"):
                    resolved = resolved / "index.html"
                self.assertTrue(resolved.is_file(),
                                f"{name}: broken local target {target!r}")


class TestDeployableInventory(unittest.TestCase):
    def test_only_expected_file_types_ship(self):
        allowed = {".html", ".css", ".js", ".png", ".webp", ".vcf", ".json",
                   ".md"}
        for path in ROOT.rglob("*"):
            if path.is_file() and ".git" not in path.parts \
                    and "tests" not in path.parts \
                    and not path.name.startswith("."):
                self.assertIn(path.suffix, allowed,
                              f"unexpected file type would ship: {path}")

    def test_markdown_and_tests_remain_excluded_from_deploy(self):
        rules = {line.strip() for line in
                 (ROOT / ".vercelignore").read_text(encoding="utf-8")
                 .splitlines() if line.strip()
                 and not line.strip().startswith("#")}
        self.assertIn("*.md", rules)
        self.assertIn("tests/", rules)


if __name__ == "__main__":
    unittest.main()
