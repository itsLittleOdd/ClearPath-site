/* Unit tests for the contact draft module (pure functions, no DOM).
   Run: node --test tests/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const contact = require(path.join(ROOT, 'assets/contact.js'));

const GOOD = {
  name: '  Dana Example ',
  email: 'dana@example.com',
  topic: 'website',
  need: 'Our site still shows winter hours and the contact form goes to an old inbox. We need it to work.',
  current: 'A Wix site from 2019'
};

test('validate rejects an empty brief with one message per field', () => {
  const r = contact.validate({});
  assert.equal(r.ok, false);
  assert.deepEqual(Object.keys(r.errors).sort(), ['email', 'name', 'need', 'topic']);
  for (const msg of Object.values(r.errors)) { assert.ok(msg.length > 10); }
});

test('validate accepts a complete brief and trims whitespace', () => {
  const r = contact.validate(GOOD);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.fields.name, 'Dana Example');
});

test('validate checks email shape, topic membership and need length', () => {
  assert.ok(contact.validate({ ...GOOD, email: 'dana@' }).errors.email);
  assert.ok(contact.validate({ ...GOOD, email: 'dana example.com' }).errors.email);
  assert.ok(contact.validate({ ...GOOD, topic: 'buy-now' }).errors.topic);
  assert.ok(contact.validate({ ...GOOD, need: 'too short' }).errors.need);
  assert.ok(contact.validate({ ...GOOD, need: 'x'.repeat(contact.MAX_NEED + 1) }).errors.need);
  assert.ok(contact.validate({ ...GOOD, current: 'y'.repeat(201) }).errors.current);
  assert.equal(contact.validate({ ...GOOD, current: '' }).ok, true);
});

test('buildDraft produces a readable email addressed to Justin only', () => {
  const d = contact.buildDraft(GOOD);
  assert.equal(d.to, 'JWhalen@ClearPathWV.com');
  assert.equal(d.subject, 'Website quote request from Dana Example');
  assert.match(d.body, /^Hi Justin,\n/);
  assert.match(d.body, /I would like a quote for a website\./);
  assert.match(d.body, /What needs to work better:\nOur site still shows winter hours/);
  assert.match(d.body, /Current website or system: A Wix site from 2019/);
  assert.match(d.body, /Best reply address: dana@example\.com/);
  assert.match(d.body, /\nDana Example$/);
  assert.doesNotMatch(d.body, /—/);
});

test('buildDraft omits the optional line when empty and handles every topic', () => {
  const d = contact.buildDraft({ ...GOOD, current: '' });
  assert.doesNotMatch(d.body, /Current website or system/);
  for (const key of Object.keys(contact.TOPICS)) {
    const t = contact.buildDraft({ ...GOOD, topic: key });
    assert.ok(t.subject.startsWith(contact.TOPICS[key].subject), key);
    assert.ok(t.body.includes(contact.TOPICS[key].opening), key);
  }
});

test('buildMailto encodes subject and body and targets only the ClearPath address', () => {
  const href = contact.buildMailto(contact.buildDraft({ ...GOOD, need: 'Line one & two?\nLine three with 100% detail, enough characters here.' }));
  assert.ok(href.startsWith('mailto:JWhalen@ClearPathWV.com?subject='));
  assert.ok(href.includes('&body='));
  assert.match(href, /^[\x21-\x7E]+$/, 'href is printable ASCII only');
  const body = decodeURIComponent(href.split('&body=')[1]);
  assert.match(body, /Line one & two\?\nLine three with 100% detail/);
  assert.equal((href.match(/mailto:/g) || []).length, 1);
});

test('topicFromQuery only accepts known topics', () => {
  assert.equal(contact.topicFromQuery('?topic=website'), 'website');
  assert.equal(contact.topicFromQuery('?x=1&topic=support'), 'support');
  assert.equal(contact.topicFromQuery('?topic=<script>'), '');
  assert.equal(contact.topicFromQuery('?topic=unknown'), '');
  assert.equal(contact.topicFromQuery(''), '');
});

test('contact module source has no network, storage or HTML injection paths', () => {
  const src = fs.readFileSync(path.join(ROOT, 'assets/contact.js'), 'utf8');
  for (const needle of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'localStorage', 'sessionStorage', 'innerHTML', 'http://', 'https://', 'document.cookie']) {
    assert.ok(!src.includes(needle), needle);
  }
  assert.match(src, /event\.preventDefault\(\);/);
  assert.match(src, /reviewButton\.disabled = false;\s*\n\s*form\.setAttribute\('data-ready', '1'\)/);
});
