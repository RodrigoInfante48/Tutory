-- ============================================================
-- Migration 001: users table + basic RLS
-- Run this in the Supabase SQL editor AFTER enabling Auth
-- Safe to re-run (idempotent)
-- ============================================================

-- Create enum only if it doesn't exist
do $$ begin
  create type user_role as enum ('admin', 'teacher', 'student');
exception when duplicate_object then null;
end $$;

create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  role        user_role not null default 'student',
  name        text not null default '',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Trigger: auto-insert row in public.users when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, role, name)
  values (
    new.id,
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;

-- Drop policies before recreating to allow re-runs
drop policy if exists "users: self read"      on public.users;
drop policy if exists "users: admin read all" on public.users;
drop policy if exists "users: self update"    on public.users;
drop policy if exists "users: admin update all" on public.users;

create policy "users: self read"
  on public.users for select
  using (auth.uid() = id);

create policy "users: admin read all"
  on public.users for select
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "users: self update"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "users: admin update all"
  on public.users for update
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
