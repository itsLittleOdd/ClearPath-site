# Proposed hosting configuration changes (NOT APPLIED)

Status: proposal only. `vercel.json` and `.vercelignore` are byte-pinned in this candidate and were not modified. Nothing here is a deployment instruction; release is Justin's separate decision.

## 1. `.vercelignore` additions

The current file excludes `*.md`, `tests/` and `docs/`. The rebuild adds folders that must never upload if the repository is ever deployed directly:

```text
# proposed additions to .vercelignore
tools/
creative/
qa/
dist/
.build-inputs/
assets/home.js
assets/media/manifest.json
```

Reason: `creative/` holds the video composition source, `tools/` the renderer and server, `qa/` browser-check screenshots and receipts, `dist/` the local release candidate, and `assets/home.js` is a retired stub. Alternatively, deploy only the `dist/` folder produced by `node tools/build-release.mjs`, which already contains nothing but the public allowlist; in that model no `.vercelignore` change is needed.

## 2. `vercel.json`

No change is required for the new routes. Directory indexes (`/services/index.html`) are served by default, and the existing `/about` and `/justin` redirects remain correct. Optional, if desired at release:

```json
{
  "cleanUrls": false,
  "trailingSlash": true
}
```

`trailingSlash: true` would make Vercel redirect `/services` to `/services/`, matching the local server's 308 behavior exactly. Not required.

## 3. Review-mode to release

- Remove `<meta name="robots" content="noindex, nofollow">` from the public pages and switch `robots.txt` to `Allow: /` only when Justin approves release.
- `/justin/card.html` keeps its own `noindex` regardless.
- Add the chosen hosting provider name and policy link to `/privacy/`.
- Decide the postal-address line on `/privacy/` and `/terms/`.
