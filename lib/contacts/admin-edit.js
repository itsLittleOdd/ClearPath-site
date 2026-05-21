const EDITABLE_FIELDS = [
  'type',
  'status',
  'source',
  'name',
  'business',
  'email',
  'phone',
  'pain',
  'notes',
  'priority',
  'nextFollowUpAt',
];

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function buildContactEditDraft(contact = {}) {
  return Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, cleanString(contact[field])]));
}

export function buildContactEditPatch(draft = {}) {
  const patch = Object.fromEntries(EDITABLE_FIELDS.map((field) => [field, cleanString(draft[field])]));
  patch.email = patch.email.toLowerCase();
  return patch;
}
