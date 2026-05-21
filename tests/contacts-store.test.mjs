import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMemoryContactsStore,
  createSupabaseContactsStore,
  validateContactInput,
} from '../lib/contacts/store.js';

test('manual leads are normalized and searchable by business, email, and notes', async () => {
  const store = createMemoryContactsStore();

  const created = await store.createContact({
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'kelly@example.com',
    phone: '716-555-0199',
    source: 'manual',
    pain: 'Invoice routing is slowing approvals.',
    notes: 'Asked about Workflow Check after a fit call.',
    nextAction: 'Send Workflow Check recap.',
  });

  assert.equal(created.type, 'lead');
  assert.equal(created.status, 'new');
  assert.equal(created.source, 'manual');
  assert.equal(created.priority, 'normal');
  assert.equal(created.nextAction, 'Send Workflow Check recap.');
  assert.equal(created.nextFollowUpAt, '');
  assert.match(created.id, /^contact_/);
  assert.ok(created.createdAt);
  assert.equal(created.updatedAt, created.createdAt);

  assert.equal((await store.searchContacts({ q: 'b&b' })).items[0].id, created.id);
  assert.equal((await store.searchContacts({ q: 'KELLY@EXAMPLE.COM' })).items[0].id, created.id);
  assert.equal((await store.searchContacts({ q: 'workflow check' })).items[0].id, created.id);
  assert.equal((await store.searchContacts({ q: 'recap' })).items[0].id, created.id);
});

test('search can filter contacts by type, status, and source', async () => {
  const store = createMemoryContactsStore();

  await store.createContact({
    name: 'New Lead',
    business: 'Lead Co',
    email: 'lead@example.com',
    source: 'manual',
  });
  await store.createContact({
    name: 'Tally Lead',
    business: 'Tally Co',
    email: 'tally@example.com',
    source: 'tally',
  });
  await store.createContact({
    name: 'Active Client',
    business: 'Client Co',
    email: 'client@example.com',
    type: 'client',
    status: 'active',
    source: 'manual',
  });

  const activeClients = await store.searchContacts({ type: 'client', status: 'active' });
  const tallyLeads = await store.searchContacts({ type: 'lead', source: 'tally' });

  assert.equal(activeClients.items.length, 1);
  assert.equal(activeClients.items[0].business, 'Client Co');
  assert.equal(tallyLeads.items.length, 1);
  assert.equal(tallyLeads.items[0].business, 'Tally Co');
});

test('search can filter overdue contacts before a supplied day', async () => {
  const store = createMemoryContactsStore();

  await store.createContact({
    name: 'Overdue Lead',
    business: 'Overdue Co',
    email: 'overdue@example.com',
    source: 'manual',
    nextFollowUpAt: '2026-05-20',
  });
  await store.createContact({
    name: 'Today Lead',
    business: 'Today Co',
    email: 'today@example.com',
    source: 'manual',
    nextFollowUpAt: '2026-05-21',
  });
  await store.createContact({
    name: 'Future Lead',
    business: 'Future Co',
    email: 'future@example.com',
    source: 'manual',
    nextFollowUpAt: '2026-05-28',
  });

  const overdue = await store.searchContacts({ action: 'overdue', today: '2026-05-21' });

  assert.deepEqual(overdue.items.map((contact) => contact.business), ['Overdue Co']);
});

test('search can filter contacts that need action', async () => {
  const store = createMemoryContactsStore();

  await store.createContact({
    name: 'Overdue Lead',
    business: 'Overdue Co',
    email: 'overdue@example.com',
    source: 'manual',
    nextFollowUpAt: '2026-05-20',
  });
  await store.createContact({
    name: 'Warm Unscheduled',
    business: 'Warm Co',
    email: 'warm@example.com',
    source: 'manual',
    status: 'warm',
  });
  await store.createContact({
    name: 'High Unscheduled',
    business: 'High Co',
    email: 'high@example.com',
    source: 'manual',
    priority: 'high',
  });
  await store.createContact({
    name: 'Scheduled Warm',
    business: 'Scheduled Co',
    email: 'scheduled@example.com',
    source: 'manual',
    status: 'warm',
    nextFollowUpAt: '2026-05-28',
  });
  await store.createContact({
    name: 'Closed Overdue',
    business: 'Closed Co',
    email: 'closed@example.com',
    source: 'manual',
    status: 'closed',
    nextFollowUpAt: '2026-05-20',
  });

  const needsAction = await store.searchContacts({ action: 'needs_action', today: '2026-05-21' });

  assert.deepEqual(
    needsAction.items.map((contact) => contact.business),
    ['High Co', 'Warm Co', 'Overdue Co'],
  );
});

