# ClearPath Contacts Next Action Field

Adds a short `nextAction` field for the private contacts admin workflow.

## Why

Follow-up dates tell us when to look at a contact. `nextAction` tells us what to do when we get there.

Examples:

- `Call Andy after leadership meeting.`
- `Send Workflow Check link.`
- `Text after weekend.`

## Supabase migration

Run `docs/CONTACTS_NEXT_ACTION_FIELD.sql` in the ClearPath Supabase SQL Editor before deploying this code.

The app writes `next_action` during create/update. If the column does not exist, Supabase create/update calls can fail.

## App contract

- App field: `nextAction`
- Supabase column: `next_action`
- Default: empty string
- Search includes `nextAction`
- Admin create/edit UI includes a `Next action` input
- Contact card shows `Next action: ...` when set

## Verification

After the migration and code apply:

```bash
npm run test:contacts
npm run lint
npm run build
```

Manual smoke test:

1. Open `/admin/contacts`.
2. Create or edit a contact.
3. Set `Next action` to a short instruction.
4. Save.
5. Refresh/search the contact and confirm the next action persists.
6. Search for a word from the next action and confirm the contact appears.
