-- ============================================================
-- Migration 009: Fix infinite RLS recursion on public.users
-- ============================================================
-- The policies "users: admin read all" and "users: admin update all"
-- in 001_users.sql contained subqueries against public.users *inside*
-- a policy ON public.users.  PostgreSQL raises 42P17 (infinite
-- recursion detected) for every fetchAppUser call, blocking all logins.
--
-- Fix: replace the self-referential EXISTS subqueries with
-- get_my_role() which is SECURITY DEFINER and bypasses RLS.
-- ============================================================

drop policy if exists "users: admin read all"    on public.users;
drop policy if exists "users: admin update all"  on public.users;

create policy "users: admin read all"
  on public.users for select
  using (get_my_role() = 'admin');

create policy "users: admin update all"
  on public.users for update
  using    (get_my_role() = 'admin')
  with check (get_my_role() = 'admin');
