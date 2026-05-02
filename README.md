# Tutory

Portal web para gestión de clases de inglés. Permite a los docentes ver y gestionar sus estudiantes, planes de estudio, recursos, tareas, quizzes y seguimiento de clases desde cualquier dispositivo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Deploy | Vercel (frontend) + Supabase Cloud (backend) |
| CI/CD | GitHub Actions |

---

## Roles

| Rol | Capacidades |
|-----|------------|
| **Admin** | Vista global: todos los docentes, estudiantes, alertas y métricas |
| **Docente** | Gestiona sus estudiantes asignados, crea quizzes/tareas, sube recursos, ve agenda |
| **Estudiante** | Ve su plan de estudios, hace quizzes, entrega tareas, ve recursos y clases |

## Módulos

- **Home** — resumen del día, quiz diario, próxima clase
- **Plan de estudios** — unidades, temas con contenido interactivo, progreso por estudiante
- **Recursos** — links, archivos y materiales por estudiante o grupo
- **Tareas** — asignación, entrega con texto/audio/imágenes, retroalimentación del docente
- **Quizzes** — banco de preguntas, resultados, quiz diario asignado por fecha
- **Clases** — calendario de sesiones, estados (tomada, no-show, reagendada, festivo), ciclos y tokens
- **Mensajes** — chat docente ↔ estudiante en tiempo real
- **Grupos** — clases grupales
- **Admin** — métricas, gestión de usuarios, alertas del sistema

---

## Deploy

### Requisitos previos

- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Vercel](https://vercel.com)
- Repo en GitHub

---

### 1. Supabase Cloud

#### 1.1 Crear el proyecto

1. Entra a [supabase.com/dashboard](https://supabase.com/dashboard) y crea un nuevo proyecto.
2. Elige región (recomendado: `South America (São Paulo)` para latencia mínima).
3. Anota la contraseña de la base de datos — la necesitarás si usas migraciones vía CLI.

#### 1.2 Obtener las credenciales

En **Project Settings → API**:

| Variable | Dónde encontrarla |
|----------|------------------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | `anon` / `public` key |

#### 1.3 Aplicar las migraciones

**Opción A — Supabase CLI (recomendada):**

```bash
npx supabase login
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

El `project-ref` está en la URL del dashboard: `https://supabase.com/dashboard/project/<project-ref>`.

**Opción B — SQL Editor manual:**

Copia y ejecuta cada archivo de `supabase/migrations/` en orden en el **SQL Editor** del dashboard:

```
001_users.sql
002_schema.sql
003_rls_policies.sql
004_topic_progress.sql
005_task_enhancements.sql
006_quiz_enhancements.sql
007_class_sessions_enhancements.sql
008_resources_messages.sql
```

#### 1.4 Cargar datos de prueba (opcional)

Ejecuta `supabase/seed.sql` en el SQL Editor para crear:
- 1 admin, 2 docentes, 4 estudiantes de prueba
- Planes de estudio, tareas y quizzes de ejemplo

#### 1.5 Activar Realtime

En **Database → Replication**, habilita la tabla `messages` para que el chat funcione en tiempo real.

#### 1.6 Configurar Storage (para adjuntos de tareas)

En **Storage**, crea un bucket llamado `task-attachments` con acceso público o políticas RLS según prefieras.

---

### 2. Vercel

#### 2.1 Conectar el repositorio

1. Entra a [vercel.com/new](https://vercel.com/new).
2. Importa el repositorio de GitHub `rodrigoinfante48/tutory`.
3. Vercel detectará automáticamente el framework (Vite). No cambies nada en Build Settings — el `vercel.json` ya lo configura.

#### 2.2 Configurar variables de entorno

En **Project Settings → Environment Variables**, agrega:

| Nombre | Valor | Entornos |
|--------|-------|----------|
| `VITE_SUPABASE_URL` | `https://<tu-project-ref>.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (anon key) | Production, Preview, Development |

#### 2.3 Deploy

Haz clic en **Deploy**. Vercel construirá la app y te dará una URL pública tipo `tutory.vercel.app`.

Cada push a `main` se desplegará automáticamente. Cada PR generará un preview URL.

---

### 3. GitHub Actions (CI)

El workflow `.github/workflows/ci.yml` corre automáticamente en cada PR y push a `main`:

1. Type-check con TypeScript
2. Lint con ESLint
3. Build de producción

Para que el build funcione en CI, agrega los secrets en **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key de tu proyecto Supabase |

---

### 4. Variables de entorno locales

Copia `.env.example` a `.env` y completa con tus credenciales:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<tu-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

> **Nunca** commitees el archivo `.env`. Está en `.gitignore`.

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Arrancar el servidor de desarrollo
npm run dev

# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Build de producción
npm run build
```

---

## Estructura del proyecto

```
tutory/
├── src/
│   ├── app/                  # Rutas y layout raíz
│   ├── features/             # Un folder por dominio
│   │   ├── auth/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── quizzes/
│   │   ├── tasks/
│   │   ├── resources/
│   │   ├── study-plans/
│   │   ├── messages/
│   │   └── admin/
│   ├── components/           # UI compartido
│   ├── hooks/                # Custom hooks
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/           # SQL en orden cronológico
│   └── seed.sql
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── vercel.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Pendientes manuales

- [ ] Crear proyecto en Supabase Cloud y aplicar migraciones
- [ ] Conectar repo a Vercel y configurar env vars
- [ ] Agregar secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en GitHub Actions
- [ ] Activar Realtime para la tabla `messages` en Supabase
- [ ] Crear bucket `task-attachments` en Supabase Storage
- [ ] (Futuro) Configurar dominio personalizado en Vercel
- [ ] (Futuro) Integrar Zoom OAuth para links de clase directos
- [ ] (Futuro) Pasarela de pagos (Stripe / PayU)
