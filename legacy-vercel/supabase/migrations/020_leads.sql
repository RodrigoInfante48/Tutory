-- Tabla para capturar leads de estudiantes interesados en clase de prueba

create table if not exists leads (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  email        text not null,
  whatsapp     text,
  goal         text,
  availability text,
  status       text default 'pending',
  created_at   timestamptz default now()
);

-- RLS
alter table leads enable row level security;

-- Cualquiera puede insertar (formulario público sin autenticación)
create policy "leads_insert_public"
  on leads for insert
  with check (true);

-- Solo admins pueden leer
create policy "leads_select_admin"
  on leads for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );
