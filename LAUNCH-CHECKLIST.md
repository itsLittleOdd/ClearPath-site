# Launch checklist, classified (rebuild 2026-10-16)

Status vocabulary: **authored** (source exists in this candidate), **pending parent run** (a listed command produces the evidence; not yet executed), **release-held** (a decision Justin or counsel makes later; not installed and not claimed), **n/a**.

Nothing in this table was executed by the writer. "Evidence" names the test or artifact Arlo runs to confirm.

Revision 2 (2026-10-16 correction) after Arlo's first run: rows 1, 2, 3, 5, 6, 7, 9, 13, 14, 17, 18, 19 passed in the first Python/Node/browser execution as authored; row 10 **failed** at 320 px (homepage 333 px, services 357 px) and is corrected in `assets/site.css` with 320 added to the browser matrix; row 11 **failed** (parked bar received native Tab focus off screen) and is corrected with `inert`, `aria-hidden`, `visibility:hidden` and a focus-owned guard; row 8's share image was rendered by Arlo; row 20's media sizes were measured (MP4 314365 bytes, WebM 453616 bytes). The credit-sentence source test failed on homepage wording and is corrected in copy, not in the test. The encoded-traversal test transport is corrected. All revision-2 corrections are **pending parent run**; the tooling hazard (release `--out` deletion) is corrected in `tools/lib/output-paths.mjs` with `tests/test_output_safety.mjs`. Coverage split: `docs/regression-coverage-map.md`.

| # | Row | Status | Evidence / gate |
| --- | --- | --- | --- |
| 1 | Custom 404 with correct status under the local route server | authored, pending parent run | `tests/test_server.mjs` (unknown routes 404 with `404.html` body); `tests/browser-check.mjs` journey `notFound` |
| 2 | Unique page titles | authored, pending parent run | `test_site.py::TestInventoryAndMetadata::test_unique_titles_and_descriptions` |
| 3 | Unique public-page descriptions | authored, pending parent run | same test |
| 4 | Clear above-fold CTA on conversion pages | authored, pending parent run | `browser-check` records `ctaAboveFold` for `/`, `/services/`, `/work/`, `/pricing/`, `/contact/` at 1280, 390 and 360 |
| 5 | Favicon | authored (baseline `favicon.png` kept, linked on every page) | `test_document_scaffold`; a logo-derived favicon is an optional follow-up |
| 6 | robots.txt appropriate to review mode | authored | `test_robots_is_review_mode` (Disallow all, sitemap line) |
| 7 | Sitemap with correct public-route inventory, indexing disabled | authored | `test_sitemap_lists_exactly_the_public_routes` (11 routes; 404, thank-you and the card excluded); every page `noindex` (`test_every_public_page_is_noindex`); server adds `X-Robots-Tag` |
| 8 | Open Graph metadata and a real share image | metadata authored; image pending parent run | `test_canonical_and_open_graph`; `node tools/render-brand.mjs` replaces the September `og-image.png`, whose tagline carries the retired universal promise. Until rendered, the old image is what is referenced |
| 9 | Alt attributes, decorative images empty alt | authored, pending parent run | `test_images_have_alt_attributes`; founder portrait descriptive, contact thumbnail and crop-frame logo handled (`alt=""` / `alt="ClearPath"`) |
| 10 | Mobile breakpoints, no overflow | authored, pending parent run | `browser-check` overflow scan at 1280, 390, 360 on all 14 routes with screenshots in `qa/` |
| 11 | Sticky mobile CTA only where useful, with clearance | authored (pricing page only), pending parent run | `browser-check` journey `stickyCta`: bar parks when any section CTA or the footer is on screen and while a field has focus; body gets 84 px clearance |
| 12 | Loading / preparation states where async work occurs | authored | Video: HTML still, explicit Play, "not available in this build" state, `ended` resets; contact: button reads "Preparing your draft" during validation; demos keep their Running / Approval chips |
| 13 | Form validation and error states | authored, pending parent run | `tests/test_contact.mjs` (rules) and `browser-check` journey `contact-empty`, `contact-bad-email` (summary, per-field messages, `aria-invalid`, focus) |
| 14 | Honest thank-you / success state | authored, pending parent run | In-page result "Your draft is ready. Nothing has been sent by this website." and `/thank-you/`; `test_thank_you_is_honest` forbids "received"/"submitted" |
| 15 | Privacy page reflecting actual local behavior | authored draft, **release-held** for owner/legal review | `/privacy/` describes no cookies, no analytics, mailto-only contact, browser-local demos; hosting-provider name and postal address marked pending |
| 16 | Terms page: site use vs later service agreement | authored draft, **release-held** for owner/legal review | `/terms/` sections 2 and 3 separate prices-as-guide from the written agreement; governing law and address pending |
| 17 | Cookie-banner decision | n/a by design | No nonessential tracking runs, so no banner. `test_dormant_analytics_contract_only` forbids banner copy and provider scripts. A real consent integration needs separate activation |
| 18 | Analytics decision | **release-held**; dormant contract authored | `window.clearpathEvent()` in `assets/site.js` counts in memory only; no provider enrolled, nothing transmitted. Package "agreed analytics" wording is not permission to activate tracking here |
| 19 | Verified contact details and location, no home address | authored | `JWhalen@ClearPathWV.com` and the exact fit-call URL only (`test_fit_call_destination_is_exact_and_never_a_form`); Ellicottville / Western New York; `test_founder_copy_and_location` fails on any street-address pattern. Full postal-address decision **release-held** |
| 20 | Compressed, correctly sized images and measured media sizes | partly authored, pending parent run | Existing WebP/PNG assets reused unchanged; video sizes measured into `assets/media/manifest.json` and bounded by `tests/test_media.mjs` (MP4 and WebM under 3 MiB, poster under 200 KiB). Logo raster is served uncropped (cropped in CSS); a trimmed logo file is an optional follow-up |

