# ClearPath Contacts Backend — Phase 2 Supabase Storage

Phase 2 keeps the existing `/admin/contacts` UI and API contract, but moves contacts from process memory to Supabase-backed durable storage.

## Storage mode

Local smoke testing can stay in memory:

```bash
CLEARPATH_CONTACTS_STORAGE=memory
```

Durable mode uses Supabase REST from the server-side API routes:

```bash
CLEARPATH_CONTACTS_STORAGE=supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CLEARPATH_CONTACTS_TABLE=clearpath_contacts
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code. It is only read by server-side API routes.

## Supabase schema

Run this in the Supabase SQL editor for the ClearPath project.

```sql
create table if not exists public.clearpath_contacts (
  id text primary key,
  type text not null check (type in ('lead', 'prospect', 'client')),
  status text not null check (status in ('new', 'warm', 'active', 'paused', 'closed', 'not_fit')),
  source text not null check (source in ('manual', 'tally', 'cal', 'email', 'referral')),
  name text not null,
  business text not null,
  email text not null,
  email_normalized text not null,
  business_normalized text not null,
  phone text not null default '',
  pain text not null default '',
  notes text not null default '',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

alter table public.clearpath_contacts enable row level security;

create index if not exists clearpath_contacts_updated_at_idx
  on public.clearpath_contacts (updated_at desc);

create index if not exists clearpath_contacts_type_status_idx
  on public.clearpath_contacts (type, status);

create index if not exists clearpath_contacts_email_normalized_idx
  on public.clearpath_contacts (email_normalized);

create index if not exists clearpath_contacts_business_normalized_idx
  on public.clearpath_contacts (business_normalized);
```

No public RLS policies are needed for Phase 2. The server API uses the service-role key; browser requests still go through the ClearPath admin token gate.

## Behavior covered by tests

- Memory storage still supports create/search/duplicate/status updates.
- Supabase create writes `email_normalized` and `business_normalized` for exact duplicate review.
- Supabase duplicate review checks normalized email or normalized business.
- Supabase search sends PostgREST filters for type, status, and text search.

## Verification

```bash
npm run test:contacts
npm run lint
npm run build
```

Expected contacts test count after Phase 2: 8 passing tests.

Manual smoke test after Supabase env is configured:

1. Start dev with `CLEARPATH_CONTACTS_STORAGE=supabase`.
2. Open `/admin/contacts` with the configured admin token.
3. Create a contact.
4. Restart the dev server.
5. Confirm the contact is still listed.
6. Try the same email or business and confirm duplicate review appears.
7. Change status and confirm it persists after refresh.

## Later

Tally webhook import should wait until durable manual storage is verified.
