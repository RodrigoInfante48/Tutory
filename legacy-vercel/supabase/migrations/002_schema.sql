-- ============================================================
-- Migration 002: Full schema (all tables except users)
-- Depends on: 001_users.sql
-- ============================================================

-- ============================================================
-- Helper: reusable role-check function (avoids N+1 in RLS)
-- ============================================================

create or replace function public.get_my_role()
returns user_role
language sql stable security definer
as $$
  select role from public.users where id = auth.uid()
$$;

-- ============================================================
-- Profiles
-- ============================================================

create table if not exists public.teachers (
  id         uuid primary key references public.users(id) on delete cascade,
  bio        text,
  phone      text
);

create table if not exists public.study_plans (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.students (
  id          uuid primary key references public.users(id) on delete cascade,
  teacher_id  uuid references public.teachers(id) on delete set null,
  plan_id     uuid references public.study_plans(id) on delete set null,
  active      boolean not null default true,
  phone       text
);

-- ============================================================
-- Groups
-- ============================================================

create table if not exists public.groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  teacher_id  uuid references public.teachers(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.group_members (
  group_id    uuid references public.groups(id) on delete cascade,
  student_id  uuid references public.students(id) on delete cascade,
  primary key (group_id, student_id)
);

-- ============================================================
-- Study Plans content
-- ============================================================

create table if not exists public.units (
  id        uuid primary key default gen_random_uuid(),
  plan_id   uuid not null references public.study_plans(id) on delete cascade,
  title     text not null,
  "order"   integer not null default 0
);

create table if not exists public.topics (
  id           uuid primary key default gen_random_uuid(),
  unit_id      uuid not null references public.units(id) on delete cascade,
  title        text not null,
  content_html text,
  "order"      integer not null default 0
);

create table if not exists public.topic_questions (
  id            uuid primary key default gen_random_uuid(),
  topic_id      uuid not null references public.topics(id) on delete cascade,
  question      text not null,
  options       jsonb not null default '[]',
  correct_index integer not null default 0
);

-- ============================================================
-- Quizzes
-- ============================================================

create table if not exists public.quizzes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  title       text not null,
  date        date,
  questions   jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  student_id  uuid not null references public.students(id) on delete cascade,
  answers     jsonb not null default '[]',
  score       numeric(5,2),
  taken_at    timestamptz not null default now()
);

-- ============================================================
-- Tasks
-- ============================================================

create type task_status as enum ('pending', 'submitted', 'reviewed');

create table if not exists public.tasks (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null references public.teachers(id) on delete cascade,
  student_id   uuid references public.students(id) on delete cascade,
  group_id     uuid references public.groups(id) on delete set null,
  title        text not null,
  description  text,
  due_date     date,
  status       task_status not null default 'pending',
  created_at   timestamptz not null default now()
);

create table if not exists public.task_submissions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  student_id   uuid not null references public.students(id) on delete cascade,
  body         text,
  voice_url    text,
  images       jsonb not null default '[]',
  feedback     text,
  submitted_at timestamptz not null default now()
);

-- ============================================================
-- Resources
-- ============================================================

create type resource_type as enum ('link', 'pdf', 'video', 'audio', 'other');

create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null references public.teachers(id) on delete cascade,
  student_id  uuid references public.students(id) on delete cascade,
  title       text not null,
  url         text not null,
  type        resource_type not null default 'link',
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Classes
-- ============================================================

create type session_status as enum (
  'scheduled', 'taken', 'no_show', 'cancelled', 'rescheduled', 'holiday'
);

create table if not exists public.class_sessions (
  id              uuid primary key default gen_random_uuid(),
  student_id      uuid not null references public.students(id) on delete cascade,
  teacher_id      uuid not null references public.teachers(id) on delete cascade,
  scheduled_date  timestamptz not null,
  status          session_status not null default 'scheduled',
  notes           text,
  created_at      timestamptz not null default now()
);

create table if not exists public.cycles (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.students(id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  min_classes  integer not null default 0,
  tokens       integer not null default 0
);

-- ============================================================
-- Communication
-- ============================================================

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.users(id) on delete cascade,
  receiver_id  uuid not null references public.users(id) on delete cascade,
  body         text not null,
  sent_at      timestamptz not null default now(),
  read_at      timestamptz
);

create table if not exists public.alerts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  data        jsonb not null default '{}',
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Indexes for common queries
-- ============================================================

create index if not exists students_teacher_id_idx on public.students(teacher_id);
create index if not exists tasks_student_id_idx    on public.tasks(student_id);
create index if not exists tasks_teacher_id_idx    on public.tasks(teacher_id);
create index if not exists class_sessions_teacher_id_idx on public.class_sessions(teacher_id);
create index if not exists class_sessions_student_id_idx on public.class_sessions(student_id);
create index if not exists messages_sender_id_idx   on public.messages(sender_id);
create index if not exists messages_receiver_id_idx on public.messages(receiver_id);
create index if not exists quiz_results_student_id_idx on public.quiz_results(student_id);
