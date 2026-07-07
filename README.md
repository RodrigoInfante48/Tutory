# Tutory

Portal web para gestión de clases de inglés. Permite a los docentes ver y gestionar sus
estudiantes, planes de estudio, recursos, tareas, quizzes y seguimiento de clases desde
cualquier dispositivo.

Este repo contiene **dos versiones** de la app mientras dura la migración de stack:

| Carpeta | Stack | Estado |
|---|---|---|
| [`legacy-vercel/`](legacy-vercel/README.md) | React + Supabase + Vercel | En producción (https://tutory.vercel.app) |
| [`firebase-app/`](firebase-app/README.md) | React + Firebase + GitHub Pages | En construcción |

**Por qué la migración:** pasar el login de estudiantes y profesores a Google Sign-In
(Gmail), en vez de PIN/contraseña creada manualmente por el admin.

Ver [`FIREBASE_MIGRATION_PROMPTS.md`](FIREBASE_MIGRATION_PROMPTS.md) para la secuencia de
sesiones de desarrollo que construye `firebase-app/` de punta a punta, y
[`CLAUDE.md`](CLAUDE.md) para el contexto de negocio y las decisiones de arquitectura
originales (siguen aplicando salvo donde el doc de migración las reemplaza).

Cada carpeta es un proyecto independiente: `cd legacy-vercel && npm install && npm run dev`
o `cd firebase-app && npm install && npm run dev`.
