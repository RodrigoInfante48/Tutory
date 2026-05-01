-- ============================================================
-- Migration 003: Row Level Security policies
-- Depends on: 001_users.sql, 002_schema.sql
-- ============================================================
-- Principle:
--   admin   → full access to everything
--   teacher → manages their own students and content
--   student → reads their own data, submits their own work
-- ============================================================

-- ============================================================
-- Helpers
-- ============================================================

-- Returns true if the caller is admin
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select get_my_role() = 'admin'
$$;

-- Returns true if caller is the teacher of student_id
create or replace function public.is_my_student(student_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.students s
    where s.id = student_id
      and s.teacher_id = auth.uid()
  )
$$;

-- ============================================================
-- teachers
-- ============================================================

alter table public.teachers enable row level security;

create policy "teachers: admin full"
  on public.teachers for all
  using (is_admin()) with check (is_admin());

create policy "teachers: teacher self read"
  on public.teachers for select
  using (id = auth.uid());

create policy "teachers: teacher self update"
  on public.teachers for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Students can see their teacher's profile
create policy "teachers: student reads own teacher"
  on public.teachers for select
  using (
    exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.teacher_id = teachers.id
    )
  );

-- ============================================================
-- students
-- ============================================================

alter table public.students enable row level security;

create policy "students: admin full"
  on public.students for all
  using (is_admin()) with check (is_admin());

create policy "students: teacher reads own students"
  on public.students for select
  using (teacher_id = auth.uid());

create policy "students: teacher updates own students"
  on public.students for update
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "students: student self read"
  on public.students for select
  using (id = auth.uid());

-- ============================================================
-- study_plans
-- ============================================================

alter table public.study_plans enable row level security;

create policy "study_plans: admin full"
  on public.study_plans for all
  using (is_admin()) with check (is_admin());

-- Teachers and students can read all plans (public curriculum)
create policy "study_plans: authenticated read"
  on public.study_plans for select
  using (auth.role() = 'authenticated');

create policy "study_plans: teacher write"
  on public.study_plans for insert
  with check (get_my_role() = 'teacher');

create policy "study_plans: teacher update"
  on public.study_plans for update
  using (get_my_role() = 'teacher');

-- ============================================================
-- groups
-- ============================================================

alter table public.groups enable row level security;

create policy "groups: admin full"
  on public.groups for all
  using (is_admin()) with check (is_admin());

create policy "groups: teacher manages own groups"
  on public.groups for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "groups: student reads own groups"
  on public.groups for select
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = groups.id and gm.student_id = auth.uid()
    )
  );

-- ============================================================
-- group_members
-- ============================================================

alter table public.group_members enable row level security;

create policy "group_members: admin full"
  on public.group_members for all
  using (is_admin()) with check (is_admin());

create policy "group_members: teacher manages members of own groups"
  on public.group_members for all
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_members.group_id and g.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.groups g
      where g.id = group_members.group_id and g.teacher_id = auth.uid()
    )
  );

create policy "group_members: student reads own membership"
  on public.group_members for select
  using (student_id = auth.uid());

-- ============================================================
-- units
-- ============================================================

alter table public.units enable row level security;

create policy "units: admin full"
  on public.units for all
  using (is_admin()) with check (is_admin());

create policy "units: authenticated read"
  on public.units for select
  using (auth.role() = 'authenticated');

create policy "units: teacher write"
  on public.units for insert
  with check (get_my_role() = 'teacher');

create policy "units: teacher update/delete"
  on public.units for update
  using (get_my_role() = 'teacher');

-- ============================================================
-- topics
-- ============================================================

alter table public.topics enable row level security;

create policy "topics: admin full"
  on public.topics for all
  using (is_admin()) with check (is_admin());

create policy "topics: authenticated read"
  on public.topics for select
  using (auth.role() = 'authenticated');

create policy "topics: teacher write"
  on public.topics for insert
  with check (get_my_role() = 'teacher');

create policy "topics: teacher update"
  on public.topics for update
  using (get_my_role() = 'teacher');

-- ============================================================
-- topic_questions
-- ============================================================

alter table public.topic_questions enable row level security;

create policy "topic_questions: admin full"
  on public.topic_questions for all
  using (is_admin()) with check (is_admin());

create policy "topic_questions: authenticated read"
  on public.topic_questions for select
  using (auth.role() = 'authenticated');

create policy "topic_questions: teacher write"
  on public.topic_questions for insert
  with check (get_my_role() = 'teacher');

