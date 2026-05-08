-- Personal vocabulary glossary per student, managed by teacher, viewable by student
CREATE TABLE public.student_glossary (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  word            text NOT NULL,
  definition      text NOT NULL,
  context_sentence text,
  session_id      uuid REFERENCES public.class_sessions(id) ON DELETE SET NULL,
  added_by        uuid NOT NULL REFERENCES public.users(id),
  mastered        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX student_glossary_student_idx ON public.student_glossary (student_id);
CREATE INDEX student_glossary_session_idx ON public.student_glossary (session_id);

ALTER TABLE public.student_glossary ENABLE ROW LEVEL SECURITY;

-- Admin sees everything
CREATE POLICY "glossary_admin_all" ON public.student_glossary
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Teacher: full access to their students' glossaries
CREATE POLICY "glossary_teacher_own_students" ON public.student_glossary
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.students s
      JOIN public.teachers t ON t.id = s.teacher_id
      WHERE s.id = student_glossary.student_id
        AND t.id = auth.uid()
    )
  );

-- Student: read their own glossary
CREATE POLICY "glossary_student_read" ON public.student_glossary
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Student: update only the mastered flag on their own entries
CREATE POLICY "glossary_student_update_mastered" ON public.student_glossary
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());
