-- ============================================================
-- Tutory seed data — for local development only
-- Run: supabase db seed  (or paste in the local SQL editor)
-- NOTE: For Supabase Cloud, create users via the Auth dashboard
--       or the Admin API, then run the rest of the inserts.
-- ============================================================

-- UUIDs are stable so foreign keys stay consistent across reseeds.

-- ============================================================
-- Auth users (local Supabase only)
-- ============================================================

insert into auth.users (
  id, email, encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at,
  aud, role
) values
  -- admin@tutory.com / tutory1234
  (
    '00000000-0000-0000-0000-000000000001',
    'admin@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"admin","name":"Admin Tutory"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- valentina@tutory.com / tutory1234
  (
    '00000000-0000-0000-0000-000000000002',
    'valentina@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"teacher","name":"Valentina García"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- carlos@tutory.com / tutory1234
  (
    '00000000-0000-0000-0000-000000000003',
    'carlos@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"teacher","name":"Carlos Mendoza"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Students
  (
    '00000000-0000-0000-0000-000000000004',
    'ana@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"student","name":"Ana Rodríguez"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'pedro@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"student","name":"Pedro Martínez"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'maria@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"student","name":"María López"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'juan@tutory.com',
    crypt('tutory1234', gen_salt('bf')),
    now(),
    '{"role":"student","name":"Juan Pérez"}'::jsonb,
    now(), now(), 'authenticated', 'authenticated'
  )
on conflict (id) do nothing;

-- ============================================================
-- public.users (trigger should fire above, but we upsert to be safe)
-- ============================================================

insert into public.users (id, email, role, name) values
  ('00000000-0000-0000-0000-000000000001', 'admin@tutory.com',     'admin',   'Admin Tutory'),
  ('00000000-0000-0000-0000-000000000002', 'valentina@tutory.com', 'teacher', 'Valentina García'),
  ('00000000-0000-0000-0000-000000000003', 'carlos@tutory.com',    'teacher', 'Carlos Mendoza'),
  ('00000000-0000-0000-0000-000000000004', 'ana@tutory.com',       'student', 'Ana Rodríguez'),
  ('00000000-0000-0000-0000-000000000005', 'pedro@tutory.com',     'student', 'Pedro Martínez'),
  ('00000000-0000-0000-0000-000000000006', 'maria@tutory.com',     'student', 'María López'),
  ('00000000-0000-0000-0000-000000000007', 'juan@tutory.com',      'student', 'Juan Pérez')
on conflict (id) do update set
  email = excluded.email,
  role  = excluded.role,
  name  = excluded.name;

-- ============================================================
-- Teachers
-- ============================================================

insert into public.teachers (id, bio, phone) values
  ('00000000-0000-0000-0000-000000000002', 'Profesora de inglés con 8 años de experiencia.', '+57 300 111 2222'),
  ('00000000-0000-0000-0000-000000000003', 'Especialista en inglés de negocios.',             '+57 300 333 4444')
on conflict (id) do nothing;

-- ============================================================
-- Study plan
-- ============================================================

insert into public.study_plans (id, name, description) values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'Inglés General A1–B2',
    'Plan progresivo de inglés general desde nivel básico hasta intermedio-alto.'
  )
on conflict (id) do nothing;

-- Units
insert into public.units (id, plan_id, title, "order") values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Unit 1: Greetings & Introductions', 1),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Unit 2: Daily Routines',            2),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Unit 3: Work & Business',           3)
on conflict (id) do nothing;

-- Topics
insert into public.topics (id, unit_id, title, content_html, "order") values
  (
    'cccccccc-0000-0000-0000-000000000001',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Hello & Goodbye',
    '<p>Learn how to greet people and say goodbye in English.</p><ul><li>Hi / Hello / Hey</li><li>Good morning / afternoon / evening</li><li>Goodbye / See you / Take care</li></ul>',
    1
  ),
  (
    'cccccccc-0000-0000-0000-000000000002',
    'bbbbbbbb-0000-0000-0000-000000000001',
    'Introducing Yourself',
    '<p>Practice introducing yourself and asking about others.</p><ul><li>My name is... / I am...</li><li>Where are you from?</li><li>What do you do?</li></ul>',
    2
  ),
  (
    'cccccccc-0000-0000-0000-000000000003',
    'bbbbbbbb-0000-0000-0000-000000000002',
    'Morning Routines',
    '<p>Describe your morning routine using present simple.</p>',
    1
  )
on conflict (id) do nothing;

-- Topic questions
insert into public.topic_questions (id, topic_id, question, options, correct_index) values
  (
    'dddddddd-0000-0000-0000-000000000001',
    'cccccccc-0000-0000-0000-000000000001',
    'Which phrase is used to greet someone in the morning?',
    '["Good night","Good morning","Goodbye","See you"]'::jsonb,
    1
  ),
  (
    'dddddddd-0000-0000-0000-000000000002',
    'cccccccc-0000-0000-0000-000000000002',
    'How do you ask someone''s name?',
    '["What is your job?","Where are you from?","What is your name?","How old are you?"]'::jsonb,
    2
  )
on conflict (id) do nothing;

-- ============================================================
-- Students (linked to teachers and plan)
-- ============================================================

insert into public.students (id, teacher_id, plan_id, active, phone) values
  -- Valentina's students
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', true, '+57 310 000 0004'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', true, '+57 310 000 0005'),
  -- Carlos's students
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', true, '+57 310 000 0006'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', true, '+57 310 000 0007')
on conflict (id) do nothing;

