/* Route, status and boundary tests for the loopback review server.
   Run: node --test tests/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { startReviewServer } from '../tools/serve.mjs';
import { resolveRequest } from '../tools/public-allowlist.mjs';

/* The request target is split by hand so encoded traversal such as
   /%2e%2e/index.html reaches the server byte-for-byte. new URL() would
   normalize it to /index.html before transmission (first-run observer defect). */
function rawRequest(url, { method = 'GET', headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const m = /^http:\/\/([^/:]+):(\d+)(\/.*)?$/.exec(url);
    if (!m) { reject(new Error('rawRequest needs http://host:port/path, got ' + url)); return; }
    const req = http.request({ host: m[1], port: Number(m[2]), path: m[3] || '/', method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('review server routes, statuses and boundaries', async (t) => {
  const { url, close } = await startReviewServer({ port: 0 });
  t.after(() => close());

  await t.test('public routes serve HTML; loopback server stays review-only; page robots meta follows production mode', async () => {
    /* The local server is review-only, so its X-Robots-Tag header stays
       noindex. The page bytes are the production site: normal public pages
       carry index, follow; the 404 page, thank-you page and protected card
       stay noindex. */
    const UTILITY_NOINDEX = new Set(['/404.html', '/thank-you/', '/justin/card.html']);
    for (const route of ['/', '/services/', '/work/', '/pricing/', '/contact/', '/thank-you/', '/privacy/', '/terms/', '/demos/', '/demos/request-desk/', '/demos/business-brain/', '/demos/website-manager/', '/404.html', '/justin/card.html']) {
      const r = await rawRequest(url + route);
      assert.equal(r.status, 200, route);
      assert.match(r.headers['content-type'], /text\/html/, route);
      assert.equal(r.headers['cache-control'], 'no-store', route);
      assert.equal(r.headers['x-robots-tag'], 'noindex, nofollow', route);
      const meta = /<meta name="robots" content="([^"]+)"/.exec(r.body);
      assert.ok(meta, route + ' has a robots meta');
      if (UTILITY_NOINDEX.has(route)) { assert.match(meta[1], /noindex/, route); } else { assert.equal(meta[1], 'index, follow', route); }
    }
  });

  await t.test('missing trailing slash redirects, vercel redirects mirrored', async () => {
    const cases = [['/services', '/services/'], ['/pricing', '/pricing/'], ['/about', '/#about'], ['/about/', '/#about'], ['/justin', '/justin/card.html'], ['/justin/', '/justin/card.html']];
    for (const [from, to] of cases) {
      const r = await rawRequest(url + from);
      assert.equal(r.status, 308, from);
      assert.equal(r.headers.location, to, from);
    }
  });

  await t.test('unknown routes return the custom 404 page with a 404 status', async () => {
    for (const route of ['/nope', '/services/nope/', '/demos/old-demo/', '/index.htm', '/about-us']) {
      const r = await rawRequest(url + route);
      assert.equal(r.status, 404, route);
      assert.match(r.body, /That page is not here\./, route);
      assert.match(r.body, /href="\/contact\/"/, route);
    }
  });

  await t.test('internal, hidden and source files are unreachable', async () => {
    for (const route of ['/.git/config', '/.git/HEAD', '/.build-inputs/BRIEF.md', '/.build-inputs/pricing-model.json', '/.vercelignore', '/vercel.json', '/README.md', '/BUILD-REPORT.md', '/DESIGN.md', '/LAUNCH-CHECKLIST.md', '/tests/test_site.py', '/tools/serve.mjs', '/tools/public-allowlist.mjs', '/creative/request-demo/composition.html', '/creative/brand/og-image.html', '/docs/', '/docs/FABLE-5.1-REBUILD-PLAN.md', '/qa/', '/dist/', '/assets/home.js', '/assets/', '/assets/media/manifest.json', '/%2e%2e/index.html', '/..%2f.git/config']) {
      const r = await rawRequest(url + route);
      assert.equal(r.status, 404, route);
    }
  });

  await t.test('assets have correct content types and no caching', async () => {
    const css = await rawRequest(url + '/assets/site.css');
    assert.equal(css.status, 200);
    assert.match(css.headers['content-type'], /text\/css/);
    const js = await rawRequest(url + '/assets/contact.js');
    assert.match(js.headers['content-type'], /javascript/);
    const png = await rawRequest(url + '/favicon.png');
    assert.equal(png.headers['content-type'], 'image/png');
    assert.equal(png.headers['x-content-type-options'], 'nosniff');
    const webp = await rawRequest(url + '/justin-founder.webp');
    assert.equal(webp.headers['content-type'], 'image/webp');
    const robots = await rawRequest(url + '/robots.txt');
    assert.equal(robots.body, 'User-agent: *\nAllow: /\n\nSitemap: https://www.clearpathwv.com/sitemap.xml\n', 'exact production robots.txt');
    const sitemap = await rawRequest(url + '/sitemap.xml');
    assert.match(sitemap.headers['content-type'], /xml/);
  });

  await t.test('range requests work for media scrubbing', async () => {
    const r = await rawRequest(url + '/favicon.png', { headers: { Range: 'bytes=0-9' } });
    assert.equal(r.status, 206);
    assert.match(r.headers['content-range'], /^bytes 0-9\//);
    assert.equal(r.headers['content-length'], '10');
  });

  await t.test('HEAD works and nothing is accepted', async () => {
    const head = await rawRequest(url + '/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(head.body, '');
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const r = await rawRequest(url + '/contact/', { method });
      assert.equal(r.status, 405, method);
    }
  });

  await t.test('pending media is honestly 404 until rendered, 200 afterwards', async () => {
    for (const route of ['/assets/media/request-demo.mp4', '/assets/media/request-demo.webm', '/assets/media/request-demo-poster.jpg']) {
      const r = await rawRequest(url + route, { method: 'HEAD' });
      assert.ok([200, 404].includes(r.status), route + ' ' + r.status);
      if (r.status === 200) {
        assert.match(r.headers['content-type'], /^(video\/|image\/)/, route);
      }
    }
  });
});

test('allowlist resolver rejects traversal and hidden paths', () => {
  assert.equal(resolveRequest('/').kind, 'file');
  assert.equal(resolveRequest('/').file, 'index.html');
  assert.equal(resolveRequest('/contact/?topic=website').file, 'contact/index.html');
  assert.equal(resolveRequest('/pricing/#routes').file, 'pricing/index.html');
  assert.equal(resolveRequest('/../index.html').kind, 'notfound');
  assert.equal(resolveRequest('/.git/config').kind, 'notfound');
  assert.equal(resolveRequest('/assets/../index.html').kind, 'notfound');
  assert.equal(resolveRequest('/index.html\\..\\x').kind, 'notfound');
  assert.equal(resolveRequest('/services').kind, 'redirect');
  assert.equal(resolveRequest('/justin').location, '/justin/card.html');
  assert.equal(resolveRequest('/tools/serve.mjs').kind, 'notfound');
  assert.equal(resolveRequest('/DESIGN.md').kind, 'notfound');
});
