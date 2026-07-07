-- ============================================================
-- Migration 005: Task enhancements
-- Adds feedback_read_at to task_submissions so students can
-- mark teacher feedback as read (drives badge notifications).
-- ============================================================

alter table public.task_submissions
  add column if not exists feedback_read_at timestamptz;
