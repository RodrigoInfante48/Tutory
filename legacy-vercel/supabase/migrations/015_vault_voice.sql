-- ============================================================
-- Migration 015: Student Vault & Voice Notes
-- Adds session_recording_url to class_sessions
-- Adds voice_url to messages
-- Depends on: 002_schema.sql, 011_session_types.sql
-- ============================================================

-- Recording URL for Zoom class sessions (teacher pastes it after the class)
alter table public.class_sessions
  add column if not exists session_recording_url text;

-- Voice note URL for chat messages (Supabase Storage public URL)
alter table public.messages
  add column if not exists voice_url text;

-- Teachers can update recording URLs on their own sessions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'class_sessions'
      and policyname = 'class_sessions: teacher update recording'
  ) then
    -- The existing teacher policy already covers updates; this migration just adds the column.
    -- No new policy needed — existing "teacher manages own sessions" covers it.
    null;
  end if;
end $$;