## Additional constraints from the brief

| Check | Status | Evidence |
| --- | --- | --- |
| Keyboard and visible focus | pending parent run | `browser-check` journeys `skipLink`, `focusVisible` (3 px clay outline, `:focus-visible`) |
| Contrast | authored per DESIGN.md token table | Manual spot-check against `qa/*.png` by Arlo; no automated contrast tool without packages |
| Reduced motion | pending parent run | `browser-check` journey `reducedMotion` (all `.reveal`/`.rise` fully visible, video paused, no autoplay) |
| Working menu and anchors | pending parent run | `browser-check` journey `menu`; `test_every_link_resolves` checks every internal href and fragment, including legacy `/#about`, `/#pricing`, `/#how`, `/#faq`, `/#see-it-run`, `/#clarity-session` |
| Console clean | pending parent run | `browser-check` per-page `errors` (404s for pending media are tolerated and noted until the render runs) |
| Asset responses and route fallbacks | pending parent run | `tests/test_server.mjs` |
| Link destinations | authored, pending parent run | only `mailto:JWhalen@ClearPathWV.com…` and the exact cal.com URL may leave the site |
| Absence of retired offers | authored, pending parent run | `test_retired_offers_and_checkout_links_are_gone` (Stripe hosts, tier names, setup-plus-monthly prices, "AI Clarity", "checkout", internal rate-card numbers) |
| Privacy / no-network behavior | pending parent run | `browser-check` per-page `external` request list must be empty; storage and cookies checked after the contact flow; `test_site_scripts_have_no_network_storage_or_html_injection` |
| Protected files | pending parent run | `test_pinned_legacy_and_hosting_files_match_baseline_commit` compares `justin/*`, `vercel.json`, `.vercelignore` to `git show HEAD:` |
| Video is a real file with controls, poster, text equivalent, reduced motion | authored source; binary pending parent run | `tools/render-video.mjs`; `test_video_markup_is_honest_and_lazy`; transcript parity test in `tests/test_media.mjs` |
| No new npm dependency | authored | `tests/test_media.mjs` checks every tool imports only `node:` built-ins and local files |
| Deploy allowlist | authored, never deployed | `tools/build-release.mjs`; `docs/proposals/hosting-config-proposal.md` |

## Release-held decisions (not installed, not claimed)

1. Removing `noindex` and opening `robots.txt`.
2. Analytics provider enrollment and any consent banner.
3. Real server-backed form delivery (today: mailto only).
4. Payment wiring for Clarity or any package (today: contact-gated; old Stripe links removed, no new ones created).
5. Owner/legal approval of `/privacy/` and `/terms/`, including hosting-provider name, governing law and the postal-address line.
6. Replacing `og-image.png` and, optionally, `favicon.png` with the rendered versions.
7. Any `.vercelignore` / `vercel.json` change (proposal only).
8. Owner confirmation that the three buyer paths reflect the intended offer (marketing advisory question).
