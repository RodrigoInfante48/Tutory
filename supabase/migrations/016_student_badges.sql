-- student_badges: digital achievement badges awarded to students
create table student_badges (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references users(id) on delete cascade,
  badge_type   varchar(50) not null,
  cycle_id     uuid references cycles(id) on delete set null,
  earned_at    timestamptz not null default now(),
  seen         boolean not null default false,

  constraint valid_badge_type check (
    badge_type in (
      'mission_accomplished',
      'streak_week',
      'quiz_master',
      'vocabulary_hero',
      'perfect_attendance'
    )
  )
);

create index on student_badges (student_id);
create index on student_badges (student_id, seen) where seen = false;

-- RLS
alter table student_badges enable row level security;

create policy "admin_all_badges" on student_badges
  for all using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

create policy "teacher_view_badges" on student_badges
  for select using (
    exists (
      select 1 from students s
      join teachers t on t.id = s.teacher_id
      where s.id = student_badges.student_id
        and t.id = auth.uid()
    )
  );

create policy "student_view_own_badges" on student_badges
  for select using (student_id = auth.uid());

-- Students can mark their own badges as seen
create policy "student_update_own_badges" on student_badges
  for update using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- -------------------------------------------------------
-- Trigger: auto-award 'mission_accomplished' and
-- 'perfect_attendance' when a class_session is marked
-- 'taken' and a cycle is now complete.
-- -------------------------------------------------------
create or replace function award_badges_on_class_taken()
returns trigger
language plpgsql
security definer
as $$
declare
  v_cycle       record;
  v_taken_count int;
  v_no_show_count int;
begin
  if NEW.status = 'taken' and (OLD.status is distinct from 'taken') then
    for v_cycle in
      select id, start_date, end_date, min_classes
      from cycles
      where student_id = NEW.student_id
        and end_date <= current_date
        and min_classes > 0
    loop
      -- Count taken sessions within cycle window
      select count(*) into v_taken_count
      from class_sessions
      where student_id = NEW.student_id
        and status = 'taken'
        and scheduled_date::date between v_cycle.start_date and v_cycle.end_date;

      if v_taken_count >= v_cycle.min_classes then
        -- mission_accomplished: once per cycle
        if not exists (
          select 1 from student_badges
          where student_id = NEW.student_id
            and badge_type = 'mission_accomplished'
            and cycle_id = v_cycle.id
        ) then
          insert into student_badges (student_id, badge_type, cycle_id)
          values (NEW.student_id, 'mission_accomplished', v_cycle.id);
        end if;

        -- perfect_attendance: no no_shows during the cycle
        select count(*) into v_no_show_count
        from class_sessions
        where student_id = NEW.student_id
          and status = 'no_show'
          and scheduled_date::date between v_cycle.start_date and v_cycle.end_date;

        if v_no_show_count = 0 then
          if not exists (
            select 1 from student_badges
            where student_id = NEW.student_id
              and badge_type = 'perfect_attendance'
              and cycle_id = v_cycle.id
          ) then
            insert into student_badges (student_id, badge_type, cycle_id)
            values (NEW.student_id, 'perfect_attendance', v_cycle.id);
          end if;
        end if;
      end if;
    end loop;
  end if;
  return NEW;
end;
$$;

create trigger trg_award_badges_class_taken
  after update of status on class_sessions
  for each row
  execute function award_badges_on_class_taken();
