# Regression coverage map (corrected 2026-10-16)

Correction to BUILD-REPORT's earlier blanket claim: the six retired September Python modules and `browser_journeys.mjs` held about 260 test definitions. Only part of that corpus asserted the retired Stripe storefront. The rest carried behavioral and security coverage that this map now either ports, replaces, or intentionally retires. Nothing below has been executed by the writer; Arlo runs the listed suites.

| Baseline coverage (September) | Decision | Where it lives now |
| --- | --- | --- |
| Exact Stripe payment-link IDs, `data-checkout-offer`, "charged today" first-charge disclosures | **Retired intentionally** (offers removed) | Negative assertions only: `test_site.py::test_retired_offers_and_checkout_links_are_gone` |
| Setup-plus-monthly price pairs, Starter/Core/Serious tiers, "Most owners start here" | **Retired intentionally** | Negative assertions in `test_site.py`; pricing parity with the frozen model in `test_pricing_page_matches_frozen_pricing_model` |
| Homepage compact demo tabs, pricing picker tablist keyboard model, section order | **Retired intentionally** (modules removed by design) | n/a |
| JavaScript-disabled fallbacks (demo fallback visible, shell hidden; content not hidden by reveal styling; card submit stays disabled) | **Ported** | `browser-check.mjs` journey `noScript` (request-desk fallback, homepage rises/reveals at opacity 1, contact nojs note and disabled review button) |
| Native Enter in a field navigates nowhere and writes nothing to the URL | **Ported** (contact page, with and without scripts) | `browser-check.mjs` `contact-*` (`-enter`) and `noScript` (`nojs-enter`), plus `noRequestsAfter` ledger |
| Keyboard selection of samples, focus handoff after run/approve, reset restores baseline | **Ported** | `browser-check.mjs` `requestDesk-1280` / `requestDesk-390` (Space selects, focus on Approve after run, focus on Reset after approval, reset clears stages) |
| Typed markup stays inert in Business Brain and Website Manager | **Ported** | `browser-check.mjs` `businessBrain` (injected `<img onerror>` never becomes an element, title unchanged) and `websiteManager` (`<b>` literal); `test_review_regressions.mjs` (engine in DOM shim) |
| Publish locked before approval; baseline restored after reset | **Ported and extended** | `test_review_regressions.mjs` (four state-machine tests incl. the inherited stale-indicator defect) and `browser-check.mjs` `websiteManager` |
| Populated mobile journeys | **Ported** | `browser-check.mjs` contact flow at 390, Request Desk at 390, menu at 390, sticky bar at 390 |
| Duplicate ids, ARIA/label reference integrity, one h1 | **Ported** | `test_review_regressions.py::TestReferenceIntegrity` |
| Prohibited generic-container naming | **Ported and corrected** (four generic `aria-label`s removed or given semantics) | `test_review_regressions.py::test_no_aria_label_on_generic_containers` |
| Numeric contrast checks | **Ported** against the new token table | `test_review_regressions.py::TestContrastTokens` |
| Target sizes | **Ported** (24 px minimum, inline text links exempt) | `browser-check.mjs` `targetSizes` at 390 |
| Label integrity for form controls | **Ported** | `test_review_regressions.py::test_every_form_control_has_an_accessible_label` |
| Protected card (`/justin/card.html`) behavioral checks | **Partly replaced**: bytes pinned (`test_site.py`), rendered at 1280/390/320 with console, overflow and request ledgers (`browser-check.mjs` matrix). The card's own intake flow is not re-exercised; its bytes are unchanged from the production-verified baseline | `test_site.py::TestProtectedFiles`, `browser-check.mjs` |
| Storefront CTA counts and copy-order assertions | **Retired intentionally** | replaced by hero contract in `test_site.py::test_homepage_hero_contract` |

## New coverage from the first verification

| Finding | Test |
| --- | --- |
| Output overrides could delete source (`--out justin`, `.git`, `assets`) | `test_output_safety.mjs`: refusals leave fixture sentinel bytes intact; symlink escape; non-empty destination; unknown flags; renderer bounds |
| 320 px scroll width 333 / 357 | `browser-check.mjs` matrix at `[320, 568]` compares document and body scroll width and element bounds to `clientWidth`; `test_review_regressions` source rules |
| Credit sentence embedded mid-sentence | `test_site.py::test_credit_wording_is_exact_everywhere_it_appears` (unchanged) now passes on corrected copy; `test_review_regressions.py::test_credit_sentence_is_standalone_wherever_it_appears` |
| Encoded traversal fixture normalized by `fetch`/`URL` | `test_server.mjs` `rawRequest` splits host/port/path by hand; `test_review_regressions.mjs` forbids `new URL(url)` there |
| Blank screenshots at 150 ms / mid-scroll | `browser-check.mjs` `settle()` (entrances, onscreen images, reveals) and `scrollTo()` (position reached) with deadlines; full-page captures after `revealAll()` with content-size clip |
| Blanket error suppression (`media|404`) | exact tolerated URL+status set `toleratedMissing`; `test_review_regressions.mjs` forbids the old regex |
| Network observed after the fact | `Fetch` interception blocks non-loopback requests before dispatch in the browser check and both renderers; per-journey ledgers |
| Same-origin contact leakage | `CONTACT_MARKERS` scan of every request URL and body after input; non-GET/query/body requests after input are defects |
| Parked sticky bar focusable off screen | `browser-check.mjs` `stickyCta`: inert and `aria-hidden` while parked, Tab/Shift+Tab geometry near the footer, focus-owned case never parks, releases after blur |
| Website Manager stale published badge/chip | `test_review_regressions.mjs` and `browser-check.mjs` `websiteManager` |
| Video review-row overlap at 15.2 s | `test_review_regressions.mjs` composition layout assertions; visual confirmation after Arlo rerenders |