test('manual lead validation requires name, business, email, and source', () => {
  const result = validateContactInput({
    name: '',
    business: '',
    email: 'not-an-email',
    source: 'manual',
  });

  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['business', 'email', 'name']);
});

test('possible duplicates are found by email or business before create', async () => {
  const store = createMemoryContactsStore();
  const original = await store.createContact({
    name: 'Justin Whalen',
    business: 'Holiday Valley',
    email: 'justin@example.com',
    source: 'manual',
  });

  const byEmail = await store.findDuplicateContacts({
    name: 'Justin W',
    business: 'Different Business',
    email: 'JUSTIN@example.com',
    source: 'manual',
  });
  const byBusiness = await store.findDuplicateContacts({
    name: 'Another Person',
    business: 'holiday valley',
    email: 'other@example.com',
    source: 'manual',
  });

  assert.equal(byEmail.items[0].id, original.id);
  assert.equal(byBusiness.items[0].id, original.id);
});

test('contacts can be moved through status and follow-up updates without losing created date', async () => {
  const store = createMemoryContactsStore();
  const created = await store.createContact({
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'kelly@example.com',
    source: 'manual',
  });

  const updated = await store.updateContact(created.id, {
    status: 'warm',
    priority: 'high',
    nextAction: 'Send Workflow Check link.',
    nextFollowUpAt: '2026-05-28',
    notes: 'Follow up this week.',
  });

  assert.equal(updated.status, 'warm');
  assert.equal(updated.priority, 'high');
  assert.equal(updated.nextAction, 'Send Workflow Check link.');
  assert.equal(updated.nextFollowUpAt, '2026-05-28');
  assert.equal(updated.notes, 'Follow up this week.');
  assert.equal(updated.createdAt, created.createdAt);
  assert.notEqual(updated.updatedAt, created.updatedAt);
});

function makeSupabaseFetchStub(handler) {
  const calls = [];
  const fetchStub = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const result = await handler(String(url), init, calls.length);
    return {
      ok: result.ok ?? true,
      status: result.status ?? 200,
      async json() {
        return result.json ?? [];
      },
      async text() {
        return result.text ?? '';
      },
    };
  };
  fetchStub.calls = calls;
  return fetchStub;
}

test('supabase contact creates write normalized duplicate fields without exposing secrets', async () => {
  const fetchStub = makeSupabaseFetchStub((url, init) => {
    assert.equal(url, 'https://example.supabase.co/rest/v1/clearpath_contacts');
    assert.equal(init.method, 'POST');
    assert.equal(init.headers.apikey, 'service-key');
    assert.equal(init.headers.Authorization, 'Bearer service-key');

    const row = JSON.parse(init.body);
    assert.equal(row.email, 'kelly@example.com');
    assert.equal(row.email_normalized, 'kelly@example.com');
    assert.equal(row.business, 'B&B Group');
    assert.equal(row.business_normalized, 'b&b group');
    assert.equal(row.priority, 'high');
    assert.equal(row.next_action, 'Call Andy after leadership meeting.');
    assert.equal(row.next_follow_up_at, '2026-05-28');
    assert.ok(row.created_at);
    assert.ok(row.updated_at);

    return { json: [{ ...row }] };
  });

  const store = createSupabaseContactsStore({
    url: 'https://example.supabase.co',
    serviceRoleKey: 'service-key',
    fetchImpl: fetchStub,
  });

  const contact = await store.createContact({
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'KELLY@EXAMPLE.COM',
    source: 'manual',
    priority: 'high',
    nextAction: 'Call Andy after leadership meeting.',
    nextFollowUpAt: '2026-05-28',
  });

  assert.equal(contact.email, 'kelly@example.com');
  assert.equal(contact.business, 'B&B Group');
  assert.equal(fetchStub.calls.length, 1);
});

