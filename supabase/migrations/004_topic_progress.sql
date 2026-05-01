-- ============================================================
-- Migration 004: Topic progress tracking
-- Depends on: 002_schema.sql, 003_rls_policies.sql
-- ============================================================

create table if not exists public.topic_progress (
  id           uuid primary key default gen_random_uuid(),
  topic_id     uuid not null references public.topics(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  answers      jsonb not null default '{}',  -- { [question_id]: selected_index }
  completed    boolean not null default false,
  completed_at timestamptz,
  unique (topic_id, student_id)
);

create index if not exists topic_progress_student_id_idx on public.topic_progress(student_id);
create index if not exists topic_progress_topic_id_idx   on public.topic_progress(topic_id);

-- ============================================================
-- RLS
-- ============================================================

alter table public.topic_progress enable row level security;

create policy "topic_progress: admin full"
  on public.topic_progress for all
  using (is_admin()) with check (is_admin());

create policy "topic_progress: teacher reads own students"
  on public.topic_progress for select
  using (is_my_student(student_id));

create policy "topic_progress: student self"
  on public.topic_progress for all
  using (student_id = auth.uid())
  with check (student_id = auth.uid());
