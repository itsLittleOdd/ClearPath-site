/* Static contract for the mobile player repair (2026-10-16, revision 2).
   Run: node --test tests/test_video_player.mjs
   The browser proof is tests/video-player-check.mjs; this file pins the
   markup, script and style contract so a regression is caught before a
   browser is launched. It fails on the old overlay markup, on a visible
   script-less control, on the long wrapping label, and on pause logic that
   could swallow a retry. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const PAGES = ['index.html', 'work/index.html'];

function figureOf(html) {
  const start = html.indexOf('<figure class="video-figure');
  const end = html.indexOf('</figure>', start);
  assert.ok(start > 0 && end > start, 'video figure present');
  return html.slice(start, end);
}

test('the picture holds only the video; no HTML still or overlay remains on either page', () => {
  for (const p of PAGES) {
    const fig = figureOf(read(p));
    for (const old of ['video-still', 'still-play', 'still-msg', 'still-facts', 'still-bar']) { assert.ok(!fig.includes(old), p + ' still contains ' + old); }
    const frameStart = fig.indexOf('<div class="video-frame">');
    const videoEnd = fig.indexOf('</video>', frameStart) + '</video>'.length;
    const frameEnd = fig.indexOf('</div>', videoEnd);
    const frame = fig.slice(frameStart, frameEnd);
    assert.equal((frame.match(/<video/g) || []).length, 1, p + ' one video in the frame');
    assert.ok(!/<(button|p|div|span|ul)\b/.test(frame.slice(frame.indexOf('<video'))), p + ' nothing but the video inside the frame');
    assert.ok(fig.slice(videoEnd).trim().startsWith('</div>'), p + ' frame closes right after the video');
  }
});

test('the control row ships hidden with a short label and state-aware accessible name', () => {
  for (const p of PAGES) {
    const fig = figureOf(read(p));
    const after = fig.slice(fig.indexOf('</div>', fig.indexOf('</video>')));
    assert.match(after, /<div class="video-controls" hidden>\s*<button type="button" class="btn" data-role="play" aria-label="Play the 20-second silent demonstration video" aria-describedby="video-state">Play video<\/button>/, p);
    assert.match(after, /<p class="video-state" id="video-state" data-role="video-state" aria-live="polite">20 seconds, silent, made-up data\.<\/p>/, p);
    assert.match(after, /<p class="video-status" data-role="video-status" role="status" hidden><\/p>/, p);
    assert.equal((fig.match(/data-role="play"/g) || []).length, 1, p + ' exactly one play control');
    assert.ok(!fig.includes('Play the 20-second demonstration</button>'), p + ' long wrapping label removed');
    assert.ok(after.includes('<figcaption class="video-caption" id="video-caption"><strong>Fictional demonstration. Not connected to a live client system.</strong> The final state is an approved draft, not a sent email.'), p);
    assert.equal((fig.match(/<li>/g) || []).length, 5, p + ' five transcript steps');
    assert.ok(!fig.includes('Press play to watch') && !fig.includes('Nothing is sent.</p>'), p + ' repetitive hints removed');
  }
});

test('lazy, silent, native-controls video contract is unchanged in HTML (script-less fallback)', () => {
  for (const p of PAGES) {
    const video = /<video[^>]*>/.exec(read(p))[0];
    for (const attr of ['controls', 'preload="none"', 'muted', 'playsinline', 'poster="/assets/media/request-demo-poster.jpg"', 'width="1280"', 'height="720"']) { assert.ok(video.includes(attr), p + ' ' + attr); }
    assert.ok(!video.includes('autoplay'), p);
    assert.ok(read(p).includes('<source src="/assets/media/request-demo.webm" type="video/webm">'));
    assert.ok(read(p).includes('<source src="/assets/media/request-demo.mp4" type="video/mp4">'));
  }
});

test('site.js: state model, idle-only native-control suppression, same-document retry, stale-promise guard', () => {
  const js = read('assets/site.js');
  assert.ok(!js.includes('.video-still'), 'overlay logic removed');
  assert.match(js, /data-video-state/);
  for (const needle of ["initial: 'Play video'", "playing: 'Pause'", "paused: 'Play'", "ended: 'Play again'", "unavailable: 'Try again'", "loading: 'Loading'"]) { assert.ok(js.includes(needle), needle); }
  assert.match(js, /button\.setAttribute\('aria-label', ARIA\[name\]\)/);
  /* label-in-name: every accessible name starts with its exact visible label */
  const labels = Object.fromEntries([...js.matchAll(/(initial|loading|playing|paused|ended|unavailable): '([^']+)'/g)].slice(0, 6).map((m) => [m[1], m[2]]));
  const ariaBlock = js.slice(js.indexOf('var ARIA = {'), js.indexOf('};', js.indexOf('var ARIA = {')));
  const names = Object.fromEntries([...ariaBlock.matchAll(/(initial|loading|playing|paused|ended|unavailable): '([^']+)'/g)].map((m) => [m[1], m[2]]));
  assert.deepEqual(Object.keys(names).sort(), ['ended', 'initial', 'loading', 'paused', 'playing', 'unavailable']);
  for (const state of Object.keys(names)) { assert.ok(names[state].startsWith(labels[state]), state + ': accessible name "' + names[state] + '" must start with visible label "' + labels[state] + '"'); }
  assert.match(js, /video\.controls = !\(name === 'initial' \|\| name === 'unavailable'\)/, 'native controls suppressed only for idle and unavailable posters');
  assert.match(js, /var NETWORK_NO_SOURCE = 3;/);
  assert.match(js, /unavailable \|\| !!video\.error \|\| video\.networkState === NETWORK_NO_SOURCE/, 'broken() checks error and no-source before pause');
  const click = js.slice(js.indexOf("button.addEventListener('click'"), js.indexOf("var events = ['play'"));
  assert.ok(click.indexOf('var retry = broken();') < click.indexOf('video.pause()'), 'retry decision precedes the pause branch');
  assert.match(click, /if \(!retry && !video\.paused && !video\.ended\) \{ video\.pause\(\); return; \}/);
  assert.match(click, /if \(retry\) \{ video\.load\(\); \}/, 'retry reselects media with load()');
  assert.match(click, /var token = \+\+sequence;/);
  assert.equal((click.match(/if \(token !== sequence\) \{ return; \}/g) || []).length, 2, 'stale play-promise completions are ignored on both branches');
  assert.match(click, /err\.name === 'AbortError'/);
  assert.match(js, /if \(controlsRow\) \{ controlsRow\.hidden = false; \}/, 'control row revealed only after binding');
  assert.ok(js.indexOf('controlsRow.hidden = false') > js.indexOf("video.addEventListener('error', markUnavailable)"), 'reveal happens after every handler is bound');
  assert.ok(!/button\.hidden|button\.style\.display|classList\.add\('is-hidden'\)/.test(js), 'control is never hidden during state changes');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'sendBeacon', 'innerHTML', 'location.reload']) { assert.ok(!js.includes(forbidden), forbidden); }
});

