# ClearPath Contacts Backend — Phase 1

This package adds the first private ClearPath contacts backend without replacing Tally.

## What Phase 1 adds

- Private admin page: `/admin/contacts`
- Search API: `GET /api/admin/contacts?q=&type=&status=`
- Create API: `POST /api/admin/contacts`
- Detail/update API: `GET/PATCH /api/admin/contacts/[id]`
- Contact store with two modes:
  - `memory` for local dev and smoke testing
  - `supabase` for durable production storage through Supabase REST
- Node test coverage for manual lead normalization, search, filters, and validation

## Required env vars

```bash
CLEARPATH_ADMIN_TOKEN=replace-with-long-random-token
CLEARPATH_CONTACTS_STORAGE=memory
```

For production Supabase storage:

```bash
CLEARPATH_CONTACTS_STORAGE=supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLEARPATH_CONTACTS_TABLE=clearpath_contacts
```

Do not expose the service role key to the browser. These routes use it server-side only.

## Supabase schema

Run this in Supabase SQL editor when Justin is ready to make the backend durable:

```sql
create table if not exists public.clearpath_contacts (
  id text primary key,
  type text not null check (type in ('lead', 'prospect', 'client')),
  status text not null check (status in ('new', 'warm', 'active', 'paused', 'closed', 'not_fit')),
  source text not null check (source in ('manual', 'tally', 'cal', 'email', 'referral')),
  name text not null,
  business text not null,
  email text not null,
  phone text,
  pain text,
  notes text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create index if not exists clearpath_contacts_updated_at_idx on public.clearpath_contacts (updated_at desc);
create index if not exists clearpath_contacts_type_status_idx on public.clearpath_contacts (type, status);
create index if not exists clearpath_contacts_email_idx on public.clearpath_contacts (email);
```

Keep RLS strict. The app should use the service role from server routes only, not browser-side Supabase access.

## Verification

From this package directory:

```bash
node --test tests/contacts-store.test.mjs
```

After applying to the real repo, run:

```bash
npm run lint
npm run build
```

## Apply note

Hermes could not write into `/Users/justinwhalen/WhalenVentures/ClearPath/clearpath_site` because the repo is owned by `justinwhalen` and not writable by the Hermes runtime user. Apply as Justin or adjust permissions after approval.
