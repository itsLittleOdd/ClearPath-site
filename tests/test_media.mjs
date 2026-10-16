/* Media composition, renderer and release-bundle contract tests.
   Run: node --test tests/
   Rendered binaries are checked only when they exist; otherwise the test
   reports them as pending rather than pretending they were produced. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_FILES, PUBLIC_MEDIA, PINNED_FILES } from '../tools/public-allowlist.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const composition = read('creative/request-demo/composition.html');

test('composition is a deterministic 15 to 25 second silent story with the required beats', () => {
  const duration = Number(/var DURATION = ([\d.]+);/.exec(composition)[1]);
  const fps = Number(/var FPS = (\d+);/.exec(composition)[1]);
  const poster = Number(/var POSTER_TIME = ([\d.]+);/.exec(composition)[1]);
  assert.ok(duration >= 15 && duration <= 25, 'duration ' + duration);
  assert.equal(fps, 24);
  assert.ok(poster > 0 && poster < duration);
  for (const needle of [
    'Fictional demonstration. Not connected to a live client system.',
    'Lunch for 30 people?',
    'Delivery address needed',
    'What address should we deliver to?',
    '>Edit<', '>Approve<',
    'Approved draft. Ready for the next step.',
    'Nothing was sent by this demonstration.',
    'A clearer next step. You stay in charge.',
    'window.__seek', 'window.__composition', 'textEquivalent'
  ]) {
    assert.ok(composition.includes(needle), needle);
  }
  for (const forbidden of ['http://', 'https://', 'Math.random', 'Date.now', 'setTimeout', 'setInterval', 'animation:', 'transition:', '<audio', 'autoplay', 'Sent.', 'Email sent', 'Message sent']) {
    const stageOnly = composition.replace(/transition:none/g, '');
    assert.ok(!stageOnly.includes(forbidden), forbidden);
  }
  const beats = /var BEATS = \[([^\]]+)\]/.exec(composition)[1].split(',').map(Number);
  assert.equal(beats.length, 5);
  for (let i = 1; i < beats.length; i += 1) { assert.ok(beats[i] > beats[i - 1]); }
  assert.ok(beats[beats.length - 1] < duration);
});

test('composition references only the approved logo raster, by local relative path', () => {
  const srcs = [...composition.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(srcs, ['../../clearpath-logo.png']);
  assert.ok(fs.existsSync(path.join(ROOT, 'clearpath-logo.png')));
  assert.ok(fs.existsSync(path.join(ROOT, 'creative/request-demo/STORYBOARD.md')));
});

test('page transcripts match the composition text equivalent beat for beat', () => {
  const block = /textEquivalent: \[([\s\S]*?)\]/.exec(composition)[1];
  const lines = [...block.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.equal(lines.length, 5);
  for (const page of ['index.html', 'work/index.html']) {
    const html = read(page);
    const transcript = html.slice(html.indexOf('<details class="transcript">'), html.indexOf('</details>', html.indexOf('<details class="transcript">')));
    for (const key of ['Request arrives', 'Missing detail', 'Draft', 'Owner reviews', 'End state', 'Approved draft. Ready for the next step.', 'Nothing was sent']) {
      assert.ok(transcript.includes(key), page + ': ' + key);
    }
  }
});

test('renderer and brand renderer use only built-ins and existing binaries', () => {
  for (const file of ['tools/render-video.mjs', 'tools/render-brand.mjs', 'tools/lib/chrome.mjs', 'tools/serve.mjs', 'tools/build-release.mjs']) {
    const src = read(file);
    const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    for (const imp of imports) {
      assert.ok(imp.startsWith('node:') || imp.startsWith('./') || imp.startsWith('../'), file + ' imports ' + imp);
    }
    for (const forbidden of ['puppeteer', 'playwright', 'npm install', 'npx ', 'require(']) {
      assert.ok(!src.includes(forbidden), file + ' ' + forbidden);
    }
  }
  const chrome = read('tools/lib/chrome.mjs');
  assert.ok(chrome.includes('--user-data-dir='), 'isolated profile');
  assert.ok(chrome.includes('--remote-debugging-address=127.0.0.1'));
  assert.ok(!/pkill|killall|process\.kill\(/.test(chrome), 'kills only its own child');
  const render = read('tools/render-video.mjs');
  assert.ok(render.includes('libx264') && render.includes('libvpx-vp9') && render.includes('faststart'));
  assert.ok(render.includes('duration >= 15 && duration <= 25'));
});

test('release allowlist excludes every internal path and includes every public page', () => {
  for (const must of ['index.html', '404.html', 'robots.txt', 'sitemap.xml', 'assets/site.css', 'assets/site.js', 'assets/contact.js', 'justin/card.html', 'justin/justin-whalen.vcf', 'og-image.png', 'favicon.png']) {
    assert.ok(PUBLIC_FILES.has(must), must);
  }
  for (const f of PUBLIC_FILES) {
    assert.ok(!/^(\.|tests\/|tools\/|creative\/|docs\/|qa\/|dist\/)/.test(f), f);
    assert.ok(!f.endsWith('.md'), f);
    assert.notEqual(f, 'assets/home.js');
  }
  assert.deepEqual([...PINNED_FILES].sort(), ['.vercelignore', 'justin/card.html', 'justin/justin-portrait.webp', 'justin/justin-whalen.vcf', 'vercel.json']);
  for (const f of PUBLIC_FILES) {
    if (!PUBLIC_MEDIA.includes(f)) { assert.ok(fs.existsSync(path.join(ROOT, f)), 'missing public file ' + f); }
  }
});

test('rendered media, when present, is lightweight and matches the manifest', (t) => {
  const manifestPath = path.join(ROOT, 'assets/media/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    t.diagnostic('media pending: assets/media/manifest.json not present; run node tools/render-video.mjs');
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.ok(manifest.durationSeconds >= 15 && manifest.durationSeconds <= 25);
  assert.equal(manifest.externalRequests, 0);
  assert.ok(manifest.outputs.mp4, 'mp4 listed');
  const mp4 = path.join(ROOT, manifest.outputs.mp4.file);
  assert.ok(fs.existsSync(mp4));
  assert.equal(fs.statSync(mp4).size, manifest.outputs.mp4.bytes);
  assert.ok(manifest.outputs.mp4.bytes < 3 * 1024 * 1024, 'mp4 under 3 MiB: ' + manifest.outputs.mp4.bytes);
  const probed = manifest.outputs.mp4.probe && manifest.outputs.mp4.probe.format && Number(manifest.outputs.mp4.probe.format.duration);
  if (probed) { assert.ok(Math.abs(probed - manifest.durationSeconds) < 0.3, 'probed duration ' + probed); }
  if (manifest.outputs.poster) {
    assert.ok(manifest.outputs.poster.bytes < 200 * 1024, 'poster under 200 KiB');
  }
  if (manifest.outputs.webm) {
    assert.ok(manifest.outputs.webm.bytes < 3 * 1024 * 1024, 'webm under 3 MiB');
  }
});
