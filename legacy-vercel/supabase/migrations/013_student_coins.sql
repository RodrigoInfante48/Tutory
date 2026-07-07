-- student_coins: tracks gamification coin awards per student
create table student_coins (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references users(id) on delete cascade,
  amount       int  not null check (amount > 0),
  reason       text not null,
  session_id   uuid references class_sessions(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index on student_coins (student_id);
create index on student_coins (session_id) where session_id is not null;

-- RLS
alter table student_coins enable row level security;

-- admin sees all
create policy "admin_all_coins" on student_coins
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- teacher sees coins for their students
create policy "teacher_view_coins" on student_coins
  for select using (
    exists (
      select 1 from students s
      join teachers t on t.id = s.teacher_id
      where s.id = student_coins.student_id and t.id = auth.uid()
    )
  );

-- student sees own coins
create policy "student_view_own_coins" on student_coins
  for select using (student_id = auth.uid());

-- only service role / triggers insert coins (no direct insert from students)
create policy "teacher_insert_coins" on student_coins
  for insert with check (
    exists (select 1 from users where id = auth.uid() and role in ('admin', 'teacher'))
  );

-- Trigger: auto-award +10 coins when class_sessions.status changes to 'taken'
create or replace function award_coins_on_class_taken()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only fire when status transitions to 'taken'
  if (NEW.status = 'taken' and (OLD.status is distinct from 'taken')) then
    -- Avoid duplicate awards for the same session
    if not exists (
      select 1 from student_coins
      where session_id = NEW.id and reason = 'clase_tomada'
    ) then
      insert into student_coins (student_id, amount, reason, session_id)
      values (NEW.student_id, 10, 'clase_tomada', NEW.id);
    end if;
  end if;
  return NEW;
end;
$$;

create trigger trg_award_coins_class_taken
  after update of status on class_sessions
  for each row
  execute function award_coins_on_class_taken();
