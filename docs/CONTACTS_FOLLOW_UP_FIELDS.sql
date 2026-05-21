-- ClearPath contacts follow-up fields migration
-- Run in the ClearPath Supabase SQL editor before deploying code that writes these fields.

alter table public.clearpath_contacts
  add column if not exists priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  add column if not exists next_follow_up_at date;

create index if not exists clearpath_contacts_priority_idx
  on public.clearpath_contacts (priority);

create index if not exists clearpath_contacts_next_follow_up_at_idx
  on public.clearpath_contacts (next_follow_up_at);
