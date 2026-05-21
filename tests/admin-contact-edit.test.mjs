import test from 'node:test';
import assert from 'node:assert/strict';

import { buildContactEditDraft, buildContactEditPatch } from '../lib/contacts/admin-edit.js';

test('admin contact edit draft copies editable fields from a contact', () => {
  const draft = buildContactEditDraft({
    id: 'contact_123',
    type: 'lead',
    status: 'new',
    source: 'tally',
    name: 'Justin Whalen',
    business: 'Holiday Valley',
    email: 'justin@example.com',
    phone: '716-555-0199',
    pain: 'Manual intake follow-up.',
    notes: 'Imported from Tally.',
    priority: 'high',
    nextAction: 'Call Andy after leadership meeting.',
    nextFollowUpAt: '2026-05-28',
    createdAt: '2026-05-21T12:00:00.000Z',
    updatedAt: '2026-05-21T12:30:00.000Z',
  });

  assert.deepEqual(draft, {
    type: 'lead',
    status: 'new',
    source: 'tally',
    name: 'Justin Whalen',
    business: 'Holiday Valley',
    email: 'justin@example.com',
    phone: '716-555-0199',
    pain: 'Manual intake follow-up.',
    notes: 'Imported from Tally.',
    priority: 'high',
    nextAction: 'Call Andy after leadership meeting.',
    nextFollowUpAt: '2026-05-28',
  });
});

test('admin contact edit patch trims text fields and excludes immutable fields', () => {
  const patch = buildContactEditPatch({
    id: 'contact_123',
    createdAt: '2026-05-21T12:00:00.000Z',
    updatedAt: '2026-05-21T12:30:00.000Z',
    type: ' prospect ',
    status: ' warm ',
    source: ' referral ',
    name: ' Justin W Whalen ',
    business: ' Holiday Valley ',
    email: ' Justin.Whalen0@Gmail.com ',
    phone: ' 17169696155 ',
    pain: ' Repetitive lead cleanup. ',
    notes: ' Call after weekend. ',
    priority: ' high ',
    nextAction: ' Send Workflow Check link. ',
    nextFollowUpAt: ' 2026-05-28 ',
  });

  assert.deepEqual(patch, {
    type: 'prospect',
    status: 'warm',
    source: 'referral',
    name: 'Justin W Whalen',
    business: 'Holiday Valley',
    email: 'justin.whalen0@gmail.com',
    phone: '17169696155',
    pain: 'Repetitive lead cleanup.',
    notes: 'Call after weekend.',
    priority: 'high',
    nextAction: 'Send Workflow Check link.',
    nextFollowUpAt: '2026-05-28',
  });
  assert.equal('id' in patch, false);
  assert.equal('createdAt' in patch, false);
  assert.equal('updatedAt' in patch, false);
});
