#!/usr/bin/env node
/* Self-contained browser proof for the review build (corrected 2026-10-16).
   Starts the loopback server in-process, drives an isolated headless Chrome
   over CDP, blocks every non-loopback request before dispatch, keeps a
   per-journey network/console ledger, waits for entrance motion and scroll
   targets within finite deadlines, and writes qa/browser-check.json plus
   screenshots under qa/. Exit code 1 on any defect. No packages.

   Run: node tests/browser-check.mjs            (full)
        node tests/browser-check.mjs --quick    (1280 only, no demos)

   Coverage: all 14 routes at 1280 / 390 / 320 (geometry against clientWidth,
   effective CTA visibility, settled screenshots, true full-page captures),
   404 status, skip link, focus visibility, phone menu, reduced motion,
   video figure, parked sticky bar (inert, Tab/Shift+Tab geometry, focus-owned
   case), contact flow at 1280 and 390 (errors, draft, mailto href, result,
   native Enter, no storage, no URL leak, no post-input request with contact
   data), JavaScript-disabled fallbacks and no-navigation Enter, keyboard
   selection and focus handoff in Request Desk, typed markup inert in
   Business Brain and Website Manager, Website Manager approval/publish/reset
   transitions, target sizes, and the logo raster corner color. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startReviewServer } from '../tools/serve.mjs';
import { launchChrome } from '../tools/lib/chrome.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QA = path.join(ROOT, 'qa');
fs.mkdirSync(QA, { recursive: true });
const QUICK = process.argv.includes('--quick');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PAGES = ['/', '/services/', '/work/', '/pricing/', '/contact/', '/thank-you/', '/privacy/', '/terms/', '/demos/', '/demos/request-desk/', '/demos/business-brain/', '/demos/website-manager/', '/404.html', '/justin/card.html'];
const VIEWPORTS = QUICK ? [[1280, 900]] : [[1280, 900], [390, 844], [320, 568]];
const CONTACT_MARKERS = ['dana', 'winter', 'example.com'];

const receipt = { status: 'PASS', startedAt: new Date().toISOString(), pages: [], journeys: [], defects: [], notes: [] };
function defect(where, what) { receipt.defects.push({ where, what }); console.error('DEFECT ' + where + ': ' + what); }
function note(what) { receipt.notes.push(what); console.log('note: ' + what); }

/* ---- page-side predicates (strings evaluated in the page) ---- */
/* Readiness: entrances finished for the elements the product itself would
   have triggered. The site's reveal observer fires at 12% intersection with a
   30 px bottom margin, so a reveal that is barely entering the viewport is
   legitimately still hidden; only sufficiently exposed reveals (15% or more
   inside the observer's root) or already-triggered ones must be at opacity 1.
   The protected legacy card uses CSS-only .reveal classes and never gets the
   site's "in" class; without the site's js-anim hook only opacity is read. */
const SETTLED = `(() => {
  if (document.readyState !== 'complete') return false;
  const vh = innerHeight;
  const imgs = [...document.images].filter(i => i.loading !== 'lazy' || i.getBoundingClientRect().top < vh);
  if (!imgs.every(i => i.complete)) return false;
  const rises = [...document.querySelectorAll('.rise')].filter(e => getComputedStyle(e).display !== 'none');
  if (!rises.every(e => getComputedStyle(e).opacity === '1')) return false;
  const siteAnim = document.documentElement.classList.contains('js-anim');
  const rootBottom = vh - 30;
  for (const e of document.querySelectorAll('.reveal')) {
    const s = getComputedStyle(e);
    if (s.display === 'none') continue;
    if (!siteAnim) { if (s.opacity !== '1') return false; continue; }
    const r = e.getBoundingClientRect();
    const exposed = Math.max(0, Math.min(r.bottom, rootBottom) - Math.max(r.top, 0));
    const ratio = r.height > 0 ? exposed / r.height : 1;
    const triggered = e.classList.contains('in');
    if (triggered && s.opacity !== '1') return false;
    if (!triggered && ratio >= 0.15) return false;
  }
  return true;
})()`;
const ALL_REVEALED = `(() => { if (!document.documentElement.classList.contains('js-anim')) return true; return [...document.querySelectorAll('.reveal')].every(e => getComputedStyle(e).display === 'none' || (e.classList.contains('in') && getComputedStyle(e).opacity === '1')); })()`;

const GEOMETRY = `(() => {
  const cw = document.documentElement.clientWidth;
  const effectiveVisible = (el) => { let n = el; while (n && n.nodeType === 1) { const s = getComputedStyle(n); if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.99) return false; n = n.parentElement; } return true; };
  const overflow = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && (r.left < -1 || r.right > cw + 1) && !e.closest('.logo-crop');
  }).map(e => ({ tag: e.tagName, cls: String(e.className).slice(0, 60), right: Math.round(e.getBoundingClientRect().right), text: (e.textContent || '').trim().slice(0, 40) }));
  const cta = document.querySelector('main a.btn, main button.btn, main input');
  let ctaAboveFold = null;
  if (cta) { const r = cta.getBoundingClientRect(); ctaAboveFold = r.top >= 0 && r.bottom <= innerHeight && effectiveVisible(cta); }
  return { clientWidth: cw, docScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, overflow, h1: document.querySelectorAll('h1').length, title: document.title, ctaAboveFold };
})()`;

