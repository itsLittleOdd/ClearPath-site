-- ClearPath contacts next action field
-- Run in the ClearPath Supabase SQL Editor before deploying code that writes next_action.

alter table public.clearpath_contacts
  add column if not exists next_action text not null default '';

create index if not exists clearpath_contacts_next_action_idx
  on public.clearpath_contacts using gin (to_tsvector('english', coalesce(next_action, '')));
