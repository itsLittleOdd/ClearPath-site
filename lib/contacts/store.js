const CONTACT_TYPES = new Set(['lead', 'prospect', 'client']);
const CONTACT_STATUSES = new Set(['new', 'warm', 'active', 'paused', 'closed', 'not_fit']);
const CONTACT_SOURCES = new Set(['manual', 'tally', 'cal', 'email', 'referral']);

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalString(value) {
  const cleaned = cleanString(value);
  return cleaned.length ? cleaned : '';
}

function normalizeMatch(value) {
  return cleanString(value).toLowerCase();
}

function normalizeStoredMatch(value) {
  return normalizeMatch(value);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function nextTimestamp(previous) {
  const now = Date.now();
  const previousTime = previous ? Date.parse(previous) : 0;
  return new Date(Math.max(now, previousTime + 1)).toISOString();
}

export function validateContactInput(input) {
  const errors = {};
  const name = cleanString(input?.name);
  const business = cleanString(input?.business);
  const email = cleanString(input?.email).toLowerCase();
  const source = cleanString(input?.source) || 'manual';
  const type = cleanString(input?.type) || 'lead';
  const status = cleanString(input?.status) || 'new';

  if (!name) errors.name = 'Name is required.';
  if (!business) errors.business = 'Business is required.';
  if (!email || !isEmail(email)) errors.email = 'A valid email is required.';
  if (!CONTACT_SOURCES.has(source)) errors.source = 'Source is not supported.';
  if (!CONTACT_TYPES.has(type)) errors.type = 'Contact type is not supported.';
  if (!CONTACT_STATUSES.has(status)) errors.status = 'Status is not supported.';

  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      type,
      status,
      source,
      name,
      business,
      email,
      phone: optionalString(input?.phone),
      pain: optionalString(input?.pain),
      notes: optionalString(input?.notes),
    },
  };
}

function contactSearchText(contact) {
  return [
    contact.name,
    contact.business,
    contact.email,
    contact.phone,
    contact.pain,
    contact.notes,
    contact.source,
    contact.type,
    contact.status,
  ]
    .join(' ')
    .toLowerCase();
}

function createContactId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `contact_${Date.now().toString(36)}_${random}`;
}

function duplicateMatches(contact, input) {
  const email = normalizeMatch(input?.email);
  const business = normalizeMatch(input?.business);
  return Boolean(
    (email && normalizeMatch(contact.email) === email) ||
      (business && normalizeMatch(contact.business) === business),
  );
}

function duplicateShape(contact) {
  return {
    id: contact.id,
    name: contact.name,
    business: contact.business,
    email: contact.email,
    phone: contact.phone,
    type: contact.type,
    status: contact.status,
    source: contact.source,
    updatedAt: contact.updatedAt,
  };
}

export function createMemoryContactsStore(seed = []) {
  const contacts = seed.map((contact) => ({ ...contact }));

  return {
    async createContact(input) {
      const parsed = validateContactInput(input);
      if (!parsed.ok) {
        const error = new Error('Invalid contact input.');
        error.status = 400;
        error.errors = parsed.errors;
        throw error;
      }

      const now = new Date().toISOString();
      const contact = {
        id: createContactId(),
        ...parsed.value,
        createdAt: now,
        updatedAt: now,
      };
      contacts.unshift(contact);
      return { ...contact };
    },

    async findDuplicateContacts(input) {
      return {
        items: contacts
          .filter((contact) => duplicateMatches(contact, input))
          .map(duplicateShape),
      };
    },

    async searchContacts(filters = {}) {
      const q = cleanString(filters.q).toLowerCase();
      const type = cleanString(filters.type);
      const status = cleanString(filters.status);
      const source = cleanString(filters.source);

      const items = contacts
        .filter((contact) => !type || contact.type === type)
        .filter((contact) => !status || contact.status === status)
        .filter((contact) => !source || contact.source === source)
        .filter((contact) => !q || contactSearchText(contact).includes(q))
        .map((contact) => ({ ...contact }));

      return { items };
    },

    async getContact(id) {
      const contact = contacts.find((item) => item.id === id);
      return contact ? { ...contact } : null;
    },

    async updateContact(id, patch) {
      const index = contacts.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const next = {
        ...contacts[index],
        ...Object.fromEntries(
          Object.entries(patch ?? {}).filter(([, value]) => value !== undefined),
        ),
        id: contacts[index].id,
        createdAt: contacts[index].createdAt,
        updatedAt: nextTimestamp(contacts[index].updatedAt),
      };

      const parsed = validateContactInput(next);
      if (!parsed.ok) {
        const error = new Error('Invalid contact input.');
        error.status = 400;
        error.errors = parsed.errors;
        throw error;
      }

      contacts[index] = { ...next, ...parsed.value };
      return { ...contacts[index] };
    },
  };
}

