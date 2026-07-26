-- Run this AFTER schema.sql, in Supabase Dashboard → SQL Editor → New query → Run.
-- Adds manual-approval gating: new signups start locked out (approved = false)
-- until you flip the flag yourself. Only you can approve — there is no client-side
-- policy that lets a user (including via a crafted request) set their own `approved`.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  approved boolean not null default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- Users may only ever READ their own row. There is deliberately no insert/update
-- policy for the `authenticated` role, so approving someone requires either the
-- service_role key (used by the admin API route) or the Supabase Dashboard.
drop policy if exists "select own profile" on profiles;
create policy "select own profile" on profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row (approved = false) whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, approved)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profile rows for anyone who already signed up before this migration.
insert into public.profiles (id, email, approved)
select id, email, false from auth.users
on conflict (id) do nothing;

-- IMPORTANT — run this once, replacing the email with your own login email,
-- so you don't lock yourself out. This is also the email you should put in the
-- ADMIN_EMAIL environment variable (see .env.example).
-- update public.profiles set approved = true where email = 'you@example.com';
