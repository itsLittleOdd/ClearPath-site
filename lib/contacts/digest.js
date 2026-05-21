function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isOpenContact(contact) {
  return !['closed', 'not_fit'].includes(contact.status);
}

function isOverdue(contact, today) {
  return isOpenContact(contact) && Boolean(contact.nextFollowUpAt) && contact.nextFollowUpAt < today;
}

function digestItem(contact, reason) {
  return {
    id: contact.id,
    reason,
    business: contact.business,
    name: contact.name,
    email: contact.email,
    phone: contact.phone || '',
    status: contact.status,
    source: contact.source,
    priority: contact.priority || 'normal',
    nextFollowUpAt: contact.nextFollowUpAt || '',
    nextAction: contact.nextAction || '',
    updatedAt: contact.updatedAt,
  };
}

export function buildContactsDigest({ contacts = [], today = todayIsoDate(), limit = 10 } = {}) {
  const day = cleanString(today) || todayIsoDate();
  const groups = {
    overdue: [],
    warmUnscheduled: [],
    highPriorityUnscheduled: [],
  };

  for (const contact of contacts) {
    if (!isOpenContact(contact)) continue;

    if (isOverdue(contact, day)) {
      groups.overdue.push(digestItem(contact, 'overdue'));
      continue;
    }

    if (contact.status === 'warm' && !contact.nextFollowUpAt) {
      groups.warmUnscheduled.push(digestItem(contact, 'warm_unscheduled'));
      continue;
    }

    if (contact.priority === 'high' && !contact.nextFollowUpAt) {
      groups.highPriorityUnscheduled.push(digestItem(contact, 'high_priority_unscheduled'));
    }
  }

  const items = [
    ...groups.overdue,
    ...groups.warmUnscheduled,
    ...groups.highPriorityUnscheduled,
  ].slice(0, limit);

  return {
    today: day,
    counts: {
      total: groups.overdue.length + groups.warmUnscheduled.length + groups.highPriorityUnscheduled.length,
      overdue: groups.overdue.length,
      warmUnscheduled: groups.warmUnscheduled.length,
      highPriorityUnscheduled: groups.highPriorityUnscheduled.length,
    },
    groups,
    items,
  };
}
