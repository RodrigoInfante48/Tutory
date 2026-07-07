-- Add group_id to quizzes so a quiz can be targeted at a specific group.
-- RLS policies for groups and group_members already exist in 003_rls_policies.sql.

alter table public.quizzes
  add column if not exists group_id uuid references public.groups(id) on delete set null;

create index if not exists quizzes_group_id_idx on public.quizzes(group_id);
