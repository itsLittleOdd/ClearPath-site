const FIELD_ID_ALIASES = {
  // ClearPath Lead Form (Tally form Me8OxM). Tally webhooks can send field
  // IDs or question_* keys, so keep these server-side aliases as a fallback.
  'd01a5f57-b028-4aa6-80dd-4a883478a9ec': 'name',
  '5ad752df-8448-4197-a76c-b69af650b742': 'name',
  question_de2q1j: 'name',
  '92624bbd-b678-49a7-8ee7-ee56ccd26197': 'business',
  '2d77da09-3fc7-426c-8b91-d26c5e23d706': 'business',
  question_lrdaap: 'business',
  '42157cf4-f26f-4a9a-a745-d4650e6e05b0': 'email',
  '8a9dec60-c2b1-47f8-90cf-c020931166a9': 'email',
  question_rlkw4p: 'email',
  '812bcd69-8197-4b45-b7d5-7e07da704c2a': 'phone',
  '797862b4-441d-4b5c-a6a9-09c26ee1bea7': 'phone',
  question_oo69bx: 'phone',
  '552e517f-d233-416e-a40d-7493ddc5bd99': 'pain',
  'd571a6e9-bbaa-4dfc-bd81-2a18265301b1': 'pain',
  question_g0ve12: 'pain',
};

function cleanString(value) {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(cleanString).filter(Boolean).join(', ');
  if (typeof value === 'object') {
    if ('value' in value) return cleanString(value.value);
    if ('answer' in value) return cleanString(value.answer);
    if ('label' in value) return cleanString(value.label);
    return '';
  }
  return String(value).trim();
}

function normalizeKey(value) {
  return cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, ' ')
    .trim();
}

function normalizeAliasKey(value) {
  return cleanString(value).toLowerCase();
}

function fieldKeys(field) {
  return [field?.key, field?.label, field?.title, field?.name, field?.question, field?.id]
    .map(cleanString)
    .filter(Boolean);
}

function submissionId(payload) {
  return cleanString(
    payload?.eventId ||
      payload?.submissionId ||
      payload?.responseId ||
      payload?.data?.submissionId ||
      payload?.data?.responseId ||
      payload?.data?.id ||
      payload?.id,
  );
}

function collectFields(value, fields = []) {
  if (!value || typeof value !== 'object') return fields;
  if (Array.isArray(value)) {
    for (const item of value) collectFields(item, fields);
    return fields;
  }

  if (Array.isArray(value.fields)) fields.push(...value.fields);
  if (Array.isArray(value.questions)) fields.push(...value.questions);
  if (Array.isArray(value.answers)) fields.push(...value.answers);

  if (value.data && typeof value.data === 'object') collectFields(value.data, fields);
  if (value.response && typeof value.response === 'object') collectFields(value.response, fields);
  return fields;
}

function fieldName(field) {
  const keys = fieldKeys(field);
  for (const key of keys) {
    const alias = FIELD_ID_ALIASES[normalizeAliasKey(key)];
    if (alias) return alias;
  }
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (normalized) return normalized;
  }
  return '';
}

function fieldValue(field) {
  return cleanString(field?.value ?? field?.answer ?? field?.text ?? field?.label);
}

function pick(mapped, candidates) {
  for (const candidate of candidates) {
    if (mapped.has(candidate)) return mapped.get(candidate);
  }
  for (const [key, value] of mapped.entries()) {
    if (candidates.some((candidate) => key.includes(candidate))) return value;
  }
  return '';
}

export function extractTallyContactInput(payload) {
  const mapped = new Map();
  for (const field of collectFields(payload)) {
    const name = fieldName(field);
    const value = fieldValue(field);
    if (name && value && !mapped.has(name)) mapped.set(name, value);
  }

  const id = submissionId(payload);
  const notes = id ? `Imported from Tally submission ${id}.` : 'Imported from Tally submission.';

  return {
    name: pick(mapped, ['name', 'full name', 'your name']),
    business: pick(mapped, ['business', 'business name', 'company', 'organization', 'company name']),
    email: pick(mapped, ['email', 'email address']).toLowerCase(),
    phone: pick(mapped, ['phone', 'phone number', 'telephone']),
    pain: pick(mapped, ['pain', 'pain point', 'workflow issue', 'repetitive task', 'task eating your time']),
    notes,
    source: 'tally',
    type: 'lead',
    status: 'new',
  };
}

export function verifyTallyWebhookSecret({ provided, configured }) {
  const expected = cleanString(configured);
  const actual = cleanString(provided);

  if (!expected) {
    return { ok: false, status: 503, error: 'CLEARPATH_TALLY_WEBHOOK_SECRET is not configured.' };
  }
  if (!actual || actual !== expected) {
    return { ok: false, status: 401, error: 'Unauthorized.' };
  }
  return { ok: true, status: 200 };
}

export async function processTallyWebhookSubmission({ payload, providedSecret, configuredSecret, store }) {
  const auth = verifyTallyWebhookSecret({ provided: providedSecret, configured: configuredSecret });
  if (!auth.ok) return { status: auth.status, body: { ok: false, error: auth.error } };

  const input = extractTallyContactInput(payload);
  const duplicates = await store.findDuplicateContacts(input);
  if (duplicates.items.length > 0) {
    return {
      status: 200,
      body: {
        ok: true,
        duplicate: true,
        created: false,
        duplicates: duplicates.items,
      },
    };
  }

  const contact = await store.createContact(input);
  return { status: 201, body: { ok: true, created: true, contact } };
}
