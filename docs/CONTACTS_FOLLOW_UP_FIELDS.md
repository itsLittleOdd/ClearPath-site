# ClearPath contacts follow-up fields

This migration adds the first action-tracking fields to ClearPath contacts.

## Fields

- `priority`: `low`, `normal`, or `high`. Defaults to `normal`.
- `next_follow_up_at`: optional date for the next human follow-up.

## Apply order

Run the SQL migration in Supabase before deploying the code that writes these fields:

```sql
alter table public.clearpath_contacts
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  add column if not exists next_follow_up_at date;

create index if not exists clearpath_contacts_priority_idx
  on public.clearpath_contacts (priority);

create index if not exists clearpath_contacts_next_follow_up_at_idx
  on public.clearpath_contacts (next_follow_up_at);
```

The file version is in `docs/CONTACTS_FOLLOW_UP_FIELDS.sql`.

## Smoke test

1. Deploy after the SQL migration is applied.
2. Open `/admin/contacts`.
3. Search for a contact.
4. Click **Edit contact**.
5. Set priority to **High** and choose a next follow-up date.
6. Save.
7. Refresh/search again and confirm the priority and follow-up date remain visible.

## Guardrail

Do not deploy the code before the Supabase columns exist. The server writes these fields on create/update, so production contact writes can fail if the schema is still old.
