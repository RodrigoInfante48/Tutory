-- ============================================================
-- Migration 007: Class sessions enhancements
-- Adds rescheduled_from linkage and cycle insert/update policies
-- Depends on: 002_schema.sql, 003_rls_policies.sql
-- ============================================================

-- Allow sessions to reference the original session they replace
alter table public.class_sessions
  add column if not exists rescheduled_from uuid references public.class_sessions(id) on delete set null;

-- Index for tracing reschedule chains
create index if not exists class_sessions_rescheduled_from_idx
  on public.class_sessions(rescheduled_from);

-- Teachers need insert/update on cycles (only select was granted before)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'cycles'
      and policyname = 'cycles: teacher insert'
  ) then
    create policy "cycles: teacher insert"
      on public.cycles for insert
      with check (
        student_id in (
          select id from public.students where teacher_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'cycles'
      and policyname = 'cycles: teacher update'
  ) then
    create policy "cycles: teacher update"
      on public.cycles for update
      using (
        student_id in (
          select id from public.students where teacher_id = auth.uid()
        )
      );
  end if;
end $$;

-- Teachers need insert on class_sessions (in case existing policy is all-or-select only)
-- The existing "teacher manages own sessions" policy should cover insert already, this is a no-op guard
