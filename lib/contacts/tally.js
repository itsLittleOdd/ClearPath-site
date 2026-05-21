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
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
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
  return normalizeKey(field?.key || field?.label || field?.title || field?.name || field?.question || field?.id);
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