test('supabase duplicate search uses normalized exact email or business matching', async () => {
  const fetchStub = makeSupabaseFetchStub((url) => {
    const parsed = new URL(url);
    assert.equal(parsed.origin + parsed.pathname, 'https://example.supabase.co/rest/v1/clearpath_contacts');
    assert.equal(parsed.searchParams.get('select'), '*');
    assert.equal(
      parsed.searchParams.get('or'),
      '(email_normalized.eq.kelly@example.com,business_normalized.eq.b&b group)',
    );
    assert.equal(parsed.searchParams.get('limit'), '5');

    return {
      json: [
        {
          id: 'contact_existing',
          type: 'lead',
          status: 'warm',
          source: 'manual',
          name: 'Kelly Smith',
          business: 'B&B Group',
          email: 'kelly@example.com',
          phone: '',
          pain: '',
          notes: '',
          priority: 'normal',
          next_action: 'Send recap.',
          next_follow_up_at: null,
          created_at: '2026-05-21T12:00:00.000Z',
          updated_at: '2026-05-21T12:00:00.000Z',
        },
      ],
    };
  });

  const store = createSupabaseContactsStore({
    url: 'https://example.supabase.co',
    serviceRoleKey: 'service-key',
    fetchImpl: fetchStub,
  });

  const duplicates = await store.findDuplicateContacts({
    business: ' B&B Group ',
    email: 'KELLY@EXAMPLE.COM',
  });

  assert.equal(duplicates.items.length, 1);
  assert.equal(duplicates.items[0].id, 'contact_existing');
});

test('supabase search sends readable PostgREST filters and maps rows back to contacts', async () => {
  const fetchStub = makeSupabaseFetchStub((url) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('type'), 'eq.client');
    assert.equal(parsed.searchParams.get('status'), 'eq.active');
    assert.equal(parsed.searchParams.get('source'), 'eq.tally');
    assert.equal(parsed.searchParams.get('or'), '(name.ilike.*invoice*,business.ilike.*invoice*,email.ilike.*invoice*,phone.ilike.*invoice*,pain.ilike.*invoice*,notes.ilike.*invoice*,next_action.ilike.*invoice*)');

    return {
      json: [
        {
          id: 'contact_client',
          type: 'client',
          status: 'active',
          source: 'manual',
          name: 'Jordan Lee',
          business: 'Ops Co',
          email: 'jordan@example.com',
          phone: null,
          pain: 'Invoice routing',
          notes: null,
          priority: 'high',
          next_action: 'Send Workflow Check link.',
          next_follow_up_at: '2026-05-28',
          created_at: '2026-05-21T12:00:00.000Z',
          updated_at: '2026-05-21T12:30:00.000Z',
        },
      ],
    };
  });

  const store = createSupabaseContactsStore({
    url: 'https://example.supabase.co',
    serviceRoleKey: 'service-key',
    fetchImpl: fetchStub,
  });

  const result = await store.searchContacts({ type: 'client', status: 'active', source: 'tally', q: 'invoice' });

  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].id, 'contact_client');
  assert.equal(result.items[0].phone, '');
  assert.equal(result.items[0].notes, '');
  assert.equal(result.items[0].priority, 'high');
  assert.equal(result.items[0].nextAction, 'Send Workflow Check link.');
  assert.equal(result.items[0].nextFollowUpAt, '2026-05-28');
});

test('supabase search can request overdue contacts before a supplied day', async () => {
  const fetchStub = makeSupabaseFetchStub((url) => {
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get('next_follow_up_at'), 'lt.2026-05-21');
    assert.equal(parsed.searchParams.get('status'), 'not.in.(closed,not_fit)');

    return { json: [] };
  });

  const store = createSupabaseContactsStore({
    url: 'https://example.supabase.co',
    serviceRoleKey: 'service-key',
    fetchImpl: fetchStub,
  });

  await store.searchContacts({ action: 'overdue', today: '2026-05-21' });
});

test('supabase search can request contacts that need action', async () => {
  const fetchStub = makeSupabaseFetchStub((url) => {
    const parsed = new URL(url);
    assert.equal(
      parsed.searchParams.get('or'),
      '(next_follow_up_at.lt.2026-05-21,and(status.eq.warm,next_follow_up_at.is.null),and(priority.eq.high,next_follow_up_at.is.null))',
    );
    assert.equal(parsed.searchParams.get('status'), 'not.in.(closed,not_fit)');

    return { json: [] };
  });

  const store = createSupabaseContactsStore({
    url: 'https://example.supabase.co',
    serviceRoleKey: 'service-key',
    fetchImpl: fetchStub,
  });

  await store.searchContacts({ action: 'needs_action', today: '2026-05-21' });
});
