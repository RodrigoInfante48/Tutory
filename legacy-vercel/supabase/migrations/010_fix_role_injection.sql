-- ============================================================
-- Migration 010: Fix role injection via user metadata
-- ============================================================
-- VULNERABILITY: The original handle_new_user trigger read the
-- role from raw_user_meta_data, which any client can set during
-- signUp() using the public anon key:
--
--   supabase.auth.signUp({
--     email: '...',
--     password: '...',
--     options: { data: { role: 'admin' } }   ← exploit
--   })
--
-- FIX: Always assign 'student' on creation. Role elevation must
-- be done explicitly by an admin via the Table Editor or SQL.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, role, name)
  values (
    new.id,
    new.email,
    'student',
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;
