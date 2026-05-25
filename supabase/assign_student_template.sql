-- =============================================================================
-- Tutory — Plantilla: asignar estudiante a profesor
-- =============================================================================
-- Uso: Copia este script en el SQL Editor de Supabase
--      (Project → SQL Editor → New query).
--      Edita solo los valores de las variables al inicio del bloque DO $$
--      y ejecuta. Actualiza teacher_id y opcionalmente plan_id del estudiante.
-- =============================================================================

DO $$
DECLARE
  -- ▼ EDITA AQUÍ ▼ ----------------------------------------------------------------
  v_student_email  TEXT := 'estudiante@ejemplo.com';   -- Email del estudiante
  v_teacher_email  TEXT := 'profesor@ejemplo.com';     -- Email del profesor
  v_plan_name      TEXT := '';   -- Nombre del plan (déjalo vacío '' para no cambiar)
  -- ▲ FIN DE EDICIÓN ▲ -----------------------------------------------------------

  v_student_id  UUID;
  v_teacher_id  UUID;
  v_plan_id     UUID;
  v_student_name TEXT;
  v_teacher_name TEXT;
  v_current_teacher TEXT;
BEGIN
  -- Buscar estudiante
  SELECT u.id, u.name INTO v_student_id, v_student_name
  FROM public.users u
  WHERE lower(u.email) = lower(trim(v_student_email)) AND u.role = 'student';

  IF v_student_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún estudiante con el email: %', v_student_email;
  END IF;

  -- Buscar profesor
  SELECT u.id, u.name INTO v_teacher_id, v_teacher_name
  FROM public.users u
  WHERE lower(u.email) = lower(trim(v_teacher_email)) AND u.role = 'teacher';

  IF v_teacher_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró ningún profesor con el email: %', v_teacher_email;
  END IF;

  -- Mostrar asignación actual antes del cambio
  SELECT u.name INTO v_current_teacher
  FROM public.students s
  LEFT JOIN public.users u ON u.id = s.teacher_id
  WHERE s.id = v_student_id;

  RAISE NOTICE '--- Asignación actual ---';
  RAISE NOTICE 'Estudiante: % (%)', v_student_name, v_student_email;
  RAISE NOTICE 'Profesor actual: %', COALESCE(v_current_teacher, '(sin asignar)');

  -- Asegurarse de que el estudiante tiene fila en public.students
  INSERT INTO public.students (id, teacher_id, active)
  VALUES (v_student_id, v_teacher_id, true)
  ON CONFLICT (id) DO UPDATE SET teacher_id = EXCLUDED.teacher_id;

  -- Cambiar plan de estudios si se especificó uno
  IF trim(v_plan_name) <> '' THEN
    SELECT id INTO v_plan_id
    FROM public.study_plans
    WHERE lower(name) = lower(trim(v_plan_name))
    LIMIT 1;

    IF v_plan_id IS NULL THEN
      RAISE EXCEPTION 'No se encontró ningún plan llamado: %', v_plan_name;
    END IF;

    UPDATE public.students SET plan_id = v_plan_id WHERE id = v_student_id;
    RAISE NOTICE 'Plan actualizado a: %', v_plan_name;
  END IF;

  RAISE NOTICE '--- Nueva asignación ---';
  RAISE NOTICE 'Estudiante: % (%)', v_student_name, v_student_email;
  RAISE NOTICE 'Nuevo profesor: % (%)', v_teacher_name, v_teacher_email;
  RAISE NOTICE 'Listo.';

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '%', SQLERRM;
END;
$$;
