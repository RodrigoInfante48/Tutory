-- ============================================================
-- Session 9: Resources & Messages enhancements
-- ============================================================

-- Add description to resources (optional long text)
alter table public.resources
  add column if not exists description text;

-- Index for faster lookups
create index if not exists resources_teacher_id_idx on public.resources(teacher_id);
create index if not exists resources_student_id_idx on public.resources(student_id);

-- Seed sample resources if table is empty
-- (dev hint only — real seeding is in seed.sql)

-- ============================================================
-- messages: ensure read_at index exists for unread count queries
-- ============================================================
create index if not exists messages_receiver_read_idx
  on public.messages(receiver_id, read_at)
  where read_at is null;
