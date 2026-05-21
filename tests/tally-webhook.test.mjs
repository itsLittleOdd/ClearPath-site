import test from 'node:test';
import assert from 'node:assert/strict';

import { createMemoryContactsStore } from '../lib/contacts/store.js';
import {
  extractTallyContactInput,
  processTallyWebhookSubmission,
  verifyTallyWebhookSecret,
} from '../lib/contacts/tally.js';

test('tally webhook fields are mapped into a ClearPath contact input', () => {
  const input = extractTallyContactInput({
    eventId: 'evt_test_123',
    data: {
      formName: 'ClearPath Lead Intake',
      fields: [
        { key: 'name', label: 'Full name', value: ' Kelly Smith ' },
        { key: 'business', label: 'Business name', value: ' B&B Group ' },
        { key: 'email', label: 'Email', value: 'KELLY@EXAMPLE.COM' },
        { key: 'phone', label: 'Phone', value: '716-555-0199' },
        {
          key: 'pain',
          label: "What's one repetitive task eating your time right now?",
          value: 'Invoice routing is slowing approvals.',
        },
      ],
    },
  });

  assert.deepEqual(input, {
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'kelly@example.com',
    phone: '716-555-0199',
    pain: 'Invoice routing is slowing approvals.',
    notes: 'Imported from Tally submission evt_test_123.',
    source: 'tally',
    type: 'lead',
    status: 'new',
  });
});

test('tally webhook accepts common payload shapes and readable field titles', () => {
  const input = extractTallyContactInput({
    submissionId: 'sub_456',
    fields: [
      { title: 'Your name', answer: { value: 'Jordan Lee' } },
      { title: 'Company', answer: 'Ops Co' },
      { title: 'Email address', value: 'jordan@example.com' },
      { title: 'Phone number', value: null },
      { title: 'Workflow issue or pain point', value: 'Approval follow-up lives in inboxes.' },
    ],
  });

  assert.equal(input.name, 'Jordan Lee');
  assert.equal(input.business, 'Ops Co');
  assert.equal(input.email, 'jordan@example.com');
  assert.equal(input.phone, '');
  assert.equal(input.pain, 'Approval follow-up lives in inboxes.');
  assert.equal(input.notes, 'Imported from Tally submission sub_456.');
});

test('tally webhook secret must match the configured secret', () => {
  assert.equal(verifyTallyWebhookSecret({ provided: 'secret-one', configured: 'secret-one' }).ok, true);
  assert.equal(verifyTallyWebhookSecret({ provided: 'wrong', configured: 'secret-one' }).ok, false);
  assert.equal(verifyTallyWebhookSecret({ provided: '', configured: 'secret-one' }).status, 401);
  assert.equal(verifyTallyWebhookSecret({ provided: 'anything', configured: '' }).status, 503);
});

test('tally webhook creates a contact when no duplicate exists', async () => {
  const store = createMemoryContactsStore();
  const result = await processTallyWebhookSubmission({
    payload: {
      eventId: 'evt_create',
      data: {
        fields: [
          { label: 'Name', value: 'Kelly Smith' },
          { label: 'Business', value: 'B&B Group' },
          { label: 'Email', value: 'kelly@example.com' },
          { label: 'Pain point', value: 'Invoice routing.' },
        ],
      },
    },
    providedSecret: 'good-secret',
    configuredSecret: 'good-secret',
    store,
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.contact.source, 'tally');
  assert.equal((await store.searchContacts({ q: 'B&B' })).items.length, 1);
});

test('tally webhook returns ok without creating a duplicate contact', async () => {
  const store = createMemoryContactsStore();
  const existing = await store.createContact({
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'kelly@example.com',
    source: 'manual',
  });

  const result = await processTallyWebhookSubmission({
    payload: {
      data: {
        fields: [
          { label: 'Name', value: 'Kelly Smith' },
          { label: 'Business', value: 'B&B Group' },
          { label: 'Email', value: 'KELLY@example.com' },
          { label: 'Pain point', value: 'Invoice routing.' },
        ],
      },
    },
    providedSecret: 'good-secret',
    configuredSecret: 'good-secret',
    store,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.duplicate, true);
  assert.equal(result.body.duplicates[0].id, existing.id);
  assert.equal((await store.searchContacts({ q: 'kelly@example.com' })).items.length, 1);
});
