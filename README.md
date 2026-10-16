# ClearPath website rebuild, local review candidate (2026-10-16)

Static HTML, CSS and JavaScript. No build step, no packages, no framework. Written by Fable 5.1 with file tools only; every command below is executed by Arlo, not by the writer. Nothing here is published.

## What is in this folder

| Path | What |
| --- | --- |
| `index.html`, `services/`, `work/`, `pricing/`, `contact/`, `thank-you/`, `privacy/`, `terms/`, `404.html` | The public pages |
| `demos/`, `demos/request-desk/`, `demos/business-brain/`, `demos/website-manager/` | Existing browser demos, same engines, new site chrome |
| `justin/` | Contact card, bytes unchanged |
| `assets/site.css`, `assets/site.js`, `assets/contact.js`, `assets/request-desk.js`, `assets/business-brain.js`, `assets/website-manager.js` | Styles and scripts (`assets/home.js` is a retired stub) |
| `assets/media/` | Rendered video, poster and manifest. Created by the renderer; absent until it runs |
| `creative/request-demo/composition.html`, `STORYBOARD.md` | Deterministic 20-second video composition (not public) |
| `creative/brand/og-image.html` | Share-image source (not public) |
| `tools/serve.mjs` | Loopback review server with allowlist and real 404s |
| `tools/public-allowlist.mjs` | Single source of truth for public files, redirects and pinned files |
| `tools/render-video.mjs`, `tools/render-brand.mjs`, `tools/lib/chrome.mjs` | Isolated-Chrome renderers (CDP + FFmpeg) |
| `tools/build-release.mjs` | Copies the allowlist into `dist/`; never deploys |
| `tests/` | Python source tests, Node unit tests, self-contained browser check |
| `DESIGN.md`, `BUILD-REPORT.md`, `LAUNCH-CHECKLIST.md`, `docs/legacy-route-map.md`, `docs/proposals/hosting-config-proposal.md` | Handoff documents |

## Commands, in order

Run everything from this folder. Expected tools: Node v22, `/opt/homebrew/bin/python3.14`, system Google Chrome, `/Users/Hermes/.local/bin/ffmpeg` and `ffprobe`. Override with `CLEARPATH_CHROME`, `CLEARPATH_FFMPEG`, `CLEARPATH_FFPROBE` if they live elsewhere.

```sh
cd "/Volumes/WV-FAST-2TB/20-Active-Workspaces/ClearPath-Website-Rebuild-2026-10-16/candidate"

# 1. Source and copy boundaries (pricing parity, no retired offers, links, noindex, pinned bytes)
/opt/homebrew/bin/python3.14 -m unittest discover -s tests -p 'test_*.py' -v

# 2. Node unit tests: output-path safety (disposable fixtures), review regressions
#    (Website Manager state machine, source invariants), server routes with raw
#    request paths, contact draft logic, media/composition contract
node --test tests/test_output_safety.mjs tests/test_review_regressions.mjs tests/test_server.mjs tests/test_contact.mjs tests/test_media.mjs

# 3. Render the video, poster and WebM (creates assets/media/; ~1 to 3 minutes)
node tools/render-video.mjs
#    options: --skip-webm   --keep-frames   --fps 24   --ffmpeg /path/to/ffmpeg

# 4. Render the new share image over the September one (optional but recommended)
node tools/render-brand.mjs

# 5. Re-run the media contract now that binaries exist (sizes, duration, manifest)
node --test tests/test_media.mjs

# 6. Browser proof: console, network, overflow, menu, focus, reduced motion, video,
#    sticky CTA, contact flow, demos, 404, logo crop. Writes qa/browser-check.json + screenshots.
node tests/browser-check.mjs
#    quick desktop-only pass: node tests/browser-check.mjs --quick

# 7. Manual review server (Ctrl+C to stop)
node tools/serve.mjs --port 4173
#    then open http://127.0.0.1:4173/

# 8. Optional: assemble a release candidate folder (copies only; does not deploy)
node tools/build-release.mjs --check     # list only
node tools/build-release.mjs             # writes dist/
```

Step 6 exits non-zero and lists concrete defects if anything fails. Step 3 must run before the video plays; until then the page shows the HTML still frame and an honest "not available in this build" message when Play is pressed.

## Behavior notes

- Every public page carries `noindex, nofollow` and `robots.txt` disallows all. Release flips both; see `docs/proposals/hosting-config-proposal.md`.
- The contact page builds an email draft and opens the visitor's own mail app with `mailto:`. There is no server, no storage, no network call. The success state says the draft is ready, never that anything was received.
- The review server only serves files in `tools/public-allowlist.mjs`. `.git`, `.build-inputs`, `tests`, `tools`, `creative`, `docs`, `qa`, `dist` and every Markdown file return the custom 404 with a 404 status.
- `vercel.json`, `.vercelignore` and everything under `justin/` are byte-identical to the baseline commit; `tests/test_site.py` checks this against `git show HEAD:`.
- To preview the composition while authoring: open `creative/request-demo/composition.html?preview=1` directly in a browser (space to play, slider to scrub). That preview is not the delivered video.