function toSupabaseRow(contact) {
  return {
    id: contact.id,
    type: contact.type,
    status: contact.status,
    source: contact.source,
    name: contact.name,
    business: contact.business,
    email: contact.email,
    email_normalized: normalizeStoredMatch(contact.email),
    business_normalized: normalizeStoredMatch(contact.business),
    phone: contact.phone,
    pain: contact.pain,
    notes: contact.notes,
    created_at: contact.createdAt,
    updated_at: contact.updatedAt,
  };
}

function fromSupabaseRow(row) {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    source: row.source,
    name: row.name,
    business: row.business,
    email: row.email,
    phone: row.phone ?? '',
    pain: row.pain ?? '',
    notes: row.notes ?? '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cleanPostgrestPattern(value) {
  return value.replaceAll('*', '').replaceAll(',', ' ');
}

function likePattern(value) {
  return `*${cleanPostgrestPattern(value)}*`;
}

function postgrestFilterValue(value) {
  return cleanString(value).replaceAll(',', ' ');
}

export function createSupabaseContactsStore({
  url,
  serviceRoleKey,
  table = 'clearpath_contacts',
  fetchImpl = globalThis.fetch,
}) {
  if (!url || !serviceRoleKey) throw new Error('Supabase URL and service role key are required.');
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required.');
  const baseUrl = `${url.replace(/\/$/, '')}/rest/v1/${table}`;
  const headers = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  async function request(path = '', init = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...init.headers } });
    if (!response.ok) {
      const detail = await response.text();
      const error = new Error(`Supabase request failed: ${response.status}`);
      error.status = response.status;
      error.detail = detail;
      throw error;
    }
    return response.status === 204 ? null : response.json();
  }

  return {
    async createContact(input) {
      const parsed = validateContactInput(input);
      if (!parsed.ok) {
        const error = new Error('Invalid contact input.');
        error.status = 400;
        error.errors = parsed.errors;
        throw error;
      }

      const now = new Date().toISOString();
      const contact = {
        id: createContactId(),
        ...parsed.value,
        createdAt: now,
        updatedAt: now,
      };
      const rows = await request('', { method: 'POST', body: JSON.stringify(toSupabaseRow(contact)) });
      return fromSupabaseRow(rows[0]);
    },

    async findDuplicateContacts(input) {
      const email = normalizeMatch(input?.email);
      const business = normalizeMatch(input?.business);
      if (!email && !business) return { items: [] };

      const ors = [];
      if (email) ors.push(`email_normalized.eq.${postgrestFilterValue(email)}`);
      if (business) ors.push(`business_normalized.eq.${postgrestFilterValue(business)}`);
      const params = new URLSearchParams({ select: '*', or: `(${ors.join(',')})`, limit: '5' });
      const rows = await request(`?${params.toString()}`);
      return { items: rows.map(fromSupabaseRow).map(duplicateShape) };
    },

    async searchContacts(filters = {}) {
      const params = new URLSearchParams({ select: '*', order: 'updated_at.desc', limit: '100' });
      const type = cleanString(filters.type);
      const status = cleanString(filters.status);
      const source = cleanString(filters.source);
      const q = cleanString(filters.q);
      if (type) params.set('type', `eq.${type}`);
      if (status) params.set('status', `eq.${status}`);
      if (source) params.set('source', `eq.${source}`);
      if (q) {
        const like = likePattern(q);
        params.set('or', `(name.ilike.${like},business.ilike.${like},email.ilike.${like},phone.ilike.${like},pain.ilike.${like},notes.ilike.${like})`);
      }
      const rows = await request(`?${params.toString()}`);
      return { items: rows.map(fromSupabaseRow) };
    },

    async getContact(id) {
      const rows = await request(`?id=eq.${encodeURIComponent(id)}&select=*&limit=1`);
      return rows[0] ? fromSupabaseRow(rows[0]) : null;
    },

    async updateContact(id, patch) {
      const existing = await this.getContact(id);
      if (!existing) return null;
      const next = { ...existing, ...patch, updatedAt: nextTimestamp(existing.updatedAt) };
      const parsed = validateContactInput(next);
      if (!parsed.ok) {
        const error = new Error('Invalid contact input.');
        error.status = 400;
        error.errors = parsed.errors;
        throw error;
      }
      const rows = await request(`?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(toSupabaseRow({ ...next, ...parsed.value })),
      });
      return rows[0] ? fromSupabaseRow(rows[0]) : null;
    },
  };
}

let memoryStore;

export function getContactsStore() {
  const mode = process.env.CLEARPATH_CONTACTS_STORAGE || (process.env.NODE_ENV === 'production' ? 'supabase' : 'memory');

  if (mode === 'memory') {
    if (!memoryStore) memoryStore = createMemoryContactsStore();
    return memoryStore;
  }

  if (mode === 'supabase') {
    return createSupabaseContactsStore({
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      table: process.env.CLEARPATH_CONTACTS_TABLE || 'clearpath_contacts',
    });
  }

  throw new Error(`Unsupported contacts storage mode: ${mode}`);
}

export const CONTACT_OPTIONS = {
  types: [...CONTACT_TYPES],
  statuses: [...CONTACT_STATUSES],
  sources: [...CONTACT_SOURCES],
};
