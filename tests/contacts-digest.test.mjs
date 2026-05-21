import test from 'node:test';
import assert from 'node:assert/strict';

import { buildContactsDigest } from '../lib/contacts/digest.js';

const baseContact = {
  id: 'contact_base',
  type: 'lead',
  status: 'new',
  source: 'manual',
  name: 'Base Contact',
  business: 'Base Co',
  email: 'base@example.com',
  phone: '',
  pain: '',
  notes: '',
  priority: 'normal',
  nextAction: '',
  nextFollowUpAt: '',
  createdAt: '2026-05-21T12:00:00.000Z',
  updatedAt: '2026-05-21T12:00:00.000Z',
};

function contact(patch) {
  return { ...baseContact, ...patch };
}

test('contacts digest groups open needs-action contacts by reason', () => {
  const digest = buildContactsDigest({
    today: '2026-05-21',
    contacts: [
      contact({
        id: 'contact_overdue',
        name: 'Andy',
        business: 'B&B Group',
        email: 'andy@example.com',
        priority: 'high',
        nextAction: 'Call Andy after leadership meeting.',
        nextFollowUpAt: '2026-05-20',
      }),
      contact({
        id: 'contact_warm',
        name: 'Jordan',
        business: 'Warm Lodge',
        email: 'jordan@example.com',
        status: 'warm',
        nextAction: 'Send Workflow Check link.',
      }),
      contact({
        id: 'contact_high',
        name: 'Kelly',
        business: 'High Lodge',
        email: 'kelly@example.com',
        priority: 'high',
        nextAction: 'Ask about invoice routing pain.',
      }),
      contact({
        id: 'contact_scheduled',
        name: 'Scheduled',
        business: 'Scheduled Co',
        email: 'scheduled@example.com',
        status: 'warm',
        priority: 'high',
        nextFollowUpAt: '2026-05-28',
      }),
      contact({
        id: 'contact_closed',
        name: 'Closed',
        business: 'Closed Co',
        email: 'closed@example.com',
        status: 'closed',
        priority: 'high',
        nextFollowUpAt: '2026-05-20',
      }),
    ],
  });

  assert.equal(digest.today, '2026-05-21');
  assert.deepEqual(digest.counts, {
    total: 3,
    overdue: 1,
    warmUnscheduled: 1,
    highPriorityUnscheduled: 1,
  });
  assert.deepEqual(digest.groups.overdue.map((item) => item.business), ['B&B Group']);
  assert.deepEqual(digest.groups.warmUnscheduled.map((item) => item.business), ['Warm Lodge']);
  assert.deepEqual(digest.groups.highPriorityUnscheduled.map((item) => item.business), ['High Lodge']);
  assert.deepEqual(digest.items.map((item) => item.business), ['B&B Group', 'Warm Lodge', 'High Lodge']);
  assert.equal(digest.items[0].reason, 'overdue');
  assert.equal(digest.items[0].nextAction, 'Call Andy after leadership meeting.');
});

test('contacts digest does not double-count high-priority warm unscheduled contacts', () => {
  const digest = buildContactsDigest({
    today: '2026-05-21',
    contacts: [
      contact({
        id: 'contact_both',
        name: 'Both',
        business: 'Both Co',
        email: 'both@example.com',
        status: 'warm',
        priority: 'high',
        nextAction: 'Pick one reason only.',
      }),
    ],
  });

  assert.equal(digest.counts.total, 1);
  assert.equal(digest.counts.warmUnscheduled, 1);
  assert.equal(digest.counts.highPriorityUnscheduled, 0);
  assert.equal(digest.items[0].reason, 'warm_unscheduled');
});
