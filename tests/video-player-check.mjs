#!/usr/bin/env node
/* Focused mobile player and short-landscape menu proof (2026-10-16 repair,
   revision 2). Real browser geometry and media-state journeys on both
   video-bearing pages, plus the phone menu in short landscape viewports.
   Fails on the old defects (an HTML still layered over the poster; a dead
   custom control without scripts; a native loading overlay on the idle
   poster; a menu whose last link cannot be reached at 568x320), not on class
   names. No packages; in-process loopback server and the isolated Chrome
   helper. Writes qa/video-player-check.json and screenshots.
   Run: node tests/video-player-check.mjs
   Responsive-Chromium proof only; no Safari or iOS claim. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startReviewServer } from '../tools/serve.mjs';
import { launchChrome } from '../tools/lib/chrome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA = path.join(ROOT, 'qa');
fs.mkdirSync(QA, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const PAGES = ['/', '/work/'];
const VIEWPORTS = [[320, 568], [375, 667], [390, 844], [414, 896], [430, 932], [440, 900], [768, 1024], [1280, 900], [844, 390], [932, 430]];
const MEDIA = ['/assets/media/request-demo.mp4', '/assets/media/request-demo.webm', '/assets/media/request-demo-poster.jpg'];
const MENU_ROUTES = ['/', '/pricing/', '/demos/request-desk/'];
const SHORT_LANDSCAPE = [[568, 320], [667, 375], [844, 390]];

const receipt = { status: 'PASS', startedAt: new Date().toISOString(), geometry: [], journeys: [], defects: [], notes: ['Responsive Chromium proof only; Safari/iOS not tested here.'] };
function defect(where, what) { receipt.defects.push({ where, what }); console.error('DEFECT ' + where + ': ' + what); }

const GEOMETRY = `(() => {
  const f = document.querySelector('[data-video-figure]'); const frame = f.querySelector('.video-frame'); const v = f.querySelector('video'); const b = f.querySelector('[data-role="play"]');
  const r = (e) => { const x = e.getBoundingClientRect(); return { x: x.left, y: x.top, right: x.right, bottom: x.bottom, width: x.width, height: x.height }; };
  const overlap = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.x, c.x)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.y, c.y));
  const visible = (e) => { const s = getComputedStyle(e); return s.display !== 'none' && s.visibility !== 'hidden' && e.getBoundingClientRect().width > 0; };
  const fr = r(frame), vr = r(v), br = r(b);
  const intruders = [...f.querySelectorAll('*')].filter((e) => e !== frame && e !== v && !v.contains(e) && visible(e) && overlap(r(e), fr) > 1).map((e) => e.tagName + '.' + String(e.className).slice(0, 30));
  const cw = document.documentElement.clientWidth;
  return { fr, vr, br, intruders, frameChildren: [...frame.children].map((e) => e.tagName), overlays: f.querySelectorAll('.video-still, .still-play, .still-msg').length,
    controlBelowPicture: br.y >= fr.bottom - 1, controlInViewportWidth: br.x >= -1 && br.right <= cw + 1, buttonHeight: br.height, labelWraps: (() => { const h = br.height; b.style.whiteSpace = 'nowrap'; const h1 = b.getBoundingClientRect().height; b.style.whiteSpace = ''; return h > h1 + 2; })(), aspect: vr.width / vr.height,
    frameInViewportWidth: fr.x >= -1 && fr.right <= cw + 1, docScrollWidth: document.documentElement.scrollWidth, clientWidth: cw, ready: f.getAttribute('data-video-ready'), state: f.getAttribute('data-video-state'),
    label: b.textContent.trim(), ariaLabel: b.getAttribute('aria-label'), controlsRowVisible: getComputedStyle(f.querySelector('.video-controls')).display !== 'none', nativeControls: v.controls,
    stateLine: (f.querySelector('[data-role="video-state"]') || {}).textContent, poster: v.getAttribute('poster'), paused: v.paused, preload: v.preload, autoplay: v.autoplay, transcript: f.querySelectorAll('.transcript li').length, figureOpacity: getComputedStyle(f).opacity };
})()`;
const STATE = `(() => { const f = document.querySelector('[data-video-figure]'); const v = f.querySelector('video'); const s = f.querySelector('[data-role="video-status"]'); const b = f.querySelector('[data-role="play"]'); const br = b.getBoundingClientRect(); return { state: f.getAttribute('data-video-state'), label: b.textContent.trim(), ariaLabel: b.getAttribute('aria-label'), paused: v.paused, ended: v.ended, time: v.currentTime, duration: v.duration, networkState: v.networkState, nativeControls: v.controls, status: s.hidden ? '' : s.textContent, focusOnButton: document.activeElement === b, buttonVisible: br.height > 0 && getComputedStyle(b).visibility !== 'hidden', buttonEnabled: !b.disabled, sentinel: window.__retrySentinel || null, href: location.href }; })()`;

async function main() {
  const { url, close } = await startReviewServer({ port: 0 });
  const chrome = await launchChrome();
  let blockMedia = false;
  let blockSiteJs = false;
  const expectedBlocked = [];
  const blocked = await chrome.restrictNetwork((u) => {
    if (!(u.startsWith(url + '/') || u.startsWith('data:') || u === 'about:blank')) { return false; }
    if (blockMedia && MEDIA.some((m) => u === url + m)) { expectedBlocked.push(u); return false; }
    if (blockSiteJs && u === url + '/assets/site.js') { expectedBlocked.push(u); return false; }
    return true;
  });
  let journey = { name: 'boot', errors: [], requests: [], expectedMediaErrors: [] };
  chrome.on('Network.requestWillBeSent', (p) => journey.requests.push(p.request.url));
  chrome.on('Runtime.exceptionThrown', (p) => journey.errors.push('exception: ' + (p.exceptionDetails.exception && p.exceptionDetails.exception.description || p.exceptionDetails.text)));
  chrome.on('Log.entryAdded', (p) => {
    if (p.entry.level !== 'error') { return; }
    if (blockMedia && MEDIA.some((m) => p.entry.url === url + m)) { journey.expectedMediaErrors.push(p.entry.text); return; }
    journey.errors.push('log: ' + p.entry.text + ' ' + (p.entry.url || ''));
  });
  function begin(name) { journey = { name, errors: [], requests: [], expectedMediaErrors: [] }; receipt.journeys.push(journey); }
  function check() {
    const unexpectedBlocked = blocked.filter((u) => !expectedBlocked.includes(u));
    if (unexpectedBlocked.length) { defect(journey.name, 'unexpected non-loopback requests blocked: ' + unexpectedBlocked.join(', ')); blocked.length = 0; }
    const foreign = journey.requests.filter((u) => !(u.startsWith(url + '/') || u.startsWith('data:')));
    if (foreign.length) { defect(journey.name, 'non-loopback request: ' + foreign.join(', ')); }
    if (journey.errors.length) { defect(journey.name, journey.errors.join(' | ')); }
  }
  const mediaRequests = () => journey.requests.filter((u) => MEDIA.some((m) => u === url + m)).length;
  async function setViewport(w, h) { await chrome.call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 || h < 700 }); }
  async function openPlain(route, w, h) {
    await setViewport(w, h);
    const full = url + route;
    await chrome.navigate(full, { readyExpression: `location.href.startsWith(${JSON.stringify(full)})&&document.readyState==='complete'` });
  }
  async function open(route, w, h) {
    await openPlain(route, w, h);
    await chrome.evalJS(`document.querySelector('[data-video-figure]').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    const started = Date.now();
    while (Date.now() - started < 6000) {
      const ok = await chrome.evalJS(`(() => { const f = document.querySelector('[data-video-figure]'); const s = getComputedStyle(f); return f.getAttribute('data-video-ready') === '1' && s.opacity === '1' && (!document.documentElement.classList.contains('js-anim') || f.classList.contains('in')); })()`);
      if (ok) { return; }
      await sleep(100);
    }
    defect(route + ' ' + w, 'figure did not settle within 6 s');
  }
  /* Every observed control state must keep the visible label at the start of
     the accessible name (axe label-content-name-mismatch, WCAG 2.5.3). */
  function labelInName(where, s) {
    if (!s || !s.label) { return; }
    if (!(s.ariaLabel || '').startsWith(s.label)) { defect(where, 'accessible name does not start with the visible label in state ' + s.state + ': ' + JSON.stringify({ label: s.label, ariaLabel: s.ariaLabel })); }
  }
  async function waitState(pred, ms = 6000) {
    const started = Date.now();
    let s = null;
    while (Date.now() - started < ms) { s = await chrome.evalJS(STATE); if (pred(s)) { labelInName(journey.name, s); return s; } await sleep(100); }
    labelInName(journey.name, s);
    return s;
  }
  async function center(selector) {
    return chrome.evalJS(`(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`);
  }
  async function realClick(selector) {
    const c = await center(selector);
    await chrome.call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y });
    await chrome.call('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
    await chrome.call('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
  }
  async function realTap(selector) {
    const c = await center(selector);
    await chrome.call('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
    await chrome.call('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: c.x, y: c.y }] });
    await chrome.call('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await chrome.call('Emulation.setTouchEmulationEnabled', { enabled: false });
  }
  async function shot(name) { const s = await chrome.call('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(path.join(QA, name + '.png'), Buffer.from(s.data, 'base64')); }
  function judge(where, g) {
    if (g.ready !== '1') { defect(where, 'figure not wired'); }
    if (g.overlays !== 0) { defect(where, 'old overlay markup present (.video-still/.still-play/.still-msg)'); }
    if (g.intruders.length) { defect(where, 'elements layered over the picture: ' + g.intruders.join(', ')); }
    if (g.frameChildren.join() !== 'VIDEO') { defect(where, 'picture must contain only the video, got ' + g.frameChildren.join()); }
    if (!g.controlBelowPicture) { defect(where, 'custom control is not below the picture: ' + JSON.stringify({ frame: g.fr, button: g.br })); }
    if (!g.controlInViewportWidth || !g.frameInViewportWidth) { defect(where, 'picture or control leaves the viewport width'); }
    if (g.buttonHeight < 44) { defect(where, 'control shorter than 44 px: ' + g.buttonHeight); }
    if (g.labelWraps) { defect(where, 'control label wraps onto a second line'); }
    if (Math.abs(g.aspect - 16 / 9) > 0.06) { defect(where, 'picture is not 16:9: ' + g.aspect.toFixed(3)); }
    if (g.docScrollWidth > g.clientWidth) { defect(where, 'horizontal overflow ' + g.docScrollWidth + ' > ' + g.clientWidth); }
    if (g.autoplay || !g.paused || g.preload !== 'none' || g.poster !== '/assets/media/request-demo-poster.jpg') { defect(where, 'lazy/no-autoplay/poster contract broken'); }
    if (g.transcript !== 5) { defect(where, 'transcript steps ' + g.transcript); }
    if (g.state !== 'initial' || g.label !== 'Play video' || !(g.ariaLabel || '').startsWith('Play video') || !/20-second silent demonstration/.test(g.ariaLabel || '')) { defect(where, 'initial state/label/name wrong: ' + g.state + ' / ' + g.label + ' / ' + g.ariaLabel); }
    if (!g.controlsRowVisible) { defect(where, 'custom control row not revealed after binding'); }
    if (g.nativeControls !== false) { defect(where, 'idle enhanced poster still shows native controls'); }
  }

  /* ---- geometry matrix, normal and increased text size ---- */
  for (const route of PAGES) {
    for (const [w, h] of VIEWPORTS) {
      const where = (route === '/' ? 'home' : 'work') + '-' + w + 'x' + h;
      begin('geometry ' + where);
      try {
        await open(route, w, h);
        const g = await chrome.evalJS(GEOMETRY);
        receipt.geometry.push({ route, viewport: [w, h], textSize: 'normal', ...g });
        judge(where, g);
        if (route === '/' || w === 320) { await shot('player-' + where); }
        await chrome.evalJS(`document.body.style.fontSize = '21px'`);
        await sleep(150);
        const big = await chrome.evalJS(GEOMETRY);
        receipt.geometry.push({ route, viewport: [w, h], textSize: '21px', ...big });
        judge(where + '-text21', big);
        await chrome.evalJS(`document.body.style.fontSize = ''`);
      } catch (err) { defect(where, err.message); }
      check();
    }
  }

  /* ---- media-state journeys with real clicks and taps ---- */
  for (const route of PAGES) {
    for (const [w, h] of [[390, 844], [1280, 900]]) {
      const where = (route === '/' ? 'home' : 'work') + '-media-' + w;
      begin(where);
      try {
        await open(route, w, h);
        const click = w < 700 ? realTap : realClick;
        const initial = await chrome.evalJS(STATE);
        if (initial.state !== 'initial' || !initial.paused || initial.nativeControls !== false) { defect(where, 'initial ' + JSON.stringify(initial)); }
        await click('[data-video-figure] [data-role="play"]');
        const playing = await waitState((s) => s.state === 'playing' || s.state === 'unavailable');
        if (playing.state !== 'playing' || playing.label !== 'Pause' || playing.paused || playing.nativeControls !== true) { defect(where, 'did not reach playing with native controls restored: ' + JSON.stringify(playing)); }
        await shot('player-' + where + '-playing');
        await click('[data-video-figure] [data-role="play"]');
        const paused = await waitState((s) => s.state === 'paused');
        if (paused.state !== 'paused' || paused.label !== 'Play' || !paused.paused || !paused.buttonVisible || !paused.buttonEnabled || paused.nativeControls !== true) { defect(where, 'pause state wrong: ' + JSON.stringify(paused)); }
        if (w >= 700 && !paused.focusOnButton) { defect(where, 'focus left the control after pausing'); }
        await click('[data-video-figure] [data-role="play"]');
        const resumed = await waitState((s) => s.state === 'playing');
        if (resumed.state !== 'playing') { defect(where, 'did not resume: ' + JSON.stringify(resumed)); }
        await chrome.evalJS(`(() => { const v = document.querySelector('[data-video-figure] video'); v.currentTime = Math.max(0, v.duration - 0.25); })()`);
        const ended = await waitState((s) => s.state === 'ended', 8000);
        const endedLine = await chrome.evalJS(`document.querySelector('[data-role="video-state"]').textContent`);
        if (ended.state !== 'ended' || ended.label !== 'Play again' || ended.nativeControls !== true || !/Nothing was sent/.test(endedLine)) { defect(where, 'ended state wrong: ' + JSON.stringify({ ended, endedLine })); }
        await click('[data-video-figure] [data-role="play"]');
        const replay = await waitState((s) => s.state === 'playing' && s.time < 2);
        if (replay.state !== 'playing' || replay.time >= 2) { defect(where, 'replay did not restart: ' + JSON.stringify(replay)); }
        await chrome.evalJS(`document.querySelector('[data-video-figure] video').pause()`);
        await click('[data-video-figure] .transcript summary');
        await sleep(150);
        const transcript = await chrome.evalJS(`(() => { const d = document.querySelector('[data-video-figure] .transcript'); return { open: d.open, visibleItems: [...d.querySelectorAll('li')].filter((li) => li.getBoundingClientRect().height > 0).length }; })()`);
        if (!transcript.open || transcript.visibleItems !== 5) { defect(where, 'transcript ' + JSON.stringify(transcript)); }
        await chrome.evalJS(`document.querySelector('[data-video-figure] [data-role="play"]').focus()`);
        await chrome.call('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space', windowsVirtualKeyCode: 32, text: ' ' });
        await chrome.call('Input.dispatchKeyEvent', { type: 'keyUp', key: ' ', code: 'Space', windowsVirtualKeyCode: 32 });
        const viaKey = await waitState((s) => s.state === 'playing');
        if (viaKey.state !== 'playing' || !viaKey.focusOnButton) { defect(where, 'keyboard play/focus: ' + JSON.stringify(viaKey)); }
        await chrome.evalJS(`document.querySelector('[data-video-figure] video').pause()`);
        journey.result = { initial, playing, paused, ended, replay, transcript, viaKey };
      } catch (err) { defect(where, err.message); }
      check();
    }
  }

  /* ---- deliberate pause during a pending play is not an error ---- */
  begin('pending-pause');
  try {
    await open('/', 390, 844);
    await chrome.evalJS(`(() => { const b = document.querySelector('[data-video-figure] [data-role="play"]'); b.click(); b.click(); })()`);
    await sleep(1500);
    const s = await chrome.evalJS(STATE);
    journey.result = s;
    if (s.state === 'unavailable' || s.status) { defect('pending-pause', 'deliberate pause reported as a missing file: ' + JSON.stringify(s)); }
    if (!['paused', 'initial', 'playing', 'loading'].includes(s.state)) { defect('pending-pause', 'unexpected state ' + s.state); }
  } catch (err) { defect('pending-pause', err.message); }
  check();

  /* ---- blocked media: honest unavailable state, then SAME-DOCUMENT retry ---- */
  begin('blocked-media-retry');
  try {
    blockMedia = true;
    await open('/work/', 390, 844);
    await chrome.evalJS(`window.__retrySentinel = 'kept-' + Date.now()`);
    const sentinel = await chrome.evalJS('window.__retrySentinel');
    await realTap('[data-video-figure] [data-role="play"]');
    const un = await waitState((s) => s.state === 'unavailable' || s.state === 'playing', 8000);
    if (un.state !== 'unavailable' || !/not available/.test(un.status) || !un.buttonVisible || !un.buttonEnabled || un.label !== 'Try again' || un.nativeControls !== false) { defect('blocked-media-retry', 'no honest unavailable state: ' + JSON.stringify(un)); }
    if (!expectedBlocked.length) { defect('blocked-media-retry', 'media request was never attempted/blocked'); }
    const statusOutside = await chrome.evalJS(`(() => { const f = document.querySelector('[data-video-figure]'); const s = f.querySelector('[data-role="video-status"]'); const fr = f.querySelector('.video-frame').getBoundingClientRect(); const sr = s.getBoundingClientRect(); return sr.top >= fr.bottom - 1; })()`);
    if (!statusOutside) { defect('blocked-media-retry', 'status message rendered inside the picture'); }
    await shot('player-work-390-unavailable');
    /* unblock, then retry on the very same document: new media requests must be issued and playback must start */
    blockMedia = false;
    const requestsBefore = mediaRequests();
    await realTap('[data-video-figure] [data-role="play"]');
    const back = await waitState((s) => s.state === 'playing' || (s.state === 'unavailable' && s.status), 8000);
    const requestsAfter = mediaRequests();
    journey.result = { un, sentinel, back, mediaRequestsBefore: requestsBefore, mediaRequestsAfter: requestsAfter, expectedBlocked: expectedBlocked.length, expectedMediaErrors: journey.expectedMediaErrors.length };
    if (back.sentinel !== sentinel || !back.href.endsWith('/work/')) { defect('blocked-media-retry', 'document was replaced during retry (sentinel lost)'); }
    if (requestsAfter <= requestsBefore) { defect('blocked-media-retry', 'retry issued no new media request'); }
    if (back.state !== 'playing' || !back.nativeControls || back.status) { defect('blocked-media-retry', 'same-document retry did not recover: ' + JSON.stringify(back)); }
    await chrome.evalJS(`document.querySelector('[data-video-figure] video').pause()`);
  } catch (err) { defect('blocked-media-retry', err.message); blockMedia = false; }
  check();

  /* ---- reduced motion ---- */
  begin('reduced-motion');
  try {
    await chrome.call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await open('/', 390, 844);
    const g = await chrome.evalJS(GEOMETRY);
    judge('reduced-motion', g);
    if (g.figureOpacity !== '1') { defect('reduced-motion', 'figure hidden under reduced motion'); }
    await chrome.call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  } catch (err) { defect('reduced-motion', err.message); }
  check();

  /* ---- scripts disabled or blocked: no dead custom control; native controls and transcript remain ---- */
  const NOJS = `(() => { const f = document.querySelector('[data-video-figure]'); const v = f.querySelector('video'); const row = f.querySelector('.video-controls'); return { nativeControls: v.controls, controlsAttr: v.hasAttribute('controls'), rowHidden: row.hidden && getComputedStyle(row).display === 'none', opacity: getComputedStyle(f).opacity, overlays: f.querySelectorAll('.video-still').length, transcript: f.querySelectorAll('.transcript li').length, ready: f.getAttribute('data-video-ready') }; })()`;
  begin('no-script');
  try {
    await chrome.call('Emulation.setScriptExecutionDisabled', { value: true });
    await openPlain('/', 390, 844);
    const ns = await chrome.evalJS(NOJS);
    journey.result = ns;
    if (!ns.nativeControls || !ns.controlsAttr || !ns.rowHidden || ns.opacity !== '1' || ns.overlays !== 0 || ns.transcript !== 5 || ns.ready) { defect('no-script', JSON.stringify(ns)); }
    await chrome.evalJS(`document.querySelector('[data-video-figure]').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    await shot('player-home-390-noscript');
    await chrome.call('Emulation.setScriptExecutionDisabled', { value: false });
  } catch (err) { defect('no-script', err.message); await chrome.call('Emulation.setScriptExecutionDisabled', { value: false }).catch(() => {}); }
  check();

  begin('blocked-site-script');
  try {
    /* Block only /assets/site.js (an expected, ledgered block) so the page
       runs with its enhancement script missing: no dead custom control. */
    const siteJs = url + '/assets/site.js';
    blockSiteJs = true;
    await openPlain('/work/', 390, 844);
    const bs = await chrome.evalJS(NOJS);
    blockSiteJs = false;
    journey.result = { ...bs, siteJsBlocked: expectedBlocked.includes(siteJs) };
    if (!bs.nativeControls || !bs.rowHidden || bs.transcript !== 5 || bs.ready) { defect('blocked-site-script', JSON.stringify(bs)); }
    if (!expectedBlocked.includes(siteJs)) { defect('blocked-site-script', 'site.js was not actually blocked'); }
    journey.errors = journey.errors.filter((e) => !e.includes('/assets/site.js'));
  } catch (err) { blockSiteJs = false; defect('blocked-site-script', err.message); }
  check();

  /* ---- phone menu in short landscape viewports: last link reachable by internal scroll ---- */
  for (const route of MENU_ROUTES) {
    for (const [w, h] of SHORT_LANDSCAPE) {
      const where = 'menu-' + route.replace(/[^a-z]+/gi, '-').replace(/^-|-$/g, '') + '-' + w + 'x' + h;
      begin(where);
      try {
        await openPlain(route, w, h);
        /* Above the 680 px breakpoint the dropdown is display:none by design
           and the desktop link row is the active surface; assert that surface
           instead of forcing a hidden dropdown open. */
        const dropdownShown = await chrome.evalJS(`getComputedStyle(document.querySelector('details.menu')).display !== 'none'`);
        if (!dropdownShown) {
          const nav = await chrome.evalJS(`(() => { const links = [...document.querySelectorAll('.nav-links a')]; const list = document.querySelector('.menu-list'); const lr = list.getBoundingClientRect(); return { count: links.length, visible: links.every((a) => { const r = a.getBoundingClientRect(); const s = getComputedStyle(a); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= document.documentElement.clientWidth; }), minHeight: Math.min(...links.map((a) => a.getBoundingClientRect().height)), dropdownRect: { w: lr.width, h: lr.height }, summaryHidden: getComputedStyle(document.querySelector('details.menu > summary')).display === 'none' || getComputedStyle(document.querySelector('details.menu')).display === 'none', href: location.href }; })()`);
          journey.result = { surface: 'desktop-nav', nav };
          if (nav.count < 4 || !nav.visible) { defect(where, 'desktop navigation links not visible within the viewport: ' + JSON.stringify(nav)); }
          if (nav.minHeight < 44) { defect(where, 'desktop navigation link target below 44 px: ' + nav.minHeight); }
          if (nav.dropdownRect.w !== 0 || nav.dropdownRect.h !== 0 || !nav.summaryHidden) { defect(where, 'phone dropdown should be hidden at this width: ' + JSON.stringify(nav)); }
          if (!nav.href.startsWith(url)) { defect(where, 'navigation happened while testing the desktop nav'); }
          check();
          continue;
        }
        await chrome.evalJS(`document.querySelector('details.menu > summary').click()`);
        await sleep(150);
        const MENU = `(() => { const list = document.querySelector('details.menu .menu-list'); const links = [...list.querySelectorAll('a')]; const last = links[links.length - 1]; const lr = list.getBoundingClientRect(); const ar = last.getBoundingClientRect(); return { open: document.querySelector('details.menu').open, listTop: lr.top, listBottom: lr.bottom, vh: innerHeight, scrollHeight: list.scrollHeight, clientHeight: list.clientHeight, scrollTop: list.scrollTop, overflowY: getComputedStyle(list).overflowY, lastTop: ar.top, lastBottom: ar.bottom, lastHeight: ar.height, lastHref: last.getAttribute('href'), minLinkHeight: Math.min(...links.map((a) => a.getBoundingClientRect().height)), bodyScrollY: scrollY, href: location.href }; })()`;
        const before = await chrome.evalJS(MENU);
        const c = await center('details.menu .menu-list');
        await chrome.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: c.x, y: c.y, deltaX: 0, deltaY: 600 });
        await sleep(300);
        const after = await chrome.evalJS(MENU);
        journey.result = { before, after };
        if (!before.open) { defect(where, 'menu did not open'); }
        if (before.listBottom > before.vh + 1) { defect(where, 'menu list extends below the viewport: ' + JSON.stringify(before)); }
        if (before.minLinkHeight < 44 || after.minLinkHeight < 44) { defect(where, 'menu tap targets shrank below 44 px'); }
        const needsScroll = before.scrollHeight > before.clientHeight + 1;
        if (needsScroll && (before.overflowY !== 'auto' && before.overflowY !== 'scroll')) { defect(where, 'menu list is not internally scrollable: ' + before.overflowY); }
        if (needsScroll && after.scrollTop <= 0) { defect(where, 'wheel input did not scroll the menu internally: ' + JSON.stringify(after)); }
        if (after.lastBottom > after.vh + 1 || after.lastTop < 0) { defect(where, 'last menu link not reachable after internal scroll: ' + JSON.stringify(after)); }
        if (after.href !== before.href || !after.href.startsWith(url)) { defect(where, 'navigation happened while testing the menu'); }
        if (needsScroll && after.bodyScrollY !== before.bodyScrollY) { defect(where, 'menu scroll chained into the page'); }
        if (route === '/' && w === 568) { await shot('menu-home-568x320-scrolled'); }
        await chrome.evalJS(`document.querySelector('details.menu').open = false`);
      } catch (err) { defect(where, err.message); }
      check();
    }
  }
  /* portrait control: the menu fits without internal scrolling and stays within the viewport */
  begin('menu-portrait-390');
  try {
    await openPlain('/', 390, 844);
    await chrome.evalJS(`document.querySelector('details.menu > summary').click()`);
    await sleep(150);
    const p = await chrome.evalJS(`(() => { const list = document.querySelector('details.menu .menu-list'); const lr = list.getBoundingClientRect(); return { fits: list.scrollHeight <= list.clientHeight + 1, bottom: lr.bottom, vh: innerHeight }; })()`);
    journey.result = p;
    if (!p.fits || p.bottom > p.vh + 1) { defect('menu-portrait-390', JSON.stringify(p)); }
  } catch (err) { defect('menu-portrait-390', err.message); }
  check();

  await chrome.close();
  await close();
  receipt.status = receipt.defects.length ? 'FAIL' : 'PASS';
  receipt.finishedAt = new Date().toISOString();
  receipt.expectedBlockedMediaRequests = expectedBlocked.length;
  fs.writeFileSync(path.join(QA, 'video-player-check.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ status: receipt.status, defects: receipt.defects.length, geometrySamples: receipt.geometry.length, journeys: receipt.journeys.length, receipt: 'qa/video-player-check.json' }));
  process.exit(receipt.defects.length ? 1 : 0);
}

main().catch((err) => { console.error('VIDEO PLAYER CHECK CRASHED: ' + err.stack); process.exit(1); });
