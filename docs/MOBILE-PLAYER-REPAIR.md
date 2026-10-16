# Mobile player repair (2026-10-16)

Status: **source authored, tests unexecuted.** Fable 5.1 wrote these changes with file tools only. Arlo runs the suites, reviews screenshots, and publishes. No media, pricing, destination, hosting or configuration file changed. The approved MP4 (`dfd1cf79…6fa1`), WebM, poster, composition and brand assets are untouched.

## Defect (owner screenshot + controller reproduction)

On `/` and `/work/` the figure layered an HTML email-card still and a large play button over the real poster. At 320, 390 and 440 CSS px the button overlapped the fake message (overlap area about 15k to 18k px²); at 768 and 1280 the still simply duplicated the poster. Root scroll-width checks were green, so the collision was internal and vertical.

## Correction

| File | Change |
| --- | --- |
| `index.html`, `work/index.html` | `.video-frame` now contains only the `<video>` (poster, native controls, `preload="none"`, `muted`, `playsinline`, no autoplay). The custom control (`data-role="play"`) and a one-line state text sit in a `.video-controls` row below the picture; the status message (`role="status"`) is below that in normal flow. Caption shortened on the homepage; the fictional/no-send disclosure and all five transcript steps remain. |
| `assets/site.js` | Explicit state model derived from the media element: initial, loading, playing, paused, ended, unavailable. Labels: "Play the 20-second demonstration" / "Loading" / "Pause" / "Play" / "Play again". A pause during a pending `play()` (AbortError) is treated as a visitor choice, not a missing file. The control is never hidden or moved, so focus stays on it across state changes. No network, storage or tracking code. |
| `assets/site.css` | Appended block: 16:9 frame with only the video (`object-fit: contain`), control row with 44 px minimum height, full-width control under 480 px, status in static flow. The old `.video-still` rules remain in the file but match nothing. |
| `tests/browser-check.mjs` | Video journey now asserts a video-only frame, no overlay markup, control below the picture, and the `playing`/`unavailable` state model. |
| `tests/video-player-check.mjs` (new) | Real-browser matrix at 320, 375, 390, 414, 430, 440, 768, 1280 and landscape 844x390, 932x430, each at normal and 21 px body text: no element other than the video may overlap the picture, control below the picture, 44 px targets, 16:9 picture, no horizontal overflow, lazy/no-autoplay contract. Media journeys with real taps (390) and clicks (1280) on both pages: initial, playing, paused (focus kept), resume, ended/replay, transcript opening, keyboard Space; deliberate pending-pause is not an error; media deliberately blocked gives the honest unavailable state with the control still usable, then recovery; reduced motion; scripts disabled (native controls and written version remain). Expected blocked media requests are ledgered separately from unexpected errors. Chromium-only proof; no Safari/iOS claim. |
| `tests/test_video_player.mjs` (new) | Static contract: fails on the old overlay markup, pins control placement, video attributes, script state model, CSS placement and the locked MP4 hash. |

Mobile safety sweep: the existing `tests/browser-check.mjs` matrix (menu, parked pricing bar, contact draft/errors/no-JS, demos at 320 and 390) is unchanged and should be rerun; no adjacent regression was verified from the supplied evidence, so nothing else was altered. Anything it reports outside the video component is for Arlo to triage, not silently fixed here.

## Revision 2 (after parent verification of the first pass)

Actual parent results on revision 1: 48 Python and 54 Node tests passed; the focused Chromium suite passed 40 geometry samples and 28 stages; the overlay collision was gone. Parent and independent review found: (1) after blocking both formats and unblocking, a click on the same document issued no new media request and stayed unavailable, because errored media reports `paused=false` and the pause branch won; (2) with scripts disabled the custom control was visible but unbound; (3) the idle poster showed a native 0:00/loading overlay and the long label wrapped at 320 px; (4) at 568x320 the open phone menu's last link (bottom 406) sat below the viewport (320) and body scrolling could not reach it under the sticky header.

Corrections, all **authored and unexecuted**:

| File | Change |
| --- | --- |
| `assets/site.js` | Click handler decides retry first (`unavailable`, `video.error`, or `networkState === NETWORK_NO_SOURCE`) and only then falls into pause; a retry calls `load()` to reselect sources and issues new requests, then `play()`. A per-click token discards stale play-promise completions; AbortError from a deliberate pause is still not an error. Labels: Play video / Loading / Pause / Play / Play again / Try again, with state-specific `aria-label`s. Native controls are suppressed only for the idle enhanced poster and the honest unavailable poster, restored for loading, playing, paused and ended. The `.video-controls` row is revealed only after every handler is bound. |
| `index.html`, `work/index.html` | `.video-controls` ships `hidden`; short label "Play video"; state line "20 seconds, silent, made-up data."; figcaption keeps "Fictional demonstration. Not connected to a live client system. The final state is an approved draft, not a sent email." Transcript unchanged (five steps). HTML `controls` attribute retained for script-less visitors. |
| `assets/site.css` | `.video-controls[hidden]{display:none}` (global `[hidden]` rule also applies); `.menu-list` bounded to the space under the sticky header with `100vh` and `100dvh` fallbacks, `overflow-y:auto`, `overscroll-behavior:contain`; tap targets, styling and destinations unchanged. |
| `tests/video-player-check.mjs` | Idle poster must have native controls off and the control row visible; label must not wrap; blocked-media journey now performs a same-document retry with a retained `window.__retrySentinel`, requires new media requests after unblocking and the playing state with native controls restored; intentional blocked-media console records are ledgered as `expectedMediaErrors`, separate from unexpected errors; scripts-disabled and site.js-blocked journeys require the control row hidden, native controls on and the transcript present; short-landscape menu journeys (568x320, 667x375, 844x390) on `/`, `/pricing/` and `/demos/request-desk/` open the menu, wheel-scroll it internally, and require the last link inside the viewport, 44 px targets, no navigation and no page scroll chaining; portrait control at 390x844. |
| `tests/test_video_player.mjs`, `tests/browser-check.mjs` | Static contract pins the retry-before-pause order, `load()`, the token guard, idle-only control suppression, the hidden row and its late reveal, the short label and the menu CSS; the shared browser check expects the idle contract. |

## Revision 3 (final narrow correction)

Parent results on revision 2: 48 Python and 54 Node pass; broad browser check 42 pages / 57 stages PASS; focused suite 40 geometry samples / 39 stages with every player, same-document retry, no-JS, blocked-site-script and short-landscape menu check passing. Three failures at 844x390 were an observer mistake (the phone dropdown is intentionally `display:none` above 680 px, so a forced-open dropdown has zero-size rectangles). Axe `label-content-name-mismatch` reported serious violations on the player control ("Play video" named "Play the 20-second silent demonstration video"; paused "Play" named "Resume…").

Corrections, **authored and unexecuted**, no HTML/CSS/media change:

- `assets/site.js`: accessible names now start with the exact visible label in every state: "Play video: 20-second silent demonstration", "Loading the demonstration video", "Pause the demonstration video", "Play: resume the demonstration video", "Play again: replay the demonstration video", "Try again: retry loading the demonstration video". State logic, controls behavior and labels unchanged.
- `tests/video-player-check.mjs`: at widths where the dropdown is hidden, the journey asserts the dropdown is hidden and the desktop link row is visible, inside the viewport, with 44 px targets, and dispatches no wheel input; where the dropdown is shown, all internal-scroll, last-link, target-height and no-chaining assertions remain. Every observed control state must have an accessible name starting with its visible label; the initial-name check reads the new form.
- `tests/test_video_player.mjs`: static guard that each ARIA string starts with its label.

## Commands for Arlo, in order

```sh
cd "/Volumes/WV-FAST-2TB/20-Active-Workspaces/ClearPath-Website-Rebuild-2026-10-16/candidate"
node --test tests/test_video_player.mjs tests/test_media.mjs tests/test_review_regressions.mjs
/opt/homebrew/bin/python3.14 -m unittest discover -s tests -p 'test_*.py' -v
node tests/video-player-check.mjs       # writes qa/video-player-check.json and player-*.png
node tests/browser-check.mjs
node --test tests/test_production_release.mjs tests/test_server.mjs
```

Baseline RED: `tests/test_video_player.mjs` and the geometry half of `tests/video-player-check.mjs` are expected to fail on main `4bd5e15b` (overlay markup present, intruders over the picture) and pass on this branch.

## Known limits

- `Input.dispatchTouchEvent` is used for the 390 px journeys with touch emulation toggled per tap; if the parent's Chrome rejects it, rerun with the click path by editing the `click` selector in the media journey (reported, not auto-fallback, so the tap proof is not silently skipped).
- The `ended` check reads the duration from the real file; if the parent's Chrome lacks the codec, the journey reports `unavailable` and the defect names it.
- Physical-device and WebKit behavior remain Arlo's separate proof.
