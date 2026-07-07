-- ============================================================
-- Migration 021: Allow teachers to read their students' user profiles
-- ============================================================
-- public.users had no policy letting teachers read student rows,
-- so JOIN users(...) inside useTeacherStudents returned null,
-- causing student cards to show no name or avatar.
-- ============================================================

create policy "users: teacher reads own students"
  on public.users for select
  using (
    exists (
      select 1 from public.students s
      where s.id = users.id
        and s.teacher_id = auth.uid()
    )
  );
