/* Regression tests from the first controller verification (2026-10-16).
   1. Website Manager approval/publish/reset state machine, run against the
      real engine (assets/website-manager.js) inside a tiny DOM shim.
   2. Source invariants for the parked sticky bar, the raw-path traversal
      transport, the browser-check readiness waits and media tolerance.
   Run: node --test tests/test_review_regressions.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

/* ---------- minimal DOM shim: enough for the Website Manager engine ---------- */
class El {
  constructor(doc, tag, attrs = {}) {
    this.doc = doc; this.tagName = tag.toUpperCase(); this.attrs = { ...attrs }; this.children = []; this.parent = null;
    this.listeners = {}; this._text = ''; this.hidden = false; this.disabled = false; this.value = ''; this.className = '';
    if (attrs.id) { doc.byId[attrs.id] = this; }
  }
  getAttribute(n) { return n in this.attrs ? this.attrs[n] : null; }
  setAttribute(n, v) { this.attrs[n] = String(v); }
  addEventListener(t, f) { (this.listeners[t] = this.listeners[t] || []).push(f); }
  dispatch(t) { for (const f of this.listeners[t] || []) { f({ target: this, preventDefault() {} }); } }
  appendChild(c) { this.children.push(c); c.parent = this; return c; }
  removeChild(c) { this.children.splice(this.children.indexOf(c), 1); c.parent = null; }
  get firstChild() { return this.children[0] || null; }
  get textContent() { return this.children.length ? this.children.map((c) => c.textContent).join('') : this._text; }
  set textContent(v) { this.children = []; this._text = String(v); }
  focus() { this.doc.activeElement = this; }
  matches(sel) {
    const m = /^\[([a-z-]+)(?:="([^"]*)")?\]$/.exec(sel.trim());
    if (!m) { throw new Error('shim selector unsupported: ' + sel); }
    if (!(m[1] in this.attrs)) { return false; }
    return m[2] === undefined || this.attrs[m[1]] === m[2];
  }
  querySelectorAll(sel) { const out = []; const walk = (n) => { for (const c of n.children) { if (c.matches(sel)) { out.push(c); } walk(c); } }; walk(this); return out; }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

function makeDocument() {
  const doc = { byId: {}, activeElement: null };
  doc.createElement = (tag) => new El(doc, tag);
  doc.getElementById = (id) => doc.byId[id] || null;
  const root = new El(doc, 'body');
  doc.querySelectorAll = (sel) => root.querySelectorAll(sel);
  const el = (tag, attrs, parent) => parent.appendChild(new El(doc, tag, attrs));
  el('div', { id: 'demo-fallback' }, root);
  const shell = el('div', { id: 'demo-shell' }, root); shell.hidden = true;
  const mount = el('div', { 'data-demo': 'website-manager' }, shell);
  for (const item of ['hours', 'event', 'note']) { el('button', { 'data-item': item, 'aria-pressed': 'false' }, mount); }
  el('div', { 'data-role': 'published' }, mount);
  const input = el('input', { 'data-role': 'draft-input' }, mount); input.disabled = true;
  el('div', { 'data-role': 'summary' }, mount);
  const preview = el('div', { 'data-role': 'preview' }, mount);
  for (const line of ['hours', 'event', 'note']) { el('span', { 'data-line': line }, preview); }
  el('span', { 'data-role': 'pub-badge' }, mount).textContent = 'Preview';
  const note = el('p', { 'data-role': 'pub-note' }, mount); note.hidden = true;
  const approve = el('button', { 'data-role': 'approve' }, mount); approve.disabled = true;
  const publish = el('button', { 'data-role': 'publish' }, mount); publish.disabled = true;
  el('button', { 'data-role': 'reset' }, mount);
  el('p', { 'data-role': 'status' }, mount);
  el('span', { 'data-role': 'state-chip' }, mount);
  el('span', { 'data-role': 'approve-chip' }, mount);
  return { doc, mount };
}

function bootManager() {
  const { doc, mount } = makeDocument();
  vm.runInNewContext(read('assets/website-manager.js'), { document: doc, window: {} });
  const q = (sel) => mount.querySelector(sel);
  const api = {
    doc, mount,
    select: (item) => q(`[data-item="${item}"]`).dispatch('click'),
    type: (v) => { q('[data-role="draft-input"]').value = v; q('[data-role="draft-input"]').dispatch('input'); },
    approve: () => { if (q('[data-role="approve"]').disabled) { return false; } q('[data-role="approve"]').dispatch('click'); return true; },
    publish: () => { if (q('[data-role="publish"]').disabled) { return false; } q('[data-role="publish"]').dispatch('click'); return true; },
    reset: () => q('[data-role="reset"]').dispatch('click'),
    state: () => ({
      badge: q('[data-role="pub-badge"]').textContent,
      noteHidden: q('[data-role="pub-note"]').hidden,
      chip: q('[data-role="approve-chip"]').textContent,
      stateChip: q('[data-role="state-chip"]').textContent,
      approveDisabled: q('[data-role="approve"]').disabled,
      publishDisabled: q('[data-role="publish"]').disabled,
      published: q('[data-role="published"]').textContent,
      preview: q('[data-line="hours"]').textContent,
      summary: q('[data-role="summary"]').textContent,
      status: q('[data-role="status"]').textContent
    })
  };
  assert.equal(mount.getAttribute('data-ready'), '1', 'engine wired the mount');
  assert.equal(doc.getElementById('demo-shell').hidden, false, 'shell revealed after wiring');
  return api;
}

test('Website Manager: publish is locked before approval and the published value survives edits', () => {
  const m = bootManager();
  m.select('hours');
  assert.equal(m.state().published, 'Sunday: 8:00 am to 2:00 pm');
  m.type('Sunday: 9:00 am to 3:00 pm');
  assert.equal(m.publish(), false, 'publish refused before approval');
  assert.equal(m.state().publishDisabled, true);
  assert.equal(m.approve(), true);
  assert.equal(m.publish(), true);
  const s = m.state();
  assert.equal(s.badge, 'Published (demo)');
  assert.equal(s.noteHidden, false);
  assert.equal(s.published, 'Sunday: 9:00 am to 3:00 pm');
  assert.equal(s.publishDisabled, true, 'cannot publish the same value twice');
});

test('Website Manager: a new unapproved edit after publishing withdraws every published indicator', () => {
  const m = bootManager();
  m.select('hours'); m.type('Sunday: 9:00 am to 3:00 pm'); m.approve(); m.publish();
  m.type('Sunday: 10:00 am to 2:00 pm');
  const s = m.state();
  assert.equal(s.badge, 'Preview', 'badge no longer claims the preview is published');
  assert.equal(s.noteHidden, true, 'published note hidden');
  assert.equal(s.chip, 'Approval required');
  assert.equal(s.publishDisabled, true, 'fresh approval required before publishing again');
  assert.equal(s.approveDisabled, false);
  assert.equal(s.published, 'Sunday: 9:00 am to 3:00 pm', 'actual published value preserved');
  assert.equal(s.preview, 'Sunday: 10:00 am to 2:00 pm', 'preview shows the draft, labeled as preview');
  assert.equal(m.publish(), false);
  m.approve();
  assert.equal(m.state().chip, 'Approved for demo');
  assert.equal(m.publish(), true);
  assert.equal(m.state().published, 'Sunday: 10:00 am to 2:00 pm');
});

test('Website Manager: clearing an approved draft resets the approval chip and keeps the published value', () => {
  const m = bootManager();
  m.select('hours'); m.type('Sunday: 9:00 am to 3:00 pm'); m.approve(); m.publish();
  m.type('Sunday: 11:00 am to 1:00 pm'); m.approve();
  assert.equal(m.state().chip, 'Approved for demo');
  m.type('');
  const s = m.state();
  assert.equal(s.chip, 'Waiting for a draft', 'stale approval chip cleared');
  assert.equal(s.badge, 'Preview');
  assert.equal(s.noteHidden, true);
  assert.equal(s.approveDisabled, true);
  assert.equal(s.publishDisabled, true);
  assert.equal(s.published, 'Sunday: 9:00 am to 3:00 pm');
  assert.match(s.summary, /Published value unchanged: Sunday: 9:00 am to 3:00 pm/);
  assert.equal(m.publish(), false);
  assert.equal(m.approve(), false);
});

test('Website Manager: draft equal to the published value is not approvable; reset restores the baseline', () => {
  const m = bootManager();
  m.select('hours'); m.type('Sunday: 9:00 am to 3:00 pm'); m.approve(); m.publish();
  m.type('Sunday: 9:00 am to 3:00 pm');
  assert.equal(m.state().approveDisabled, true);
  assert.equal(m.state().chip, 'Waiting for a draft');
  assert.equal(m.state().badge, 'Preview');
  m.type('<b>Sunday: closed</b>');
  assert.equal(m.state().preview, '<b>Sunday: closed</b>', 'typed markup stays literal text');
  m.reset();
  const s = m.state();
  assert.equal(s.preview, 'Sunday: 8:00 am to 2:00 pm');
  assert.equal(s.published, 'Pick an item to load its published value.');
  assert.equal(s.badge, 'Preview');
  assert.equal(s.noteHidden, true);
  assert.equal(s.chip, 'Waiting for a draft');
  m.select('hours');
  assert.equal(m.state().published, 'Sunday: 8:00 am to 2:00 pm', 'baseline value after reset');
});

/* ---------- source invariants ---------- */
test('parked sticky bar is inert, hidden to assistive tech, and never parks while it owns focus', () => {
  const js = read('assets/site.js');
  assert.match(js, /sticky\.contains\(document\.activeElement\)/);
  assert.match(js, /setAttribute\('inert', ''\)/);
  assert.match(js, /setAttribute\('aria-hidden', 'true'\)/);
  assert.match(js, /removeAttribute\('inert'\)/);
  const css = read('assets/site.css');
  assert.match(css, /\.sticky-cta\.is-parked\{visibility:hidden/);
  const pricing = read('pricing/index.html');
  assert.match(pricing, /<nav class="sticky-cta" data-sticky-cta aria-label="Quote shortcut">/);
  assert.doesNotMatch(pricing, /<div class="sticky-cta"/);
});

test('320 px reflow: prices may wrap and shrinkable containers have min-width 0', () => {
  const css = read('assets/site.css');
  assert.match(css, /\.ledger \.price,\.summary-prices \.price,\.service-aside \.line \.price\{white-space:normal/);
  assert.match(css, /\.summary-prices li>span:first-child,\.service-aside \.line>span:first-child\{min-width:0/);
  assert.match(css, /\.price-sheet,\.service,\.service-aside[^}]*min-width:0/);
  assert.doesNotMatch(css, /html\{[^}]*overflow-x:hidden/, 'overflow must not be concealed');
  assert.doesNotMatch(css, /body\{[^}]*overflow-x:hidden/, 'overflow must not be concealed');
});

test('browser proof: raw traversal transport, settled waits, exact media tolerance, 320 coverage', () => {
  const server = read('tests/test_server.mjs');
  assert.doesNotMatch(server, /new URL\(url\)/, 'rawRequest must not normalize the request target');
  assert.match(server, /\/%2e%2e\/index\.html/);
  const check = read('tests/browser-check.mjs');
  assert.match(check, /\[320, 568\]/);
  assert.match(check, /toleratedMissing\.has\(/);
  assert.doesNotMatch(check, /loadingFailed\|404\|media\|poster\|request-demo/, 'no blanket error suppression');
  assert.match(check, /const SETTLED =/);
  assert.match(check, /restrictNetwork\(/);
  assert.match(check, /setScriptExecutionDisabled/);
  assert.match(check, /shiftTab/);
  assert.match(check, /CONTACT_MARKERS/);
  assert.match(check, /captureBeyondViewport: true, clip:/);
});

test('renderers and release builder route every output through the containment module', () => {
  for (const file of ['tools/render-video.mjs', 'tools/render-brand.mjs', 'tools/build-release.mjs']) {
    const src = read(file);
    assert.match(src, /from '\.\/lib\/output-paths\.mjs'/, file);
    assert.match(src, /resolveOutput\(/, file);
    assert.match(src, /parseFlags\(/, file);
  }
  const release = read('tools/build-release.mjs');
  assert.doesNotMatch(release, /rmSync/, 'release builder never deletes');
  assert.match(release, /COPYFILE_EXCL/);
  const video = read('tools/render-video.mjs');
  assert.match(video, /isOwnedScratch\(framesDir/);
});

test('video composition keeps the review card and the sheet chip in separate areas and asks for the address', () => {
  const comp = read('creative/request-demo/composition.html');
  assert.match(comp, /\.review\{left:56px;top:430px;width:520px/);
  assert.match(comp, /\.chip\{[^}]*white-space:nowrap/);
  assert.match(comp, /What address should we deliver to\? Once I have it, I will check/);
  assert.doesNotMatch(comp, /works for a drop off/);
  assert.match(comp, /Nothing is sent until the owner decides\./);
});
