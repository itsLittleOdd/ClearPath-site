/* Browser-journey verification harness for the ClearPath demo build.
   Drives the locally installed headless Chrome over the DevTools protocol
   using only Node standard capabilities (global WebSocket, child_process).
   Talks exclusively to 127.0.0.1. Not part of the deployed site: tests/ is
   excluded by .vercelignore.

   Usage: node tests/browser_journeys.mjs http://127.0.0.1:8763
*/
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.argv[2] || 'http://127.0.0.1:8763';
const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(HERE, 'screenshots');
const PROFILE = join(HERE, '.chrome-tmp');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

mkdirSync(SHOTS, { recursive: true });

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail: detail || '' });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${detail ? ' :: ' + detail : ''}`);
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ---------- Chrome + CDP plumbing ---------- */

function launchChrome() {
  return new Promise((resolve, reject) => {
    const child = spawn(CHROME, [
      '--headless=new',
      '--remote-debugging-port=0',
      `--user-data-dir=${PROFILE}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-sync',
      '--disable-default-apps',
      '--disable-extensions',
      '--mute-audio',
      'about:blank',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    const onData = (chunk) => {
      err += chunk.toString();
      const m = err.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        child.stderr.off('data', onData);
        resolve({ child, wsUrl: m[1] });
      }
    };
    child.stderr.on('data', onData);
    child.on('exit', (code) => reject(new Error('chrome exited ' + code)));
    setTimeout(() => reject(new Error('chrome did not start')), 15000);
  });
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const fn of this.listeners) fn(msg);
      }
    });
  }
  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error('timeout: ' + method));
        }
      }, 20000);
    });
  }
  on(fn) { this.listeners.push(fn); }
}

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error('ws error')), { once: true });
  });
  return new Cdp(ws);
}

/* ---------- page helpers ---------- */

let cdp, session, pageErrors = [], dialogs = [];

async function evalJs(expression) {
  const r = await cdp.send('Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true }, session);
  if (r.exceptionDetails) {
    throw new Error('eval failed: ' +
      (r.exceptionDetails.exception?.description || r.exceptionDetails.text) +
      ' in ' + expression.slice(0, 120));
  }
  return r.result.value;
}

async function poll(expression, timeoutMs = 6000, label = '') {
  const start = Date.now();
  for (;;) {
    const v = await evalJs(expression);
    if (v) return { ok: true, ms: Date.now() - start };
    if (Date.now() - start > timeoutMs) {
      return { ok: false, ms: Date.now() - start, label };
    }
    await wait(120);
  }
}

async function navigate(url) {
  pageErrors = [];
  const loaded = new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.method === 'Page.loadEventFired' && msg.sessionId === session) {
        resolve();
      }
    };
    cdp.on(fn);
  });
  await cdp.send('Page.navigate', { url }, session);
  await Promise.race([loaded, wait(8000)]);
  await wait(250);
}

async function setViewport(width, height, mobile) {
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width, height, deviceScaleFactor: mobile ? 2 : 1, mobile: !!mobile,
  }, session);
}

async function key(name, code, vk, text) {
  const params = { key: name, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  if (text) params.text = text;
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...params }, session);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', ...params }, session);
  await wait(80);
}

async function shot(name, fullPage) {
  let restore = null;
  if (fullPage) {
    const metrics = await cdp.send('Page.getLayoutMetrics', {}, session);
    const height = Math.min(Math.ceil(metrics.cssContentSize.height), 9000);
    const width = Math.ceil(metrics.cssLayoutViewport.clientWidth);
    restore = { width, height: metrics.cssLayoutViewport.clientHeight };
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width, height, deviceScaleFactor: 1, mobile: width < 500 }, session);
    await wait(150);
  }
  const r = await cdp.send('Page.captureScreenshot', { format: 'png' }, session);
  writeFileSync(join(SHOTS, name), Buffer.from(r.data, 'base64'));
  if (restore) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: restore.width, height: restore.height, deviceScaleFactor: 1, mobile: restore.width < 500 }, session);
    await wait(100);
  }
  console.log('SHOT ' + name);
}