create policy "topic_questions: teacher update"
  on public.topic_questions for update
  using (get_my_role() = 'teacher');

-- ============================================================
-- quizzes
-- ============================================================

alter table public.quizzes enable row level security;

create policy "quizzes: admin full"
  on public.quizzes for all
  using (is_admin()) with check (is_admin());

create policy "quizzes: teacher manages own quizzes"
  on public.quizzes for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Students can read quizzes from their teacher
create policy "quizzes: student reads teacher quizzes"
  on public.quizzes for select
  using (
    exists (
      select 1 from public.students s
      where s.id = auth.uid() and s.teacher_id = quizzes.teacher_id
    )
  );

-- ============================================================
-- quiz_results
-- ============================================================

alter table public.quiz_results enable row level security;

create policy "quiz_results: admin full"
  on public.quiz_results for all
  using (is_admin()) with check (is_admin());

-- Teacher reads results for quizzes they created
create policy "quiz_results: teacher reads own quiz results"
  on public.quiz_results for select
  using (
    exists (
      select 1 from public.quizzes q
      where q.id = quiz_results.quiz_id and q.teacher_id = auth.uid()
    )
  );

create policy "quiz_results: student self"
  on public.quiz_results for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- ============================================================
-- tasks
-- ============================================================

alter table public.tasks enable row level security;

create policy "tasks: admin full"
  on public.tasks for all
  using (is_admin()) with check (is_admin());

create policy "tasks: teacher manages own tasks"
  on public.tasks for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "tasks: student reads own tasks"
  on public.tasks for select
  using (student_id = auth.uid());

-- ============================================================
-- task_submissions
-- ============================================================

alter table public.task_submissions enable row level security;

create policy "task_submissions: admin full"
  on public.task_submissions for all
  using (is_admin()) with check (is_admin());

-- Teacher reads submissions for their tasks
create policy "task_submissions: teacher reads"
  on public.task_submissions for select
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_submissions.task_id and t.teacher_id = auth.uid()
    )
  );

-- Teacher can update submissions to add feedback
create policy "task_submissions: teacher feedback"
  on public.task_submissions for update
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_submissions.task_id and t.teacher_id = auth.uid()
    )
  );

create policy "task_submissions: student self"
  on public.task_submissions for all
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- ============================================================
-- resources
-- ============================================================

alter table public.resources enable row level security;

create policy "resources: admin full"
  on public.resources for all
  using (is_admin()) with check (is_admin());

create policy "resources: teacher manages own resources"
  on public.resources for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

-- Student reads global resources (student_id null) or their own
create policy "resources: student reads"
  on public.resources for select
  using (
    student_id is null
    or student_id = auth.uid()
  );

-- ============================================================
-- class_sessions
-- ============================================================

alter table public.class_sessions enable row level security;

create policy "class_sessions: admin full"
  on public.class_sessions for all
  using (is_admin()) with check (is_admin());

create policy "class_sessions: teacher manages own sessions"
  on public.class_sessions for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "class_sessions: student reads own sessions"
  on public.class_sessions for select
  using (student_id = auth.uid());

-- ============================================================
-- cycles
-- ============================================================

alter table public.cycles enable row level security;

create policy "cycles: admin full"
  on public.cycles for all
  using (is_admin()) with check (is_admin());

create policy "cycles: teacher reads students cycles"
  on public.cycles for select
  using (is_my_student(student_id));

create policy "cycles: teacher manages"
  on public.cycles for all
  using (is_my_student(student_id)) with check (is_my_student(student_id));

create policy "cycles: student reads own"
  on public.cycles for select
  using (student_id = auth.uid());

-- ============================================================
-- messages
-- ============================================================

alter table public.messages enable row level security;

create policy "messages: admin full"
  on public.messages for all
  using (is_admin()) with check (is_admin());

create policy "messages: participant access"
  on public.messages for all
  using (sender_id = auth.uid() or receiver_id = auth.uid())
  with check (sender_id = auth.uid());

-- ============================================================
-- alerts
-- ============================================================

alter table public.alerts enable row level security;

create policy "alerts: admin full"
  on public.alerts for all
  using (is_admin()) with check (is_admin());

create policy "alerts: teacher reads"
  on public.alerts for select
  using (get_my_role() = 'teacher');

create policy "alerts: teacher resolves"
  on public.alerts for update
  using (get_my_role() = 'teacher');
