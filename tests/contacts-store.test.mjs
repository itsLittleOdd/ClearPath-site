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
  });

  assert.equal(created.type, 'lead');
  assert.equal(created.status, 'new');
  assert.equal(created.source, 'manual');
  assert.match(created.id, /^contact_/);
  assert.ok(created.createdAt);
  assert.equal(created.updatedAt, created.createdAt);

  assert.equal((await store.searchContacts({ q: 'b&b' })).items[0].id, created.id);
  assert.equal((await store.searchContacts({ q: 'KELLY@EXAMPLE.COM' })).items[0].id, created.id);
  assert.equal((await store.searchContacts({ q: 'workflow check' })).items[0].id, created.id);
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

test('contacts can be moved through status updates without losing created date', async () => {
  const store = createMemoryContactsStore();
  const created = await store.createContact({
    name: 'Kelly Smith',
    business: 'B&B Group',
    email: 'kelly@example.com',
    source: 'manual',
  });

  const updated = await store.updateContact(created.id, { status: 'warm', notes: 'Follow up this week.' });

  assert.equal(updated.status, 'warm');
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
    assert.equal(parsed.searchParams.get('or'), '(name.ilike.*invoice*,business.ilike.*invoice*,email.ilike.*invoice*,phone.ilike.*invoice*,pain.ilike.*invoice*,notes.ilike.*invoice*)');

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
});