async function noOverflow(label) {
  const v = await evalJs(
    'document.documentElement.scrollWidth - document.documentElement.clientWidth');
  record(`${label}: no horizontal overflow`, v <= 1, `overflowPx=${v}`);
}

async function imagesLoaded(label) {
  const v = await evalJs(
    'Array.from(document.images).every(i => i.complete && (i.naturalWidth > 0 || !i.src))');
  record(`${label}: all images loaded`, v === true);
}

function consoleClean(label) {
  record(`${label}: no console errors`, pageErrors.length === 0,
    pageErrors.slice(0, 3).join(' | '));
}

/* Click helper via element.click() inside the page. */
async function click(selector) {
  const ok = await evalJs(
    `(function(){var el=document.querySelector(${JSON.stringify(selector)});` +
    'if(!el)return false;el.click();return true;}())');
  if (!ok) throw new Error('no element to click: ' + selector);
  await wait(120);
}

/* ---------- journeys ---------- */

async function main() {
  const { child, wsUrl } = await launchChrome();
  cdp = await connect(wsUrl);
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const attach = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  session = attach.sessionId;
  await cdp.send('Page.enable', {}, session);
  await cdp.send('Runtime.enable', {}, session);
  await cdp.send('Log.enable', {}, session);
  cdp.on((msg) => {
    if (msg.sessionId !== session) return;
    if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push('exception: ' +
        (msg.params.exceptionDetails.exception?.description || '').slice(0, 200));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      pageErrors.push('console.error: ' +
        msg.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200));
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      pageErrors.push('log: ' + msg.params.entry.text.slice(0, 200));
    }
    if (msg.method === 'Page.javascriptDialogOpening') {
      dialogs.push(msg.params.message);
      cdp.send('Page.handleJavaScriptDialog', { accept: false }, session);
    }
  });

  /* ===== Homepage, desktop ===== */
  await setViewport(1280, 900, false);
  await navigate(BASE + '/');
  record('home: title', (await evalJs('document.title')).includes('ClearPath'));
  record('home: demo surface revealed by JS',
    await evalJs('!document.getElementById("see-shell").hidden && document.getElementById("see-fallback").hidden'));
  await imagesLoaded('home desktop');
  await noOverflow('home desktop 1280');

  /* Request Desk compact journey */
  await click('#panel-rd [data-sample="catering-email"]');
  record('home RD: sample pressed',
    await evalJs('document.querySelector("#panel-rd [data-sample=\'catering-email\']").getAttribute("aria-pressed") === "true"'));
  record('home RD: incoming request filled',
    await evalJs('document.querySelector("#panel-rd [data-slot=\'request\']").textContent.includes("morgan@example.com")'));
  await click('#panel-rd [data-role="run"]');
  const rdReady = await poll(
    '!document.querySelector("#panel-rd [data-role=\'approve\']").disabled', 6000);
  record('home RD: pipeline ran to approval gate', rdReady.ok, `${rdReady.ms}ms`);
  await click('#panel-rd [data-role="approve"]');
  record('home RD: approved-for-demo state',
    (await poll('document.querySelector("#panel-rd [data-role=\'status\']").textContent.includes("Approved for demo")')).ok);
  record('home RD: record marked approved for demo',
    await evalJs('document.querySelector("#panel-rd [data-slot=\'record\']").textContent.includes("approved for demo")'));
  await click('#panel-rd [data-role="reset"]');
  record('home RD: reset returns to ready',
    (await poll('document.querySelector("#panel-rd [data-role=\'status\']").textContent.includes("Pick a sample request")')).ok);

  /* Tabs keyboard contract */
  await evalJs('document.getElementById("tab-rd").focus()');
  await key('ArrowRight', 'ArrowRight', 39);
  record('tabs: ArrowRight moves selection and focus to Business Brain',
    await evalJs('document.activeElement.id === "tab-bb" && document.getElementById("tab-bb").getAttribute("aria-selected") === "true" && !document.getElementById("panel-bb").hidden && document.getElementById("panel-rd").hidden'));
  await key('End', 'End', 35);
  record('tabs: End jumps to Site Manager',
    await evalJs('document.activeElement.id === "tab-wm" && !document.getElementById("panel-wm").hidden'));
  await key('Home', 'Home', 36);
  record('tabs: Home returns to Request Desk',
    await evalJs('document.activeElement.id === "tab-rd" && !document.getElementById("panel-rd").hidden'));
  record('tabs: roving tabindex',
    await evalJs('document.getElementById("tab-rd").getAttribute("tabindex") === "0" && document.getElementById("tab-bb").getAttribute("tabindex") === "-1"'));

  /* Business Brain compact journey */
  await click('#tab-bb');
  await click('#panel-bb [data-question="q-sunday"]');
  record('home BB: answer quotes the displayed source',
    (await poll('document.querySelector("#panel-bb [data-role=\'answer\']").textContent.includes("8:00 am to 2:00 pm")')).ok);
  record('home BB: citation links to the source card',
    await evalJs('!!document.querySelector("#panel-bb [data-role=\'answer\'] a.cite[href=\'#bb-src-hours\']")'));
  await click('#panel-bb [data-question="q-oatmilk"]');
  record('home BB: unknown question cannot-confirm',
    (await poll('document.querySelector("#panel-bb [data-role=\'answer\']").textContent.includes("cannot confirm")')).ok);
  record('home BB: cannot-confirm keeps approval disabled',
    await evalJs('document.querySelector("#panel-bb [data-role=\'approve\']").disabled === true'));
  await click('#panel-bb [data-question="q-dog"]');
  await poll('!document.querySelector("#panel-bb [data-role=\'approve\']").disabled');
  await click('#panel-bb [data-role="approve"]');
  record('home BB: approved for demo, nothing sent',
    (await poll('document.querySelector("#panel-bb [data-role=\'status\']").textContent.includes("Approved for demo")')).ok);
  await click('#panel-bb [data-role="reset"]');

  /* Site Manager compact journey */
  await click('#tab-wm');
  await click('#panel-wm [data-item="hours"]');
  record('home WM: published value loaded into draft',
    await evalJs('document.getElementById("wm-c-draft").value.includes("Sunday")'));
  await evalJs(
    'var i=document.getElementById("wm-c-draft");i.value="Sunday: 8:00 am to 3:00 pm";' +
    'i.dispatchEvent(new Event("input",{bubbles:true}));true');
  record('home WM: change summary shows was/now',
    (await poll('document.querySelector("#panel-wm [data-role=\'summary\']").textContent.includes("Now: Sunday: 8:00 am to 3:00 pm")')).ok);
  record('home WM: preview follows the draft',
    await evalJs('document.querySelector("#panel-wm [data-line=\'hours\']").textContent === "Sunday: 8:00 am to 3:00 pm"'));
  record('home WM: publish locked before approval',
    await evalJs('document.querySelector("#panel-wm [data-role=\'publish\']").disabled === true'));
  await click('#panel-wm [data-role="approve"]');
  record('home WM: approval unlocks publish',
    (await poll('!document.querySelector("#panel-wm [data-role=\'publish\']").disabled')).ok);
  await click('#panel-wm [data-role="publish"]');
  record('home WM: published (demo) with local-only note visible',
    await evalJs('document.querySelector("#panel-wm [data-role=\'pub-badge\']").textContent === "Published (demo)" && !document.querySelector("#panel-wm [data-role=\'pub-note\']").hidden'));
  await click('#panel-wm [data-role="reset"]');
  record('home WM: reset restores baseline',
    await evalJs('document.querySelector("#panel-wm [data-line=\'hours\']").textContent === "Sunday: 8:00 am to 2:00 pm"'));

  consoleClean('home desktop');
  await evalJs('document.getElementById("see-it-run").scrollIntoView()');
  await wait(200);
  await evalJs('document.getElementById("tab-rd").focus()');
  await shot('home-desktop-demo-focus.png', false);
  await shot('home-desktop-full.png', true);

  /* ===== Homepage, 390 mobile ===== */
  await setViewport(390, 844, true);
  await navigate(BASE + '/');
  record('home 390: demo surface revealed',
    await evalJs('!document.getElementById("see-shell").hidden'));
  await noOverflow('home 390');
  record('home 390: Demos nav link visible',
    await evalJs('(function(){var a=document.querySelector(".nav a[href=\'/demos/\']");return !!a && a.offsetParent !== null}())'));
  await click('#panel-rd [data-sample="phone-note"]');
  await click('#panel-rd [data-role="run"]');
  record('home 390 RD: journey works on mobile',
    (await poll('!document.querySelector("#panel-rd [data-role=\'approve\']").disabled', 6000)).ok);
  await click('#panel-rd [data-role="approve"]');
  record('home 390 RD: approved',
    (await poll('document.querySelector("#panel-rd [data-role=\'status\']").textContent.includes("Approved for demo")')).ok);
  consoleClean('home 390');
  await shot('home-390-full.png', true);

  /* ===== Reduced motion ===== */
  await cdp.send('Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }, session);
  await setViewport(1280, 900, false);
  await navigate(BASE + '/');
  await click('#panel-rd [data-sample="catering-email"]');
  await click('#panel-rd [data-role="run"]');
  const rmReady = await poll(
    '!document.querySelector("#panel-rd [data-role=\'approve\']").disabled', 2500);
  record('reduced motion: pipeline completes without waiting on animation',
    rmReady.ok && rmReady.ms < 2000, `${rmReady.ms}ms`);
  record('reduced motion: revealed content fully visible',
    await evalJs('getComputedStyle(document.querySelector("#familiar .sec-head")).opacity === "1"'));
  await cdp.send('Emulation.setEmulatedMedia', { features: [] }, session);

  /* ===== No-JS honesty ===== */
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: true }, session);
  await navigate(BASE + '/');
  record('no-JS home: honest fallback visible, shell hidden',
    await evalJs('!document.getElementById("see-fallback").hidden && document.getElementById("see-shell").hidden'));
  record('no-JS home: content not hidden by reveal styling',
    await evalJs('getComputedStyle(document.querySelector("#familiar .sec-head")).opacity === "1"'));
  record('no-JS home: fallback links to all three demo pages',
    await evalJs('["/demos/request-desk/","/demos/business-brain/","/demos/website-manager/"].every(function(r){return !!document.querySelector("#see-fallback a[href=\'" + r + "\']")})'));
  await shot('home-nojs.png', false);
  await navigate(BASE + '/demos/request-desk/');
  record('no-JS request desk: fallback visible, shell hidden',
    await evalJs('!document.getElementById("demo-fallback").hidden && document.getElementById("demo-shell").hidden'));
  await cdp.send('Emulation.setScriptExecutionDisabled', { value: false }, session);

  /* ===== Demo hub ===== */
  await setViewport(1280, 900, false);
  await navigate(BASE + '/demos/');
  record('hub: three demo links',
    await evalJs('["/demos/request-desk/","/demos/business-brain/","/demos/website-manager/"].every(function(r){return !!document.querySelector("a[href=\'" + r + "\']")})'));
  await noOverflow('hub desktop');
  consoleClean('hub desktop');
  await shot('hub-desktop-full.png', true);
  await setViewport(390, 844, true);
  await navigate(BASE + '/demos/');
  await noOverflow('hub 390');
  await shot('hub-390-full.png', true);

  /* ===== Request Desk full page ===== */
  await setViewport(1280, 900, false);
  await navigate(BASE + '/demos/request-desk/');
  record('RD full: shell revealed, fallback hidden',
    await evalJs('!document.getElementById("demo-shell").hidden && document.getElementById("demo-fallback").hidden'));
  await evalJs('document.querySelector("[data-sample=\'web-form\']").focus()');
  await key('Enter', 'Enter', 13, '\r');
  record('RD full: keyboard Enter selects a sample',
    await evalJs('document.querySelector("[data-sample=\'web-form\']").getAttribute("aria-pressed") === "true"'));
  await click('[data-role="run"]');
  record('RD full: web-form pipeline reaches approval',
    (await poll('!document.querySelector("[data-role=\'approve\']").disabled', 6000)).ok);
  await click('[data-role="approve"]');
  record('RD full: approved for demo',
    (await poll('document.querySelector("[data-role=\'status\']").textContent.includes("Approved for demo")')).ok);
  record('RD full: focus managed to reset after approval',
    await evalJs('document.activeElement === document.querySelector("[data-role=\'reset\']")'));
  await click('[data-role="reset"]');
  record('RD full: reset state',
    await evalJs('document.querySelector("[data-role=\'status\']").textContent.includes("Pick a sample request")'));
  await noOverflow('RD desktop');
  consoleClean('RD desktop');
  await shot('rd-desktop-full.png', true);
  await setViewport(390, 844, true);
  await navigate(BASE + '/demos/request-desk/');
  await click('[data-sample="catering-email"]');
  await click('[data-role="run"]');
  record('RD 390: pipeline works on mobile',
    (await poll('!document.querySelector("[data-role=\'approve\']").disabled', 6000)).ok);
  await noOverflow('RD 390');
  await shot('rd-390-full.png', true);

  /* ===== Business Brain full page ===== */
  await setViewport(1280, 900, false);
  await navigate(BASE + '/demos/business-brain/');
  record('BB full: shell revealed',
    await evalJs('!document.getElementById("demo-shell").hidden'));
  await evalJs('document.querySelector("[data-role=\'ask-input\']").focus()');
  await cdp.send('Input.insertText', { text: 'do you have gluten free bread' }, session);
  await key('Enter', 'Enter', 13, '\r');
  record('BB full: typed question answered from kitchen notes',
    (await poll('document.querySelector("[data-role=\'answer\']").textContent.includes("Gluten-free bread is available on request.")')).ok);
  record('BB full: citation present for typed question',
    await evalJs('!!document.querySelector("[data-role=\'answer\'] a.cite")'));
  await evalJs('var i=document.querySelector("[data-role=\'ask-input\']");i.value="do you deliver pizza";true');
  await key('Enter', 'Enter', 13, '\r');
  record('BB full: uncovered typed question cannot-confirm',
    (await poll('document.querySelector("[data-role=\'answer\']").textContent.includes("cannot confirm")')).ok);
  await evalJs('var i=document.querySelector("[data-role=\'ask-input\']");i.value="<img src=x onerror=window.__xss=1>";true');
  await key('Enter', 'Enter', 13, '\r');
  await wait(400);
  record('BB full: typed markup rendered as inert text',
    await evalJs('(function(){var a=document.querySelector("[data-role=\'answer\']");return a.textContent.indexOf("<img src=x") !== -1 && !a.querySelector("img") && !window.__xss}())'));
  await click('[data-question="q-parking"]');
  await poll('!document.querySelector("[data-role=\'approve\']").disabled');
  await click('[data-role="approve"]');
  record('BB full: preset answer approved for demo',
    (await poll('document.querySelector("[data-role=\'status\']").textContent.includes("Approved for demo")')).ok);
  record('BB full: cited source card highlighted',
    await evalJs('!!document.querySelector("#bb-src-staff.is-cited")'));
  await click('[data-role="reset"]');
  record('BB full: reset clears the answer',
    await evalJs('document.querySelector("[data-role=\'answer\']").children.length === 0'));
  await noOverflow('BB desktop');
  consoleClean('BB desktop');
  await shot('bb-desktop-full.png', true);
  await setViewport(390, 844, true);
  await navigate(BASE + '/demos/business-brain/');
  await click('[data-question="q-sunday"]');
  record('BB 390: preset works on mobile',
    (await poll('document.querySelector("[data-role=\'answer\']").textContent.includes("8:00 am to 2:00 pm")')).ok);
  await noOverflow('BB 390');
  await shot('bb-390-full.png', true);

  /* ===== Website Manager full page ===== */
  await setViewport(1280, 900, false);
  await navigate(BASE + '/demos/website-manager/');
  record('WM full: shell revealed',
    await evalJs('!document.getElementById("demo-shell").hidden'));
  await click('[data-item="event"]');
  await evalJs(
    'var i=document.querySelector("[data-role=\'draft-input\']");' +
    'i.value="Friday: trivia night, 7 to 9 pm";' +
    'i.dispatchEvent(new Event("input",{bubbles:true}));true');
  record('WM full: summary shows the change',
    (await poll('document.querySelector("[data-role=\'summary\']").textContent.includes("Now: Friday: trivia night, 7 to 9 pm")')).ok);
  await click('[data-role="approve"]');
  await poll('!document.querySelector("[data-role=\'publish\']").disabled');
  await click('[data-role="publish"]');
  record('WM full: published (demo), preview updated, note visible',
    await evalJs('document.querySelector("[data-line=\'event\']").textContent === "Friday: trivia night, 7 to 9 pm" && !document.querySelector("[data-role=\'pub-note\']").hidden'));
  await evalJs('document.querySelector("[data-item=\'note\']").click();true');
  await evalJs(
    'var i=document.querySelector("[data-role=\'draft-input\']");' +
    'i.value="<b>patio closed</b>";' +
    'i.dispatchEvent(new Event("input",{bubbles:true}));true');
  record('WM full: typed markup stays inert text in preview',
    await evalJs('(function(){var line=document.querySelector("[data-line=\'note\']");return line.textContent === "<b>patio closed</b>" && line.children.length === 0}())'));
  await click('[data-role="reset"]');
  record('WM full: reset restores all baselines',
    await evalJs('document.querySelector("[data-line=\'event\']").textContent === "Friday: live acoustic set, 6 to 8 pm" && document.querySelector("[data-line=\'note\']").textContent === "Patio open, weather permitting"'));
  await noOverflow('WM desktop');
  consoleClean('WM desktop');
  await shot('wm-desktop-full.png', true);
  await setViewport(390, 844, true);
  await navigate(BASE + '/demos/website-manager/');
  await click('[data-item="hours"]');
  record('WM 390: editor works on mobile',
    await evalJs('!document.querySelector("[data-role=\'draft-input\']").disabled'));
  await noOverflow('WM 390');
  await shot('wm-390-full.png', true);

  /* ===== Contact card regression smoke ===== */
  await setViewport(390, 844, true);
  await navigate(BASE + '/justin/card.html');
  record('card: script enabled the fail-closed submit button',
    await evalJs('document.getElementById("send-email").disabled === false'));
  await noOverflow('card 390');
  consoleClean('card 390');
  await shot('card-390.png', false);

  /* ===== Width sweep: no horizontal overflow anywhere ===== */
  for (const width of [320, 390, 430, 768]) {
    await setViewport(width, 900, width < 500);
    for (const path of ['/', '/demos/', '/demos/request-desk/',
                        '/demos/business-brain/', '/demos/website-manager/']) {
      await navigate(BASE + path);
      const v = await evalJs(
        'document.documentElement.scrollWidth - document.documentElement.clientWidth');
      record(`sweep ${width}px ${path}: no overflow`, v <= 1, `overflowPx=${v}`);
    }
  }
  await setViewport(320, 900, true);
  await navigate(BASE + '/');
  await shot('home-320-top.png', false);

  record('no unexpected JS dialogs anywhere', dialogs.length === 0,
    dialogs.join(' | '));

  const failed = results.filter(r => !r.pass);
  console.log('\n==== BROWSER JOURNEY SUMMARY ====');
  console.log(`PASS ${results.length - failed.length} / ${results.length}`);
  for (const f of failed) console.log('FAILED: ' + f.name + ' :: ' + f.detail);

  child.kill('SIGTERM');
  await wait(400);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch {}
  process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
  console.error('HARNESS ERROR: ' + err.message);
  process.exit(2);
});
