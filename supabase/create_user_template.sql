-- =============================================================================
-- Tutory — Plantilla de creación de usuario
-- =============================================================================
-- Uso: Copia este script en el SQL Editor de Supabase
--      (Project → SQL Editor → New query).
--      Edita solo los valores de las variables al inicio del bloque DO $$
--      y ejecuta. Crea el usuario en auth.users + users + students/teachers
--      en una sola transacción atómica.
-- =============================================================================

DO $$
DECLARE
  -- ▼ EDITA AQUÍ ▼ ----------------------------------------------------------------
  v_email    TEXT := 'usuario@ejemplo.com';   -- Email del nuevo usuario
  v_name     TEXT := 'Nombre Apellido';       -- Nombre completo
  v_pin      TEXT := '1234';                  -- PIN de 4 dígitos (contraseña inicial)
  v_role     TEXT := 'student';               -- Rol: 'student' | 'teacher' | 'admin'
  -- ▲ FIN DE EDICIÓN ▲ -----------------------------------------------------------

  v_user_id UUID;
  v_plan_id UUID;
BEGIN
  -- Validaciones
  IF trim(v_email) = '' THEN
    RAISE EXCEPTION 'El email no puede estar vacío';
  END IF;
  IF trim(v_name) = '' THEN
    RAISE EXCEPTION 'El nombre no puede estar vacío';
  END IF;
  IF v_pin !~ '^\d{4}$' THEN
    RAISE EXCEPTION 'El PIN debe ser exactamente 4 dígitos numéricos';
  END IF;
  IF v_role NOT IN ('student', 'teacher', 'admin') THEN
    RAISE EXCEPTION 'El rol debe ser student, teacher o admin';
  END IF;

  -- 1. Crear usuario en auth.users
  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    trim(lower(v_email)),
    crypt(v_pin, gen_salt('bf')),
    now(),
    jsonb_build_object('name', trim(v_name)),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 2. Crear perfil en public.users
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (v_user_id, trim(lower(v_email)), trim(v_name), v_role, now());

  -- 3. Crear fila en tabla de rol correspondiente
  IF v_role = 'student' THEN
    SELECT id INTO v_plan_id FROM public.study_plans WHERE name = 'Demo' LIMIT 1;
    INSERT INTO public.students (id, teacher_id, plan_id, active)
    VALUES (v_user_id, NULL, v_plan_id, true);

  ELSIF v_role = 'teacher' THEN
    INSERT INTO public.teachers (id)
    VALUES (v_user_id);
  END IF;
  -- admin: no tiene tabla propia adicional

  RAISE NOTICE 'Usuario creado: % (%) — rol: % — id: %',
    trim(v_name), trim(lower(v_email)), v_role, v_user_id;

EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Ya existe un usuario con el email %', trim(lower(v_email));
END;
$$;