async function main() {
  const { url, close } = await startReviewServer({ port: 0 });
  const chrome = await launchChrome();

  /* ---- ledgers ---- */
  const pendingMedia = ['/assets/media/request-demo.mp4', '/assets/media/request-demo.webm', '/assets/media/request-demo-poster.jpg'].filter((m) => !fs.existsSync(path.join(ROOT, m)));
  const toleratedMissing = new Set(pendingMedia.map((m) => url + m));
  if (pendingMedia.length) { note('media pending; exact tolerated 404 URLs: ' + [...toleratedMissing].join(', ')); }
  let journey = { name: 'boot', requests: [], responses: [], errors: [], blocked: [] };
  const blockedAll = await chrome.restrictNetwork((u) => u.startsWith(url + '/') || u === url || u.startsWith('data:') || u === 'about:blank');
  let blockedSeen = 0;
  chrome.on('Network.requestWillBeSent', (p) => journey.requests.push({ url: p.request.url, method: p.request.method, postData: p.request.postData || '' }));
  chrome.on('Network.responseReceived', (p) => journey.responses.push({ url: p.response.url, status: p.response.status }));
  chrome.on('Runtime.exceptionThrown', (p) => journey.errors.push('exception: ' + (p.exceptionDetails.exception && p.exceptionDetails.exception.description || p.exceptionDetails.text)));
  chrome.on('Runtime.consoleAPICalled', (p) => { if (p.type === 'error' || p.type === 'warning') { journey.errors.push(p.type + ': ' + p.args.map((a) => a.value || a.description).join(' ')); } });
  chrome.on('Log.entryAdded', (p) => {
    if (p.entry.level !== 'error') { return; }
    if (p.entry.url && toleratedMissing.has(p.entry.url) && /404/.test(p.entry.text)) { return; }
    journey.errors.push('log: ' + p.entry.text + ' ' + (p.entry.url || ''));
  });

  function beginJourney(name) {
    journey = { name, requests: [], responses: [], errors: [], blocked: [] };
    receipt.journeys.push(journey);
    return journey;
  }
  function checkJourney(extra = {}) {
    const j = journey;
    const newBlocked = blockedAll.slice(blockedSeen);
    blockedSeen = blockedAll.length;
    j.blocked = newBlocked;
    if (newBlocked.length) { defect(j.name, 'non-loopback requests blocked before dispatch: ' + newBlocked.join(', ')); }
    const foreign = j.requests.filter((r) => !(r.url.startsWith(url + '/') || r.url === url || r.url.startsWith('data:')));
    if (foreign.length) { defect(j.name, 'non-loopback request observed: ' + foreign.map((r) => r.url).join(', ')); }
    const badResponses = j.responses.filter((r) => r.status >= 400 && !(r.status === 404 && toleratedMissing.has(r.url)));
    if (badResponses.length) { defect(j.name, 'error responses: ' + badResponses.map((r) => r.status + ' ' + r.url).join(', ')); }
    if (j.errors.length) { defect(j.name, 'console/runtime: ' + j.errors.join(' | ')); }
    if (extra.noRequestsAfter !== undefined) {
      /* After the visitor has typed, the only acceptable traffic is a plain
         GET for a static asset (for example a lazy image scrolling into view).
         Anything with a query string, a body or a non-GET method is a leak. */
      const after = j.requests.slice(extra.noRequestsAfter).filter((r) => r.method !== 'GET' || r.postData || r.url.includes('?'));
      if (after.length) { defect(j.name, 'requests after input: ' + after.map((r) => r.method + ' ' + r.url).join(', ')); }
    }
    const leaking = j.requests.filter((r) => CONTACT_MARKERS.some((m) => decodeURIComponent(r.url + ' ' + r.postData).toLowerCase().includes(m)));
    if (leaking.length) { defect(j.name, 'request carrying contact data (loopback included): ' + leaking.map((r) => r.url).join(', ')); }
    return j;
  }

  async function setViewport(w, h) {
    await chrome.call('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
  }
  async function settle(label, deadlineMs = 6000) {
    const started = Date.now();
    while (Date.now() - started < deadlineMs) {
      if (await chrome.evalJS(SETTLED)) { return Date.now() - started; }
      await sleep(100);
    }
    defect(label, 'page did not settle (entrances/images) within ' + deadlineMs + ' ms');
    return -1;
  }
  async function open(route, w, h, label) {
    await setViewport(w, h);
    const full = url + route;
    await chrome.navigate(full, { readyExpression: `location.href.startsWith(${JSON.stringify(full)})&&document.readyState==='complete'` });
    return settle(label || route);
  }
  async function scrollTo(y, label) {
    await chrome.evalJS(`window.scrollTo(0, ${y})`);
    const started = Date.now();
    while (Date.now() - started < 4000) {
      const ok = await chrome.evalJS(`Math.abs(scrollY - Math.min(${y}, document.documentElement.scrollHeight - innerHeight)) < 2`);
      if (ok) { return settle(label || ('scroll ' + y), 4000); }
      await sleep(50);
    }
    defect(label || ('scroll ' + y), 'scroll position not reached within 4000 ms');
    return -1;
  }
  async function revealAll(label) {
    const dims = await chrome.evalJS('({ h: document.documentElement.scrollHeight, vh: innerHeight })');
    for (let y = 0; y < dims.h; y += Math.round(dims.vh * 0.8)) { await scrollTo(y, label); }
    await scrollTo(0, label);
  }
  async function shot(name, { fullPage = false } = {}) {
    if (!fullPage) {
      const s = await chrome.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(path.join(QA, name + '.png'), Buffer.from(s.data, 'base64'));
      return;
    }
    await revealAll(name);
    /* Every section was deliberately scrolled through, so every reveal must
       now be triggered and fully visible before the full-page capture. */
    const revealed = await chrome.evalJS(ALL_REVEALED);
    if (!revealed) { defect(name, 'sections not revealed after deliberate scroll-through'); }
    const dims = await chrome.evalJS('({ w: document.documentElement.clientWidth, h: document.documentElement.scrollHeight })');
    const s = await chrome.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: dims.w, height: dims.h, scale: 1 } });
    fs.writeFileSync(path.join(QA, name + '-full.png'), Buffer.from(s.data, 'base64'));
  }
  async function key(keyName, code, vk, text) {
    const base = { key: keyName, code, windowsVirtualKeyCode: vk };
    await chrome.call('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...base, ...(text ? { text } : {}) });
    await chrome.call('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  }
  /* Focus can start a smooth scroll (the product keeps html scroll-behavior
     smooth). Measure focused geometry only after scrolling has stopped, within
     a finite deadline, instead of sampling mid-animation. */
  async function focusSettle(deadlineMs = 3000) {
    const started = Date.now();
    let last = await chrome.evalJS('scrollY');
    let stable = 0;
    while (Date.now() - started < deadlineMs) {
      await sleep(100);
      const now = await chrome.evalJS('scrollY');
      if (Math.abs(now - last) < 1) { stable += 1; if (stable >= 2) { return true; } } else { stable = 0; }
      last = now;
    }
    return false;
  }
  const tab = async () => { await key('Tab', 'Tab', 9); await focusSettle(); };
  const shiftTab = async () => {
    await chrome.call('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
    await chrome.call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers: 8 });
    await focusSettle();
  };
  const FOCUS_INFO = `(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const s = getComputedStyle(a); return { tag: a.tagName, id: a.id, text: (a.textContent || '').trim().slice(0, 40), href: a.getAttribute('href'), role: a.getAttribute('data-role'), top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, inSticky: !!a.closest('[data-sticky-cta]'), outline: s.outlineStyle, focusVisible: a.matches(':focus-visible'), visible: s.visibility !== 'hidden' && Number(s.opacity) > 0 }; })()`;

  /* ================= per-page matrix ================= */
  for (const [w, h] of VIEWPORTS) {
    for (const route of PAGES) {
      const name = (route === '/' ? 'home' : route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')) + '-' + w;
      beginJourney('page ' + name);
      try {
        const settleMs = await open(route, w, h, name);
        const geo = await chrome.evalJS(GEOMETRY);
        const record = { route, viewport: [w, h], settleMs, ...geo };
        receipt.pages.push(record);
        if (geo.docScrollWidth > geo.clientWidth || geo.bodyScrollWidth > geo.clientWidth || geo.overflow.length) {
          defect(name, `horizontal overflow: doc ${geo.docScrollWidth} body ${geo.bodyScrollWidth} vs client ${geo.clientWidth}; ` + JSON.stringify(geo.overflow).slice(0, 500));
        }
        if (geo.h1 !== 1) { defect(name, 'h1 count ' + geo.h1); }
        if (['/', '/services/', '/pricing/', '/contact/', '/work/'].includes(route) && geo.ctaAboveFold !== true) { defect(name, 'primary CTA not visibly within the first viewport'); }
        await shot(name);
        if (['/', '/pricing/', '/contact/', '/services/', '/work/'].includes(route) && (w === 1280 || w === 320)) {
          await shot(name, { fullPage: true });
          const after = await chrome.evalJS(GEOMETRY);
          if (after.docScrollWidth > after.clientWidth || after.overflow.length) { defect(name, 'overflow after revealing all sections: ' + JSON.stringify(after.overflow).slice(0, 400)); }
        }
      } catch (err) {
        defect(name, 'page check threw: ' + err.message);
      }
      checkJourney();
    }
  }

  /* ================= 404 status ================= */
  beginJourney('notFound');
  try {
    const r = await fetch(url + '/this-route-does-not-exist/');
    const body = await r.text();
    journey.result = { status: r.status, custom: body.includes('That page is not here.') };
    if (r.status !== 404 || !body.includes('That page is not here.')) { defect('404', 'status ' + r.status); }
  } catch (err) { defect('404', err.message); }

  /* ================= skip link and focus visibility ================= */
  beginJourney('keyboard');
  try {
    await open('/', 1280, 900, 'keyboard');
    await tab();
    const first = await chrome.evalJS(FOCUS_INFO);
    if (first.href !== '#main' || first.top < 0) { defect('skip-link', JSON.stringify(first)); }
    for (let i = 0; i < 3; i += 1) { await tab(); }
    const focus = await chrome.evalJS(FOCUS_INFO);
    journey.result = { first, focus };
    if (!focus.focusVisible || focus.outline === 'none') { defect('focus-visible', JSON.stringify(focus)); }
  } catch (err) { defect('keyboard', err.message); }
  checkJourney();

  /* ================= phone menu ================= */
  if (!QUICK) {
    beginJourney('menu');
    try {
      await open('/', 390, 844, 'menu');
      const state = await chrome.evalJS(`(() => { const d = document.querySelector('details.menu'); d.querySelector('summary').click(); const open = d.open; const list = d.querySelector('.menu-list').getBoundingClientRect(); return { open, visible: list.height > 100 && list.right <= document.documentElement.clientWidth + 1, links: d.querySelectorAll('a').length }; })()`);
      await key('Escape', 'Escape', 27);
      const closed = await chrome.evalJS(`!document.querySelector('details.menu').open`);
      journey.result = { ...state, closedByEscape: closed };
      if (!state.open || !state.visible || !closed) { defect('menu', JSON.stringify(journey.result)); }
      await chrome.evalJS(`document.querySelector('details.menu summary').click()`);
      await sleep(100);
      await shot('home-390-menu');
    } catch (err) { defect('menu', err.message); }
    checkJourney();
  }

  /* ================= reduced motion (separate from normal-motion proof) ================= */
  beginJourney('reducedMotion');
  try {
    await chrome.call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await open('/', 1280, 900, 'reducedMotion');
    const rm = await chrome.evalJS(`({ hiddenReveals: [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity !== '1').length, hiddenRises: [...document.querySelectorAll('.rise')].filter(e => getComputedStyle(e).opacity !== '1').length, videoAutoplay: !!document.querySelector('video[autoplay]'), videoPaused: document.querySelector('video') ? document.querySelector('video').paused : null })`);
    journey.result = rm;
    if (rm.hiddenReveals || rm.hiddenRises || rm.videoAutoplay || rm.videoPaused === false) { defect('reduced-motion', JSON.stringify(rm)); }
    await shot('home-1280-reduced-motion');
    await chrome.call('Emulation.setEmulatedMedia', { media: 'screen', features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
  } catch (err) { defect('reduced-motion', err.message); }
  checkJourney();

  /* ================= video figure ================= */
  beginJourney('video');
  try {
    await open('/', 1280, 900, 'video');
    const v = await chrome.evalJS(`(() => { const f = document.querySelector('[data-video-figure]'); const v = f.querySelector('video'); return { ready: f.getAttribute('data-video-ready'), controls: v.controls, preload: v.preload, autoplay: v.autoplay, muted: v.muted, sources: [...v.querySelectorAll('source')].map(s => s.getAttribute('src')), stillVisible: !f.querySelector('.video-still').classList.contains('is-hidden'), transcriptItems: f.querySelectorAll('.transcript li').length }; })()`);
    if (v.ready !== '1' || !v.controls || v.preload !== 'none' || v.autoplay || !v.stillVisible || v.transcriptItems !== 5) { defect('video', JSON.stringify(v)); }
    await chrome.evalJS(`document.querySelector('[data-video-figure]').scrollIntoView({ block: 'center', behavior: 'instant' })`);
    await settle('video');
    await chrome.evalJS(`document.querySelector('[data-video-figure] [data-role="play"]').click()`);
    await sleep(1500);
    const after = await chrome.evalJS(`(() => { const f = document.querySelector('[data-video-figure]'); const v = f.querySelector('video'); const s = f.querySelector('[data-role="video-status"]'); return { playing: !v.paused && !v.ended, stillHidden: f.querySelector('.video-still').classList.contains('is-hidden'), status: s.hidden ? '' : s.textContent, currentTime: v.currentTime }; })()`);
    journey.result = { ...v, after };
    const mediaPresent = !pendingMedia.includes('/assets/media/request-demo.mp4');
    if (mediaPresent && !after.playing) { defect('video-play', 'media present but did not play: ' + JSON.stringify(after)); }
    if (!mediaPresent && !/not available/.test(after.status)) { defect('video-play', 'missing media but no honest status: ' + JSON.stringify(after)); }
    await shot('home-1280-video-playing');
    await chrome.evalJS(`(() => { const v = document.querySelector('video'); try { v.pause(); } catch (e) {} })()`);
  } catch (err) { defect('video', err.message); }
  checkJourney();

  /* ================= parked sticky bar: inert, keyboard geometry, focus-owned ================= */
  if (!QUICK) {
    beginJourney('stickyCta');
    try {
      await open('/pricing/', 390, 844, 'stickyCta');
      const STICKY = `(() => { const s = document.querySelector('[data-sticky-cta]'); const a = s.querySelector('a'); const r = a.getBoundingClientRect(); const cs = getComputedStyle(s); return { display: cs.display, parked: s.classList.contains('is-parked'), inert: s.hasAttribute('inert') && s.inert === true, ariaHidden: s.getAttribute('aria-hidden'), visibility: cs.visibility, linkTop: Math.round(r.top), linkBottom: Math.round(r.bottom), vh: innerHeight, bodyPad: getComputedStyle(document.body).paddingBottom }; })()`;
      const atTop = await chrome.evalJS(STICKY);
      if (atTop.display === 'none' || atTop.bodyPad === '0px') { defect('sticky-cta', 'bar not active on phone: ' + JSON.stringify(atTop)); }
      if (!atTop.parked || !atTop.inert) { defect('sticky-cta', 'hero CTA on screen but bar not parked/inert: ' + JSON.stringify(atTop)); }
      /* mid-page: no section CTA on screen, bar must be usable and on screen */
      const midY = await chrome.evalJS(`(() => { const l = document.querySelector('.price-sheet .ledger'); return Math.round(l.getBoundingClientRect().top + scrollY + 40); })()`);
      await scrollTo(midY, 'sticky mid');
      await sleep(300);
      const mid = await chrome.evalJS(STICKY);
      if (mid.parked || mid.inert || mid.visibility !== 'visible' || mid.linkBottom > mid.vh || mid.linkTop < 0) { defect('sticky-cta', 'bar should be usable mid-page: ' + JSON.stringify(mid)); }
      await shot('pricing-390-sticky-visible');
      /* footer: parked, inert; native Tab and Shift+Tab never land in it, every focus stays on screen */
      await scrollTo(999999, 'sticky footer');
      await sleep(400);
      const foot = await chrome.evalJS(STICKY);
      if (!foot.parked || !foot.inert || foot.visibility !== 'hidden' || foot.ariaHidden !== 'true') { defect('sticky-cta', 'bar not parked/inert at footer: ' + JSON.stringify(foot)); }
      await shot('pricing-390-footer');
      await chrome.evalJS(`document.querySelector('.site-foot a[href="/privacy/"]').focus()`);
      const tabs = [];
      for (let i = 0; i < 4; i += 1) { await tab(); await sleep(60); tabs.push(await chrome.evalJS(FOCUS_INFO)); }
      for (let i = 0; i < 4; i += 1) { await shiftTab(); await sleep(60); tabs.push(await chrome.evalJS(FOCUS_INFO)); }
      /* BODY means focus left the document for browser chrome; that is a
         boundary, not a hidden app control. Real controls must be visible and
         on screen after focus-induced scrolling settles; the parked bar must
         never be reached at all. */
      const offenders = tabs.filter((f) => f.inSticky || (f.tag !== 'BODY' && (!f.visible || f.top < -1 || f.bottom > f.vh + 1)));
      journey.result = { atTop, mid, foot, tabs };
      if (offenders.length) { defect('sticky-cta-keyboard', 'focus landed off screen or inside the parked bar: ' + JSON.stringify(offenders).slice(0, 500)); }
      /* focus-owned case: focused bar must not park under the user */
      await scrollTo(midY, 'sticky mid again');
      await sleep(300);
      await chrome.evalJS(`document.querySelector('[data-sticky-cta] a').focus()`);
      await scrollTo(999999, 'sticky footer while focused');
      await sleep(400);
      const owned = await chrome.evalJS(STICKY);
      const ownedFocus = await chrome.evalJS(FOCUS_INFO);
      if (owned.parked || !ownedFocus.inSticky || !ownedFocus.visible || ownedFocus.bottom > ownedFocus.vh) { defect('sticky-cta-focus-owned', 'bar parked while it owned focus: ' + JSON.stringify({ owned, ownedFocus })); }
      await chrome.evalJS(`document.activeElement.blur()`);
      await sleep(200);
      const released = await chrome.evalJS(STICKY);
      if (!released.parked || !released.inert) { defect('sticky-cta-focus-released', 'bar did not park after focus left: ' + JSON.stringify(released)); }
      journey.result.owned = { owned, ownedFocus, released };
    } catch (err) { defect('sticky-cta', err.message); }
    checkJourney();
  }

  /* ================= contact flow ================= */
  async function contactFlow(w, h) {
    const label = 'contact-' + w;
    beginJourney(label);
    try {
      await open('/contact/?topic=website', w, h, label);
      const initial = await chrome.evalJS(`({ ready: document.getElementById('brief-form').getAttribute('data-ready'), topic: document.getElementById('f-topic').value, reviewEnabled: !document.getElementById('review-draft').disabled, nojsHidden: getComputedStyle(document.querySelector('.nojs-note')).display === 'none', formAction: document.getElementById('brief-form').getAttribute('action'), named: document.querySelectorAll('#brief-form [name]').length })`);
      if (initial.ready !== '1' || initial.topic !== 'website' || !initial.reviewEnabled || !initial.nojsHidden || initial.formAction !== null || initial.named !== 0) { defect(label + '-initial', JSON.stringify(initial)); }
      const inputStart = journey.requests.length;
      await chrome.evalJS(`document.getElementById('review-draft').click()`);
      await sleep(100);
      const empty = await chrome.evalJS(`({ summaryVisible: !document.getElementById('error-summary').hidden, errors: document.querySelectorAll('#error-list li').length, invalid: document.querySelectorAll('#brief-form [aria-invalid="true"]').length, focused: document.activeElement.id, draftHidden: document.getElementById('draft-panel').hidden, url: location.href })`);
      if (!empty.summaryVisible || empty.errors !== 3 || empty.invalid !== 3 || empty.focused !== 'error-summary' || !empty.draftHidden || empty.url.includes('name=')) { defect(label + '-empty', JSON.stringify(empty)); }
      /* native typing into the name field and native Enter: handler runs, no navigation */
      await chrome.evalJS(`document.getElementById('f-name').focus()`);
      await chrome.call('Input.insertText', { text: 'Dana Example' });
      await chrome.evalJS(`(() => { const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }; set('f-email', 'dana@'); set('f-need', 'Our site still shows winter hours and the contact form goes to an old inbox.'); })()`);
      await chrome.evalJS(`document.getElementById('f-name').focus()`);
      await key('Enter', 'Enter', 13, '\r');
      await sleep(150);
      const badEmail = await chrome.evalJS(`({ errors: [...document.querySelectorAll('#error-list li')].map(l => l.textContent), emailInvalid: document.getElementById('f-email').getAttribute('aria-invalid'), nameInvalid: document.getElementById('f-name').getAttribute('aria-invalid'), url: location.href })`);
      if (badEmail.errors.length !== 1 || badEmail.emailInvalid !== 'true' || badEmail.nameInvalid || !badEmail.url.endsWith('/contact/?topic=website')) { defect(label + '-enter', JSON.stringify(badEmail)); }
      await chrome.evalJS(`(() => { const e = document.getElementById('f-email'); e.value = 'dana@example.com'; e.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      await chrome.evalJS(`document.getElementById('review-draft').click()`);
      await sleep(100);
      const draft = await chrome.evalJS(`({ draftVisible: !document.getElementById('draft-panel').hidden, briefHidden: document.getElementById('brief-panel').hidden, subject: document.getElementById('draft-subject').textContent, body: document.getElementById('draft-body').textContent, href: document.getElementById('open-mail').getAttribute('href'), url: location.href, storage: localStorage.length + sessionStorage.length, cookies: document.cookie })`);
      if (!draft.draftVisible || !draft.briefHidden || draft.subject !== 'Website quote request from Dana Example' || !draft.body.includes('winter hours') || !draft.href.startsWith('mailto:JWhalen@ClearPathWV.com?subject=') || !draft.href.includes('winter%20hours') || draft.storage !== 0 || draft.cookies !== '' || !draft.url.endsWith('/contact/?topic=website')) { defect(label + '-draft', JSON.stringify(draft).slice(0, 600)); }
      await settle(label);
      await shot(label + '-draft');
      await chrome.evalJS(`document.getElementById('edit-brief').click()`);
      const back = await chrome.evalJS(`({ briefVisible: !document.getElementById('brief-panel').hidden, need: document.getElementById('f-need').value.length })`);
      if (!back.briefVisible || !back.need) { defect(label + '-edit', JSON.stringify(back)); }
      await chrome.evalJS(`document.getElementById('review-draft').click()`);
      await chrome.evalJS(`(() => { const a = document.getElementById('open-mail'); a.addEventListener('click', e => e.preventDefault(), { once: true }); a.click(); })()`);
      await sleep(100);
      const result = await chrome.evalJS(`({ resultVisible: !document.getElementById('result-panel').hidden, text: document.getElementById('result-panel').textContent, storage: localStorage.length + sessionStorage.length, url: location.href })`);
      if (!result.resultVisible || !result.text.includes('Your draft is ready.') || !result.text.includes('Nothing has been sent by this website') || result.text.toLowerCase().includes('received') || result.storage !== 0 || !result.url.endsWith('/contact/?topic=website')) { defect(label + '-result', JSON.stringify(result).slice(0, 400)); }
      await shot(label + '-result');
      journey.result = { initial, empty, badEmail, subject: draft.subject, hrefPrefix: draft.href.slice(0, 60), result: result.resultVisible };
      checkJourney({ noRequestsAfter: inputStart });
    } catch (err) { defect(label, err.message); checkJourney(); }
  }
  await contactFlow(1280, 900);
  if (!QUICK) { await contactFlow(390, 844); }

  /* ================= JavaScript disabled: honest fallbacks, no navigation ================= */
  beginJourney('noScript');
  try {
    await chrome.call('Emulation.setScriptExecutionDisabled', { value: true });
    await setViewport(390, 844);
    await chrome.navigate(url + '/demos/request-desk/', { readyExpression: `document.readyState==='complete'` });
    const demo = await chrome.evalJS(`({ fallbackVisible: !document.getElementById('demo-fallback').hidden && getComputedStyle(document.getElementById('demo-fallback')).display !== 'none', shellHidden: document.getElementById('demo-shell').hidden })`);
    if (!demo.fallbackVisible || !demo.shellHidden) { defect('nojs-demo', JSON.stringify(demo)); }
    await chrome.navigate(url + '/', { readyExpression: `document.readyState==='complete'` });
    const home = await chrome.evalJS(`({ hiddenRises: [...document.querySelectorAll('.rise')].filter(e => getComputedStyle(e).opacity !== '1').length, hiddenReveals: [...document.querySelectorAll('.reveal')].filter(e => getComputedStyle(e).opacity !== '1').length, transcript: document.querySelectorAll('.transcript li').length, controls: !!document.querySelector('video[controls]') })`);
    if (home.hiddenRises || home.hiddenReveals || home.transcript !== 5 || !home.controls) { defect('nojs-home', JSON.stringify(home)); }
    await shot('home-390-nojs');
    await chrome.navigate(url + '/contact/', { readyExpression: `document.readyState==='complete'` });
    const contact = await chrome.evalJS(`({ nojsVisible: getComputedStyle(document.querySelector('.nojs-note')).display !== 'none', reviewDisabled: document.getElementById('review-draft').disabled, mailto: !!document.querySelector('.nojs-note a[href^="mailto:JWhalen@ClearPathWV.com"]') })`);
    if (!contact.nojsVisible || !contact.reviewDisabled || !contact.mailto) { defect('nojs-contact', JSON.stringify(contact)); }
    const before = journey.requests.length;
    await chrome.evalJS(`document.getElementById('f-name').focus()`);
    await chrome.call('Input.insertText', { text: 'Dana Example' });
    await key('Enter', 'Enter', 13, '\r');
    await sleep(400);
    const afterEnter = await chrome.evalJS(`({ url: location.href })`);
    if (!afterEnter.url.endsWith('/contact/')) { defect('nojs-enter', 'Enter navigated: ' + afterEnter.url); }
    journey.result = { demo, home, contact, afterEnter };
    await chrome.call('Emulation.setScriptExecutionDisabled', { value: false });
    checkJourney({ noRequestsAfter: before });
  } catch (err) { defect('nojs', err.message); await chrome.call('Emulation.setScriptExecutionDisabled', { value: false }).catch(() => {}); checkJourney(); }

  /* ================= demo journeys ================= */
  if (!QUICK) {
    async function requestDesk(w, h) {
      const label = 'requestDesk-' + w;
      beginJourney(label);
      try {
        await open('/demos/request-desk/', w, h, label);
        /* keyboard selection: focus the first sample and press Space */
        await chrome.evalJS(`document.querySelector('[data-sample="catering-email"]').focus()`);
        await key(' ', 'Space', 32, ' ');
        await sleep(100);
        const pressed = await chrome.evalJS(`document.querySelector('[data-sample="catering-email"]').getAttribute('aria-pressed')`);
        if (pressed !== 'true') { defect(label + '-keyboard', 'Space did not select the sample'); }
        await chrome.evalJS(`document.querySelector('[data-role="run"]').click()`);
        let approveReady = false;
        for (let i = 0; i < 80 && !approveReady; i += 1) { await sleep(100); approveReady = await chrome.evalJS(`!document.querySelector('[data-demo="request-desk"] [data-role="approve"]').disabled`); }
        const focusAfterRun = await chrome.evalJS(FOCUS_INFO);
        await chrome.evalJS(`document.querySelector('[data-demo="request-desk"] [data-role="approve"]').click()`);
        await sleep(100);
        const rd = await chrome.evalJS(`({ shellVisible: !document.getElementById('demo-shell').hidden, status: document.querySelector('[data-demo="request-desk"] [data-role="status"]').textContent, chip: document.querySelector('[data-demo="request-desk"] [data-role="state-chip"]').textContent, record: !!document.querySelector('.record-card'), focusedRole: document.activeElement.getAttribute('data-role') })`);
        if (!rd.shellVisible || !approveReady || !/Nothing was sent/.test(rd.status) || !rd.record || rd.focusedRole !== 'reset' || focusAfterRun.role !== 'approve') { defect(label, JSON.stringify({ rd, approveReady, focusAfterRun })); }
        await shot(label + '-approved');
        await chrome.evalJS(`document.querySelector('[data-demo="request-desk"] [data-role="reset"]').click()`);
        const reset = await chrome.evalJS(`({ done: document.querySelectorAll('[data-demo="request-desk"] .stage.is-done').length, chip: document.querySelector('[data-demo="request-desk"] [data-role="state-chip"]').textContent, pressed: document.querySelectorAll('[data-sample][aria-pressed="true"]').length, approveDisabled: document.querySelector('[data-demo="request-desk"] [data-role="approve"]').disabled })`);
        if (reset.done !== 0 || reset.chip !== 'Ready' || reset.pressed !== 0 || !reset.approveDisabled) { defect(label + '-reset', JSON.stringify(reset)); }
        journey.result = { rd, reset };
      } catch (err) { defect(label, err.message); }
      checkJourney();
    }
    await requestDesk(1280, 900);
    await requestDesk(390, 844);

    beginJourney('businessBrain');
    try {
      await open('/demos/business-brain/', 1280, 900, 'businessBrain');
      await chrome.evalJS(`document.querySelector('[data-question="q-oatmilk"]').click()`);
      const unknown = await chrome.evalJS(`({ cannot: !!document.querySelector('.cannot-card'), approveDisabled: document.querySelector('[data-demo="business-brain"] [data-role="approve"]').disabled })`);
      await chrome.evalJS(`(() => { const i = document.getElementById('bb-ask'); i.value = '<img src=x onerror="document.title=\\'injected\\'"> do you have gluten free bread'; document.querySelector('form.ask-form').requestSubmit(); })()`);
      await sleep(100);
      const typed = await chrome.evalJS(`({ answer: !!document.querySelector('.answer-card'), cited: document.querySelector('.src.is-cited') && document.querySelector('.src.is-cited').id, injectedImg: document.querySelectorAll('[data-role="answer"] img').length, title: document.title, literal: (document.querySelector('.answer-q') || {}).textContent || '', url: location.href })`);
      await chrome.evalJS(`document.querySelector('[data-demo="business-brain"] [data-role="approve"]').click()`);
      const approved = await chrome.evalJS(`document.querySelector('[data-demo="business-brain"] [data-role="state-chip"]').textContent`);
      await chrome.evalJS(`document.querySelector('[data-demo="business-brain"] [data-role="reset"]').click()`);
      const reset = await chrome.evalJS(`({ answerEmpty: document.querySelector('[data-role="answer"]').children.length === 0, input: document.getElementById('bb-ask').value, cited: document.querySelectorAll('.src.is-cited').length })`);
      journey.result = { unknown, typed, approved, reset };
      if (!unknown.cannot || !unknown.approveDisabled || !typed.answer || typed.cited !== 'bb-src-kitchen' || typed.injectedImg !== 0 || typed.title === 'injected' || !typed.literal.includes('<img') || typed.url.includes('?') || approved !== 'Approved for demo' || !reset.answerEmpty || reset.input !== '' || reset.cited !== 0) { defect('demo-business-brain', JSON.stringify(journey.result).slice(0, 600)); }
    } catch (err) { defect('businessBrain', err.message); }
    checkJourney();

    beginJourney('websiteManager');
    try {
      await open('/demos/website-manager/', 1280, 900, 'websiteManager');
      const SET = (v) => `(() => { const i = document.getElementById('wm-draft'); i.value = ${JSON.stringify(v)}; i.dispatchEvent(new Event('input', { bubbles: true })); })()`;
      const STATE = `(() => { const m = document.querySelector('[data-demo="website-manager"]'); const q = (s) => m.querySelector(s); return { badge: q('[data-role="pub-badge"]').textContent, noteHidden: q('[data-role="pub-note"]').hidden, chip: q('[data-role="approve-chip"]').textContent, state: q('[data-role="state-chip"]').textContent, approveDisabled: q('[data-role="approve"]').disabled, publishDisabled: q('[data-role="publish"]').disabled, published: q('[data-role="published"]').textContent, preview: q('[data-line="hours"]').textContent, previewB: q('[data-role="preview"]').querySelectorAll('b').length, draft: q('[data-role="draft-input"]').value }; })()`;
      await chrome.evalJS(`document.querySelector('[data-item="hours"]').click()`);
      const loaded = await chrome.evalJS(STATE);
      await chrome.evalJS(SET('Sunday: 9:00 am to 3:00 pm'));
      const drafted = await chrome.evalJS(STATE);
      const publishLockedBeforeApproval = drafted.publishDisabled === true && drafted.approveDisabled === false;
      await chrome.evalJS(`document.querySelector('[data-demo="website-manager"] [data-role="approve"]').click()`);
      await chrome.evalJS(`document.querySelector('[data-demo="website-manager"] [data-role="publish"]').click()`);
      const published = await chrome.evalJS(STATE);
      await chrome.evalJS(SET('Sunday: 10:00 am to 2:00 pm'));
      const changed = await chrome.evalJS(STATE);
      await chrome.evalJS(`document.querySelector('[data-demo="website-manager"] [data-role="approve"]').click()`);
      const reapproved = await chrome.evalJS(STATE);
      await chrome.evalJS(SET(''));
      const cleared = await chrome.evalJS(STATE);
      await chrome.evalJS(SET('<b>Sunday: closed</b>'));
      const markup = await chrome.evalJS(STATE);
      await chrome.evalJS(`document.querySelector('[data-demo="website-manager"] [data-role="reset"]').click()`);
      const reset = await chrome.evalJS(STATE);
      journey.result = { loaded, drafted, published, changed, reapproved, cleared, markup, reset };
      const problems = [];
      if (loaded.badge !== 'Preview' || loaded.published !== 'Sunday: 8:00 am to 2:00 pm') { problems.push('loaded'); }
      if (!publishLockedBeforeApproval) { problems.push('publish not locked before approval'); }
      if (published.badge !== 'Published (demo)' || published.noteHidden || published.published !== 'Sunday: 9:00 am to 3:00 pm' || !published.publishDisabled) { problems.push('published'); }
      if (changed.badge !== 'Preview' || !changed.noteHidden || changed.chip !== 'Approval required' || !changed.publishDisabled || changed.published !== 'Sunday: 9:00 am to 3:00 pm' || changed.preview !== 'Sunday: 10:00 am to 2:00 pm') { problems.push('stale indicators after unapproved change'); }
      if (reapproved.chip !== 'Approved for demo' || reapproved.publishDisabled) { problems.push('reapproval'); }
      if (cleared.chip !== 'Waiting for a draft' || cleared.badge !== 'Preview' || !cleared.noteHidden || !cleared.approveDisabled || !cleared.publishDisabled || cleared.published !== 'Sunday: 9:00 am to 3:00 pm') { problems.push('stale indicators after clearing an approved draft'); }
      if (markup.previewB !== 0 || markup.preview !== '<b>Sunday: closed</b>' || !markup.publishDisabled) { problems.push('typed markup not inert'); }
      if (reset.published !== 'Pick an item to load its published value.' || reset.preview !== 'Sunday: 8:00 am to 2:00 pm' || reset.badge !== 'Preview' || !reset.noteHidden || reset.chip !== 'Waiting for a draft') { problems.push('reset did not restore baseline'); }
      if (problems.length) { defect('demo-website-manager', problems.join('; ') + ' ' + JSON.stringify(journey.result).slice(0, 900)); }
      await shot('demo-website-manager-changed');
    } catch (err) { defect('websiteManager', err.message); }
    checkJourney();
  }

  /* ================= target sizes at 390 ================= */
  if (!QUICK) {
    beginJourney('targetSizes');
    try {
      for (const route of ['/', '/pricing/', '/contact/', '/demos/request-desk/']) {
        await open(route, 390, 844, 'targets ' + route);
        await revealAll('targets ' + route);
        const small = await chrome.evalJS(`[...document.querySelectorAll('a, button, input, select, textarea, summary, [tabindex="0"]')].filter(e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.closest('[inert]')) return false; if (e.tagName === 'A' && s.display === 'inline' && e.closest('p, li, figcaption, dd')) return false; const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 24 || r.height < 24); }).map(e => ({ tag: e.tagName, text: (e.textContent || '').trim().slice(0, 30), w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height) }))`);
        if (small.length) { defect('target-size ' + route, JSON.stringify(small).slice(0, 500)); }
      }
    } catch (err) { defect('targetSizes', err.message); }
    checkJourney();
  }

  /* ================= logo raster corner color ================= */
  beginJourney('logo');
  try {
    await open('/', 1280, 900, 'logo');
    const corner = await chrome.evalJS(`(() => { const img = document.querySelector('.logo-crop img'); const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0); const px = (x, y) => { const d = ctx.getImageData(x, y, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); }; return { naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, topLeft: px(2, 2), bottomRight: px(img.naturalWidth - 3, img.naturalHeight - 3) }; })()`);
    journey.result = corner;
    const light = (hex) => parseInt(hex.slice(1, 3), 16) > 225 && parseInt(hex.slice(3, 5), 16) > 225 && parseInt(hex.slice(5, 7), 16) > 225;
    if (!light(corner.topLeft) || !light(corner.bottomRight)) { note('logo margin is not light (' + corner.topLeft + '); inspect footer screenshot'); }
    await scrollTo(999999, 'footer logo');
    await shot('footer-logo-crop');
  } catch (err) { defect('logo', err.message); }
  checkJourney();

  await chrome.close();
  await close();
  receipt.status = receipt.defects.length ? 'FAIL' : 'PASS';
  receipt.finishedAt = new Date().toISOString();
  receipt.blockedTotal = blockedAll.length;
  fs.writeFileSync(path.join(QA, 'browser-check.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify({ status: receipt.status, defects: receipt.defects.length, pages: receipt.pages.length, journeys: receipt.journeys.length, blocked: blockedAll.length, receipt: 'qa/browser-check.json' }));
  process.exit(receipt.defects.length ? 1 : 0);
}

main().catch((err) => { console.error('BROWSER CHECK CRASHED: ' + err.stack); process.exit(1); });
