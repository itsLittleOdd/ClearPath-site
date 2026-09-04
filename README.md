# ClearPath website

Static HTML, CSS and browser-local JavaScript. No install or build service is needed. Generated HTML is committed for Vercel static hosting.

## Source and checks

`tools/build-pages.py` owns the five rebuilt pages. `assets/app.mjs` is the interface; `assets/models.mjs` holds the deterministic demonstration logic. The examples are fictional, not connected AI. Keep that disclosure visible.

```sh
python3 tools/build-pages.py
node --check assets/app.mjs
node --check assets/models.mjs
node --test tests/models.test.mjs
python3 tests/static-qa.py
python3 -m http.server 8767 --bind 127.0.0.1
# Separate shell, using existing local Chrome and Puppeteer from pa11y:
node tests/browser-qa.mjs http://127.0.0.1:8767
```

Current verification entrypoints are the commands above. Older `test_*.py` files and `browser_journeys.mjs` remain as historical tests of the previous design; they are not the acceptance suite for this rebuild.

## Publication

The existing main branch deploys to the existing Vercel project. `.vercelignore` excludes tests, tools, documentation and local evidence from hosting. No credentials belong in this repository. Existing `/justin` assets, redirects, checkout destinations and pricing are preserved. Publishing a website does not authorize changing payment products, accounts, credentials or connected AI providers.

Important decisions remain human-approved. Demo approval/publish buttons affect browser-memory only. A reload clears state. JSON receipts are downloaded only when requested.
