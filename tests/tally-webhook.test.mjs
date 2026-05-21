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

test('tally webhook maps the live Me8OxM field IDs when labels are omitted', () => {
  const input = extractTallyContactInput({
    eventId: 'evt_live_shape',
    data: {
      formId: 'Me8OxM',
      fields: [
        { key: 'd01a5f57-b028-4aa6-80dd-4a883478a9ec', value: 'Live Name' },
        { key: '92624bbd-b678-49a7-8ee7-ee56ccd26197', value: 'Live Business' },
        { key: '42157cf4-f26f-4a9a-a745-d4650e6e05b0', value: 'LIVE@example.com' },
        { key: '812bcd69-8197-4b45-b7d5-7e07da704c2a', value: '716-555-0101' },
        { key: '552e517f-d233-416e-a40d-7493ddc5bd99', value: 'Tally sends field IDs without labels.' },
      ],
    },
  });

  assert.equal(input.name, 'Live Name');
  assert.equal(input.business, 'Live Business');
  assert.equal(input.email, 'live@example.com');
  assert.equal(input.phone, '716-555-0101');
  assert.equal(input.pain, 'Tally sends field IDs without labels.');
});

test('tally webhook maps the actual Me8OxM payload from Tally request logs', () => {
  const input = extractTallyContactInput({
    eventId: 'd00e9d45-593f-4fc0-8bc4-a4416aa0e4ce',
    eventType: 'FORM_RESPONSE',
    createdAt: '2026-05-21T18:02:02.677Z',
    data: {
      responseId: '8NKeZPr',
      submissionId: '8NKeZPr',
      respondentId: 'ODbZGJg',
      formId: 'Me8OxM',
      formName: 'ClearPath Lead Form',
      fields: [
        { key: 'question_De2q1j', label: 'Full Name', type: 'INPUT_TEXT', value: 'Justin W Whalen' },
        { key: 'question_lRDaAp', label: 'Business Name\n', type: 'INPUT_TEXT', value: 'Holiday Valley' },
        { key: 'question_RLKW4p', label: 'Email', type: 'INPUT_EMAIL', value: 'Justin.whalen0@gmail.com' },
        { key: 'question_oO69BX', label: 'Phone', type: 'INPUT_PHONE_NUMBER', value: '17169696155' },
        {
          key: 'question_G0ve12',
          label: "What's one repetitive task eating your time right now?",
          type: 'TEXTAREA',
          value: 'test 4',
        },
      ],
    },
  });

  assert.equal(input.name, 'Justin W Whalen');
  assert.equal(input.business, 'Holiday Valley');
  assert.equal(input.email, 'justin.whalen0@gmail.com');
  assert.equal(input.phone, '17169696155');
  assert.equal(input.pain, 'test 4');
  assert.equal(input.notes, 'Imported from Tally submission d00e9d45-593f-4fc0-8bc4-a4416aa0e4ce.');
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