test('site.css keeps the control and status outside the picture, hides the unbound row, bounds the phone menu', () => {
  const css = read('assets/site.css');
  assert.match(css, /\.video-frame video\{display:block;width:100%;height:100%;object-fit:contain/);
  assert.match(css, /\.video-controls\{display:flex/);
  assert.match(css, /\.video-controls\[hidden\]\{display:none\}/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
  assert.match(css, /\.video-status\{position:static/);
  assert.match(css, /\.video-controls \.btn\{min-height:44px/);
  assert.match(css, /\.menu-list\{max-height:calc\(100vh - var\(--header-h\) - 12px\);max-height:calc\(100dvh - var\(--header-h\) - 12px\);overflow-y:auto;overscroll-behavior:contain/);
  assert.match(css, /\.menu-list a\{display:flex;align-items:center;min-height:44px/, 'menu tap targets unchanged');
});

test('approved media is untouched and the browser suites expect the revised contract', () => {
  const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'assets/media/request-demo.mp4'))).digest('hex');
  assert.equal(sha, 'dfd1cf79873a4b22b7d0c4ee4a78d413828922ad400673df7d62158efa4b6fa1');
  for (const f of ['assets/media/request-demo.webm', 'assets/media/request-demo-poster.jpg']) { assert.ok(fs.existsSync(path.join(ROOT, f)), f); }
  const bc = read('tests/browser-check.mjs');
  assert.ok(!bc.includes("querySelector('.video-still')"));
  assert.ok(bc.includes('idleNativeControlsHidden'));
  const vp = read('tests/video-player-check.mjs');
  for (const needle of ['__retrySentinel', 'blocked-media-retry', 'blocked-site-script', 'SHORT_LANDSCAPE', "[568, 320]", 'mouseWheel', 'expectedMediaErrors']) { assert.ok(vp.includes(needle), needle); }
});