-- ============================================================
-- Groups
-- ============================================================

insert into public.groups (id, name, teacher_id) values
  ('eeeeeeee-0000-0000-0000-000000000001', 'Grupo Martes/Jueves', '00000000-0000-0000-0000-000000000002')
on conflict (id) do nothing;

insert into public.group_members (group_id, student_id) values
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'),
  ('eeeeeeee-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005')
on conflict do nothing;

-- ============================================================
-- Class sessions (upcoming and past)
-- ============================================================

insert into public.class_sessions (id, student_id, teacher_id, scheduled_date, status, notes) values
  -- ── Valentina / Ana García (2×/week, May 2026) ──────────────────────
  -- Week 1
  ('ffffffff-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-04 10:00:00-05', 'taken',     'Great progress on Unit 1.'),
  ('ffffffff-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-06 10:00:00-05', 'taken',     null),
  -- Week 2
  ('ffffffff-0000-0000-0000-00000000000a', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-11 10:00:00-05', 'taken',     'Practiced past tense.'),
  ('ffffffff-0000-0000-0000-00000000000b', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-13 10:00:00-05', 'taken',     null),
  -- Week 3
  ('ffffffff-0000-0000-0000-00000000000c', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-18 10:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-00000000000d', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-20 10:00:00-05', 'no_show',   'Student did not connect.'),
  -- Week 4 (scheduled)
  ('ffffffff-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-25 10:00:00-05', 'scheduled', null),
  ('ffffffff-0000-0000-0000-00000000000e', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '2026-05-27 10:00:00-05', 'scheduled', null),

  -- ── Valentina / Pedro Ramírez (2×/week, May 2026) ───────────────────
  -- Week 1
  ('ffffffff-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-05 14:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-00000000000f', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-07 14:00:00-05', 'taken',     null),
  -- Week 2
  ('ffffffff-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-12 14:00:00-05', 'cancelled', 'Student cancelled.'),
  ('ffffffff-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-14 14:00:00-05', 'taken',     null),
  -- Week 3
  ('ffffffff-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-19 14:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-21 14:00:00-05', 'taken',     null),
  -- Week 4 (scheduled)
  ('ffffffff-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-26 14:00:00-05', 'scheduled', null),
  ('ffffffff-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '2026-05-28 14:00:00-05', 'scheduled', null),

  -- ── Carlos / María López (2×/week, May 2026) ────────────────────────
  ('ffffffff-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-05 09:00:00-05', 'no_show',   null),
  ('ffffffff-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-07 09:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-12 09:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-14 09:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-26 09:00:00-05', 'scheduled', null),
  ('ffffffff-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', '2026-05-28 09:00:00-05', 'scheduled', null),

  -- ── Carlos / Juan Torres (2×/week, May 2026) ────────────────────────
  ('ffffffff-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-04 11:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-06 11:00:00-05', 'taken',     null),
  ('ffffffff-0000-0000-0000-00000000001a', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-11 11:00:00-05', 'taken',     'Good fluency practice.'),
  ('ffffffff-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-13 11:00:00-05', 'holiday',   'Día del Trabajo (puente)'),
  ('ffffffff-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-25 11:00:00-05', 'scheduled', null),
  ('ffffffff-0000-0000-0000-00000000001c', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', '2026-05-27 11:00:00-05', 'scheduled', null)
on conflict (id) do nothing;

-- ============================================================
-- Cycles
-- ============================================================

insert into public.cycles (id, student_id, start_date, end_date, min_classes, tokens) values
  ('11111111-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '2026-05-01', '2026-05-31', 8, 8),
  ('11111111-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '2026-05-01', '2026-05-31', 8, 8),
  ('11111111-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000006', '2026-05-01', '2026-05-31', 8, 8),
  ('11111111-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', '2026-05-01', '2026-05-31', 8, 8)
on conflict (id) do nothing;

-- ============================================================
-- Tasks
-- ============================================================

insert into public.tasks (id, teacher_id, student_id, title, description, due_date, status) values
  (
    '22222222-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'Write a short self-introduction',
    'Write 5 sentences introducing yourself in English. Include your name, age, city, job, and a hobby.',
    current_date + 3,
    'pending'
  ),
  (
    '22222222-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    'Record morning routine audio',
    'Record a 1-minute audio describing your morning routine using present simple.',
    current_date + 5,
    'pending'
  )
on conflict (id) do nothing;

-- ============================================================
-- Quizzes
-- ============================================================

insert into public.quizzes (id, teacher_id, title, date, questions) values
  (
    '33333333-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    'Unit 1 Quiz',
    current_date,
    '[
      {"question":"What does \"Hello\" mean?","options":["Adiós","Hola","Por favor","Gracias"],"correct_index":1},
      {"question":"Which is a greeting?","options":["Goodbye","Thank you","Good morning","Sorry"],"correct_index":2}
    ]'::jsonb
  )
on conflict (id) do nothing;

-- ============================================================
-- Resources
-- ============================================================

insert into public.resources (id, teacher_id, student_id, title, url, description, type) values
  (
    '44444444-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    null,
    'BBC Learning English — 6 Minute English',
    'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
    'Podcast de 6 minutos con vocabulario cotidiano. Recurso global para todos los estudiantes.',
    'link'
  ),
  (
    '44444444-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'Unit 1 Vocabulary PDF',
    'https://example.com/unit1-vocab.pdf',
    'Vocabulario de la Unidad 1: saludos, presentaciones y números.',
    'pdf'
  ),
  (
    '44444444-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    null,
    'English Grammar in Use — Cambridge',
    'https://www.cambridge.org/us/cambridgeenglish/catalog/grammar-vocabulary-and-pronunciation/english-grammar-use',
    'Referencia de gramática intermedia. Disponible para todos.',
    'link'
  ),
  (
    '44444444-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000006',
    'Reported Speech Video Lesson',
    'https://www.youtube.com/watch?v=reported-speech-example',
    'Video explicativo de estilo indirecto para María.',
    'video'
  )
on conflict (id) do nothing;

-- ============================================================
-- Messages
-- ============================================================

insert into public.messages (id, sender_id, receiver_id, body, sent_at, read_at) values
  (
    '55555555-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '¡Hola Ana! No olvides tu tarea para el jueves.',
    now() - interval '2 days',
    now() - interval '1 day 23 hours'
  ),
  (
    '55555555-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    '¡Claro, Valentina! Ya empecé a escribirla.',
    now() - interval '1 day 22 hours',
    now() - interval '1 day 21 hours'
  ),
  (
    '55555555-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000004',
    'Perfecto, recuerda revisar el PDF de vocabulario que te mandé.',
    now() - interval '1 day',
    now() - interval '23 hours'
  ),
  (
    '55555555-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'Sí, ya lo vi. Tengo una pregunta sobre la sección de verbos irregulares.',
    now() - interval '3 hours',
    null
  ),
  (
    '55555555-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000006',
    '¡Hola María! ¿Pudiste ver el video de reported speech?',
    now() - interval '5 hours',
    null
  )
on conflict (id) do nothing;

-- ============================================================
-- Alerts
-- ============================================================

insert into public.alerts (id, type, data, resolved) values
  (
    '66666666-0000-0000-0000-000000000001',
    'no_show',
    '{"student_id":"00000000-0000-0000-0000-000000000006","student_name":"María López","date":"' || current_date - 2 || '"}'::jsonb,
    false
  )
on conflict (id) do nothing;
