# ClearPath Contacts Digest Endpoint

Adds a token-protected admin endpoint for summarizing contacts that need attention.

## Endpoint

```text
GET /api/admin/contacts/digest
```

Required header:

```text
Authorization: Bearer [CLEARPATH_ADMIN_TOKEN]
```

Optional query params:

- `today=YYYY-MM-DD` for deterministic testing or manual checks
- `limit=10` to cap the top `items` list

## Response shape

```json
{
  "ok": true,
  "digest": {
    "today": "2026-05-21",
    "counts": {
      "total": 3,
      "overdue": 1,
      "warmUnscheduled": 1,
      "highPriorityUnscheduled": 1
    },
    "groups": {
      "overdue": [],
      "warmUnscheduled": [],
      "highPriorityUnscheduled": []
    },
    "items": []
  }
}
```

## Digest logic

Open contacts only. Closed and not-fit contacts are excluded.

Priority order:

1. Overdue follow-up: `nextFollowUpAt` before today
2. Warm unscheduled: `status=warm` and no follow-up date
3. High priority unscheduled: `priority=high` and no follow-up date

A contact appears in only one group. For example, a warm + high-priority unscheduled contact is counted as warm unscheduled, not both.

## Why endpoint first

This creates a stable payload for a future daily Discord digest without sending scheduled notifications yet. Once the payload is useful, delivery is the easy part.

## Verification

```bash
npm run test:contacts
npm run lint
npm run build
```

Manual local/prod smoke pattern:

```bash
TOKEN="[REDACTED]"
curl -s "https://www.clearpathwv.com/api/admin/contacts/digest?limit=5" \
  -H "Authorization: Bearer $TOKEN"
```

Do not paste real token values into notes, chat, docs, or commits.
