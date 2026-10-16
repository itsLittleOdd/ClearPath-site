# Publication preparation (2026-10-16)

Status: **source authored, execution pending.** Fable 5.1 wrote the producer, its contract test and this note with file tools only. Nothing has been run, applied, committed, previewed or deployed by the writer. Arlo executes the producer, proves hosted exclusion on a Git preview, promotes to main and verifies live.

## What the producer changes (and nothing else)

`node tools/prepare-production.mjs` (dry run by default, `--apply` to write). Fixed root, built-ins only, no deletion, no network. It refuses unknown flags, a wrong approved-video hash, any file that is neither in the expected review state nor the finished state, and a mixed tree.

| Path | Edit |
| --- | --- |
| `index.html`, `services/`, `work/`, `pricing/`, `contact/`, `privacy/`, `terms/`, `demos/` (4 pages) | remove ` &middot; <span class="preview">Local review build, not indexed.</span>`; `noindex, nofollow` becomes `index, follow` |
| `404.html`, `thank-you/index.html` | remove the preview suffix only; keep `noindex, nofollow` |
| `privacy/index.html` | drop "Draft" and review placeholders; "Effective October 16, 2026."; hosting paragraph names Vercel, its standard request logs and links https://vercel.com/legal/privacy-policy |
| `terms/index.html` | drop "Draft" and review placeholders; "Effective October 16, 2026." No governing-law clause, no address |
| `robots.txt` | exactly `User-agent: *` / `Allow: /` / sitemap URL |
| `.vercelignore` | `**`, `!*/`, `!/vercel.json`, then one root-anchored `!/<leaf>` per public file from `tools/public-allowlist.mjs` (32 public content leaves; `vercel.json` is one additional configuration upload, not a public content file). tools, creative, tests, docs, qa, dist, both input folders, `assets/home.js` and `assets/media/manifest.json` stay excluded |
| `tests/test_site.py` | four anchored replacements: public pages indexable / utility noindex; robots exact; `.vercelignore` exact leaf policy (justin and vercel.json stay git-pinned); the external-link check additionally permits the Vercel policy URL on `/privacy/` only |

Untouched by design: design, prices, service boundaries, scripts, CSS, media (`request-demo.mp4` must hash `dfd1cf79873a4b22b7d0c4ee4a78d413828922ad400673df7d62158efa4b6fa1`), `sitemap.xml`, canonical URLs, `vercel.json`, `/justin/*`. The producer hashes every other public file before and after and exits non-zero on drift.

## Commands for Arlo, in order

```sh
cd "/Volumes/WV-FAST-2TB/20-Active-Workspaces/ClearPath-Website-Rebuild-2026-10-16/candidate"
node tools/prepare-production.mjs --check          # dry run: proposed paths and before/after hashes
node tools/prepare-production.mjs --apply          # writes the release-only edits
node tools/prepare-production.mjs --check          # must report allFinished: true, nothing written
node --test tests/test_production_release.mjs      # production contract (expects applied state)
/opt/homebrew/bin/python3.14 -m unittest discover -s tests -p 'test_*.py' -v
node --test tests/test_output_safety.mjs tests/test_review_regressions.mjs tests/test_contact.mjs tests/test_media.mjs
node tests/browser-check.mjs
```

Then: commit on `clearpath-release-20261016`, push for a Git preview, prove on the preview that `/tools/`, `/creative/`, `/tests/`, `/docs/`, `/qa/`, `/assets/home.js`, `/assets/media/manifest.json`, `/.build-inputs/` and every `.md` return 404 while all 32 public content leaves (including `/justin/card.html`) return 200, check `robots.txt` and the per-page robots meta, then promote to main and verify live. Local pattern checks are not proof of hosting behavior.

## Known consequences and blockers (disclosed, not hidden)

1. **`tests/test_server.mjs` observer correction, authored and awaiting execution.** After `--apply`, the full Node run reached two stale review-mode assertions (a `noindex` meta on every HTML route; `Disallow` in robots.txt). Under Arlo's narrow authorization within the publication scope, those two assertions now require `index, follow` on normal public pages, `noindex` on `/404.html`, `/thank-you/` and `/justin/card.html`, and the exact production `robots.txt` (`Allow: /` plus the sitemap line, no fallback). The loopback server's own `X-Robots-Tag: noindex, nofollow` header remains asserted because that server stays review-only. Every route, status, private-file, range and method assertion is unchanged. No product file changed. Rerun: `node --test tests/test_server.mjs`.
2. **One extra anchored test adaptation beyond the three named methods:** `tests/test_site.py::_target_exists` previously allowed only the fit-call URL for external links. The required Vercel policy link would fail it, so the producer permits exactly that one URL on `/privacy/`. Reported here so Arlo can veto it; if vetoed, drop the `<a>` from the privacy hosting paragraph and the producer's third test_site pair together.
3. The `.vercelignore` semantics (`**`, `!*/`, root-anchored leaves) follow standard ignore rules; hosted behavior must be proven on the Git preview before promotion.
4. No legal or professional approval is asserted anywhere; the owner's publish instruction covers publishing the existing informational text only.
