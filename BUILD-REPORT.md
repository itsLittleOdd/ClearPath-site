# BUILD-REPORT: ClearPath rebuild, local review candidate

Writer: Fable 5.1 (`claude-fable-5-1`), file tools only. Root: `candidate/`. Revision 3 (same-session closeout correction, 2026-10-16).

**Execution status: revisions 1 and 2 were executed by Arlo (results below). Revision 3 changes only the containment guard, three test oracles and the browser-check readiness/keyboard observers; none of them has been run. No acceptance, no production readiness, no release claim.**

## 1. Actual parent results

Revision 1 (first run): Python 35 tests, 1 failure (credit sentence embedded mid-sentence); Node 22 of 24 (encoded-traversal transport normalized by `fetch`); renderers exit 0; writer's browser PASS not accepted (unsettled screenshots); settled observations found 320 px overflow, stale Website Manager indicators, parked bar reachable by Tab; review found the `--out` deletion hazard.

Revision 2 (second run): Python 47 tests with one bad structural oracle (`test_website_manager_engine_withdraws_indicators_on_input` split at the wrong `return;`); Node 39 with one refusal-message mismatch (`.git` case expected lowercase "hidden"; `og-image.png` release case rejected as "must be under dist"); browser 42 route records and 57 journeys with 21 defects, predominantly readiness-oracle false positives (a `/work/` reveal 8.7% visible, below the product's 12% observer threshold, was demanded settled) plus skip-link geometry sampled during focus-induced smooth scrolling. 320 px reflow no longer reports overflow. Native demo approval flows and the parked bar's inert behavior are corrected. New video and share image rendered. A read-only diagnostic showed `resolveOutput` accepted `qa/inside/new.png` when `qa/inside` was a symlink to the fixture's own `justin`, because the realpath stayed inside the root.

## 2. Revision 3 corrections (unexecuted)

| # | Correction | File |
| --- | --- | --- |
| 1 | Reject a symbolic link in every existing component below the root (dangling included) and symlinked or non-regular known output leaves (`request-demo.mp4`, `.webm`, poster, `manifest.json`) for the video purpose, before any mutation. Strict relative tokens: empty segments, `.` segments, surrounding whitespace are refused rather than normalized; a single trailing slash is tolerated. Defaults (`dist`, `assets/media`, `og-image.png`) still work; nothing is deleted. Renderer files unchanged. | `tools/lib/output-paths.mjs` |
| 1 | New disposable-fixture negatives: link inside root to `justin`, dangling link, linked output leaf, `dist` linked to `assets`, strict-token cases; sentinel bytes compared before and after | `tests/test_output_safety.mjs` |
| 2 | Refusal patterns match the refusal class case-insensitively (`hidden`, `protected|source|must be under dist`, `symbolic link|symlink`) | `tests/test_output_safety.mjs` |
| 2 | Python oracle targets the empty-draft branch and the withdrawal helper instead of the first `return;` | `tests/test_review_regressions.py` |
| 3 | Readiness predicate requires opacity 1 only for reveals the product would have triggered (15% or more inside the observer's root, or already carrying `in`); the legacy card without the site's `js-anim` hook is judged by computed opacity only; full-page captures require every reveal triggered after the deliberate scroll-through | `tests/browser-check.mjs` (`SETTLED`, `ALL_REVEALED`, `shot`) |
| 4 | `tab()` / `shiftTab()` wait for focus-induced scrolling to stop (stable `scrollY`, 3 s deadline) before geometry is read; BODY focus is treated as a boundary, not a hidden control; parked-bar and invisible real-control rejections kept; reduced-motion and focus-owned sticky cases unchanged | `tests/browser-check.mjs` |
| 5 | This report | `BUILD-REPORT.md` |

`assets/site.css` was not touched (no skip-link change needed). No product, media, frozen input, hosting or `/justin` file changed in revision 3.

## 3. Commands for Arlo (ordered)

```sh
cd "/Volumes/WV-FAST-2TB/20-Active-Workspaces/ClearPath-Website-Rebuild-2026-10-16/candidate"
node --test tests/test_output_safety.mjs tests/test_review_regressions.mjs tests/test_server.mjs tests/test_contact.mjs tests/test_media.mjs
/opt/homebrew/bin/python3.14 -m unittest discover -s tests -p 'test_*.py' -v
node tests/browser-check.mjs
node tools/build-release.mjs --check
```

Renders are not required again; the composition and brand sources did not change in revision 3.

## 4. Remaining risks

- The 15% exposure threshold in `SETTLED` sits above the product's 12% observer threshold by design; a reveal exposed between 12% and 15% while the page is mid-entrance is tolerated as not yet settled rather than demanded.
- `focusSettle` samples `scrollY` only; a focus target inside an internal scroll container would not be detected (none exist in this build).
- Everything listed in revision 2 as release-held is unchanged.
