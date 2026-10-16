/* Isolated headless Chrome over the DevTools protocol, using only Node 22
   built-ins (child_process, fetch, WebSocket). Adapted from the controller's
   exercised CDP pattern: fresh temporary profile, loopback debugging port,
   no personal browser profile, and only the child we spawned is ever killed. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const DEFAULT_CHROME = [
  process.env.CLEARPATH_CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium'
].filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function findChrome() {
  for (const candidate of DEFAULT_CHROME) {
    if (fs.existsSync(candidate)) { return candidate; }
  }
  throw new Error('Chrome not found. Set CLEARPATH_CHROME to the browser executable.');
}

export async function launchChrome(options = {}) {
  const chromePath = findChrome();
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'clearpath-chrome-'));
  const args = [
    '--headless=new', '--hide-scrollbars', '--disable-gpu', '--no-first-run',
    '--no-default-browser-check', '--disable-background-networking', '--disable-extensions',
    '--disable-sync', '--disable-component-update', '--disable-default-apps',
    '--disable-features=Translate,OptimizationHints,MediaRouter',
    '--force-device-scale-factor=1', '--font-render-hinting=none',
    '--autoplay-policy=no-user-gesture-required',
    '--remote-debugging-address=127.0.0.1', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    ...(options.extraArgs || []),
    'about:blank'
  ];
  const chrome = spawn(chromePath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  chrome.stderr.on('data', (b) => { stderr += b.toString(); if (stderr.length > 20000) { stderr = stderr.slice(-20000); } });

  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 300 && !fs.existsSync(portFile); i += 1) {
    if (chrome.exitCode !== null) { throw new Error('Owned Chrome exited early: ' + stderr.slice(-800)); }
    await sleep(100);
  }
  if (!fs.existsSync(portFile)) { chrome.kill('SIGTERM'); throw new Error('Owned Chrome did not expose a DevTools port'); }
  const port = Number(fs.readFileSync(portFile, 'utf8').split('\n')[0]);
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pages = targets.filter((t) => t.type === 'page');
  if (pages.length !== 1 || pages[0].url !== 'about:blank') {
    chrome.kill('SIGTERM');
    throw new Error('Isolated browser inventory mismatch (expected one about:blank page)');
  }

  const socket = new WebSocket(pages[0].webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let sequence = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) { p.reject(new Error(`${p.method}: ${m.error.message}`)); } else { p.resolve(m.result); }
      return;
    }
    if (m.method && listeners.has(m.method)) {
      for (const fn of listeners.get(m.method)) { fn(m.params); }
    }
  });

  function call(method, params = {}, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++sequence;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)); }, timeoutMs);
      pending.set(id, {
        method,
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalJS(expression, { awaitPromise = true } = {}) {
    const x = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
    if (x.exceptionDetails) {
      const text = x.exceptionDetails.exception && x.exceptionDetails.exception.description;
      throw new Error('Page evaluation failed: ' + (text || x.exceptionDetails.text));
    }
    return x.result.value;
  }

  function on(method, fn) {
    if (!listeners.has(method)) { listeners.set(method, []); }
    listeners.get(method).push(fn);
  }

  async function navigate(url, { readyExpression, timeoutMs = 20000 } = {}) {
    await call('Page.navigate', { url });
    const expr = readyExpression || `location.href===${JSON.stringify(url)}&&document.readyState==='complete'&&[...document.images].every(x=>x.complete)`;
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      let ok = false;
      try { ok = await evalJS(expr); } catch (err) { ok = false; }
      if (ok) { return true; }
      await sleep(100);
    }
    throw new Error('Navigation did not settle: ' + url);
  }

  async function close() {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        await call('Browser.close').catch(() => {});
        socket.close();
      }
    } finally {
      if (chrome.exitCode === null) { chrome.kill('SIGTERM'); }
      await sleep(200);
      if (chrome.exitCode === null) { chrome.kill('SIGKILL'); }
      try { fs.rmSync(profile, { recursive: true, force: true }); } catch (err) { /* temp profile, best effort */ }
    }
  }

  /* Block every request the caller does not explicitly allow, before it is
     dispatched. Returns the ledger of blocked URLs. */
  async function restrictNetwork(allow) {
    const blocked = [];
    on('Fetch.requestPaused', (p) => {
      const url = p.request.url;
      if (allow(url)) {
        call('Fetch.continueRequest', { requestId: p.requestId }).catch(() => {});
      } else {
        blocked.push(url);
        call('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' }).catch(() => {});
      }
    });
    await call('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
    return blocked;
  }

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Network.enable');
  await call('Log.enable');

  return { call, evalJS, on, navigate, close, restrictNetwork, profile, chromePath, sleep };
}
