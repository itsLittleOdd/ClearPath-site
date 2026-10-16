/* Production release contract. EXPECTED MODE: run AFTER
   `node tools/prepare-production.mjs --apply`. On the review tree it fails
   with an explicit "not applied yet" message rather than a vague mismatch.
   Run: node --test tests/test_production_release.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { PUBLIC_PAGES, PUBLIC_FILES } from '../tools/public-allowlist.mjs';
import { NEW_VERCELIGNORE, PUBLIC_LEAVES } from '../tools/prepare-production.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const sha = (rel) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex');
const AUTHORED = PUBLIC_PAGES.filter((p) => p !== 'justin/card.html');
const UTILITY = new Set(['404.html', 'thank-you/index.html']);
const PREVIEW_SUFFIX = '<span class="preview">Local review build, not indexed.</span>';
const PLACEHOLDERS = ['Draft for owner', 'local review build', 'not yet approved', 'Not yet approved', 'to be confirmed at release', 'Release decision pending', 'Pending owner and legal review', 'Draft privacy notice', 'Draft terms', 'Draft dated'];

test('expected mode: production edits have been applied', () => {
  assert.ok(!read('index.html').includes(PREVIEW_SUFFIX), 'not applied yet: run node tools/prepare-production.mjs --apply first');
});

test('every authored page lost the preview footer suffix and nothing else in the footer', () => {
  for (const p of AUTHORED) {
    const html = read(p);
    assert.ok(!html.includes(PREVIEW_SUFFIX), p);
    assert.ok(html.includes('&copy; 2026 ClearPath, a Whalen Ventures company'), p + ' footer line kept');
    assert.ok(!html.includes(' &middot; </p>'), p + ' dangling separator');
  }
});

test('normal pages are indexable; 404, thank-you and the protected card stay noindex', () => {
  for (const p of PUBLIC_PAGES) {
    const html = read(p);
    const m = /<meta name="robots" content="([^"]+)"/.exec(html);
    assert.ok(m, p + ' has a robots meta');
    if (UTILITY.has(p) || p === 'justin/card.html') { assert.match(m[1], /noindex/, p); }
    else { assert.equal(m[1], 'index, follow', p); }
    assert.ok(!html.includes('noindex, nofollow') || UTILITY.has(p), p + ' review directive gone');
  }
});

test('robots.txt is the exact production file and the sitemap inventory is unchanged', () => {
  assert.equal(read('robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://www.clearpathwv.com/sitemap.xml\n');
  const locs = [...read('sitemap.xml').matchAll(/<loc>https:\/\/www\.clearpathwv\.com([^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.equal(locs.length, 11);
  assert.ok(!locs.includes('/thank-you/') && !locs.includes('/404.html') && !locs.includes('/justin/card.html'));
});

test('.vercelignore is the exact public-leaf allowlist and excludes every internal path', () => {
  const actual = read('.vercelignore');
  assert.equal(actual, NEW_VERCELIGNORE);
  const lines = actual.split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual(lines.slice(0, 3), ['**', '!*/', '!/vercel.json']);
  assert.deepEqual(lines.slice(3), PUBLIC_LEAVES.map((f) => '!/' + f));
  assert.deepEqual(new Set(PUBLIC_LEAVES), PUBLIC_FILES);
  for (const never of ['!/tools', '!/creative', '!/tests', '!/docs', '!/qa', '!/dist', '!/.build-inputs', '!/.repair-inputs', '!/assets/home.js', '!/assets/media/manifest.json', '!*.html', '!/assets/', '!/assets/**', '!/*', '!**']) {
    assert.ok(!lines.includes(never), never);
  }
  for (const line of lines.slice(3)) { assert.match(line, /^!\/[A-Za-z0-9._\/-]+\.[a-z0-9]+$/, 'leaf only: ' + line); }
});

test('privacy and terms carry no unpublished placeholders and keep their honest policies', () => {
  for (const p of ['privacy/index.html', 'terms/index.html']) {
    const html = read(p);
    for (const ph of PLACEHOLDERS) { assert.ok(!html.includes(ph), p + ' still contains: ' + ph); }
    assert.ok(html.includes('Effective October 16, 2026.'), p);
    assert.ok(!/governing law/i.test(html), p + ' must not invent a governing-law clause');
    assert.ok(!/\d{2,5} [A-Z][a-z]+ (Street|St\.|Road|Rd\.|Avenue|Ave\.)/.test(html), p + ' no street address');
    assert.ok(html.includes('Ellicottville, New York'), p);
    assert.ok(html.includes('JWhalen@ClearPathWV.com'), p);
  }
  const privacy = read('privacy/index.html');
  assert.ok(privacy.includes('This website is hosted on Vercel.'));
  assert.ok(privacy.includes('<a href="https://vercel.com/legal/privacy-policy">'));
  assert.ok(privacy.includes('Nothing you type is sent to, or stored by, this website.'));
  assert.ok(privacy.includes('This site sets no cookies and runs no analytics or tracking scripts.'));
  const terms = read('terms/index.html');
  assert.ok(terms.includes('Work begins only after you and ClearPath sign or confirm a written scope and quote.'));
  assert.ok(terms.includes('no charge or subscription starts from this website'));
});

test('demo and fictional disclaimers remain; contact honesty remains; no trackers', () => {
  assert.ok(read('index.html').includes('Fictional demonstration. Not connected to a live client system.'));
  assert.ok(read('demos/index.html').includes('Honest demo:'));
  assert.ok(read('contact/index.html').includes('Nothing has been sent by this website. Review and send it from your email app.'));
  assert.ok(read('thank-you/index.html').includes('Your draft is ready.'));
  for (const p of AUTHORED) {
    const lower = read(p).toLowerCase();
    for (const t of ['gtag', 'googletagmanager', 'plausible', 'hotjar', 'segment.com', 'document.cookie']) { assert.ok(!lower.includes(t), p + ' ' + t); }
  }
});

test('approved media, hosting config and protected card are byte-locked', () => {
  assert.equal(sha('assets/media/request-demo.mp4'), 'dfd1cf79873a4b22b7d0c4ee4a78d413828922ad400673df7d62158efa4b6fa1');
  const vercel = JSON.parse(read('vercel.json'));
  assert.equal(vercel.outputDirectory, '.');
  assert.equal(vercel.redirects.length, 4);
  assert.ok(read('justin/card.html').includes('<meta name="robots" content="noindex" />'));
  for (const rel of PUBLIC_FILES) { assert.ok(fs.existsSync(path.join(ROOT, rel)), 'public leaf present: ' + rel); }
});
