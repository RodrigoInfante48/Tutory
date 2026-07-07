-- skill_scores: teacher-rated language skill scores per student (0-100)
create table skill_scores (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references users(id) on delete cascade,
  skill       varchar(50) not null check (skill in ('Speaking','Listening','Grammar','Vocabulary','Writing','Pronunciation')),
  score       int not null default 50 check (score >= 0 and score <= 100),
  updated_at  timestamptz not null default now(),
  unique (student_id, skill)
);

create index on skill_scores (student_id);

-- Seed default rows for a student via function (called after student creation if desired)
-- Teachers upsert into this table directly.

-- RLS
alter table skill_scores enable row level security;

-- admin sees all
create policy "admin_all_skill_scores" on skill_scores
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- teacher can read and write scores for their students
create policy "teacher_manage_skill_scores" on skill_scores
  for all using (
    exists (
      select 1 from students s
      join teachers t on t.id = s.teacher_id
      where s.id = skill_scores.student_id and t.id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from students s
      join teachers t on t.id = s.teacher_id
      where s.id = skill_scores.student_id and t.id = auth.uid()
    )
  );

-- student can read own scores
create policy "student_view_own_skill_scores" on skill_scores
  for select using (student_id = auth.uid());
