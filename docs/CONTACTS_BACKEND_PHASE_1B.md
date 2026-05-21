# ClearPath Contacts Backend — Phase 1B

Phase 1B makes the local contacts admin safer to use before durable storage is wired.

## Adds

- Duplicate detection by exact email match or business-name match.
- API duplicate guard on `POST /api/admin/contacts`.
  - Returns `409` with possible duplicates unless `allowDuplicate: true` is sent.
- Admin UI duplicate review panel.
  - Shows matching records.
  - Requires checking “Create another contact anyway” before forcing a duplicate.
- Status updates from contact cards.
  - Calls `PATCH /api/admin/contacts/[id]`.
  - Supports: `new`, `warm`, `active`, `paused`, `closed`, `not_fit`.
- Tests for duplicate detection and status updates.

## Verification

```bash
npm run test:contacts
npm run lint
npm run build
```

Expected contacts test count after Phase 1B: 5 passing tests.

## Notes

This still uses `memory` storage unless `.env.local` points to Supabase. Memory mode is for smoke testing only and resets when the dev server restarts.
