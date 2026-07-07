-- Prevent a student from submitting the same quiz twice
alter table public.quiz_results
  add constraint quiz_results_quiz_student_unique unique (quiz_id, student_id);

-- Fast lookup of quizzes by date (used to fetch "quiz del día")
create index if not exists quizzes_date_idx on public.quizzes(date);
