# Migración Tutory: Supabase + Vercel → Firebase + GitHub Pages

Este documento es la guía de la migración, en el mismo formato de "sesiones" que
`CLAUDE.md` usó para construir la versión original. Cada sesión es un prompt que le
podés dar a Claude en una conversación nueva; asume que las anteriores ya se hicieron.

**Por qué migrar:** login de estudiantes y profesores con su cuenta de Gmail, en vez de
PIN/contraseña creada por el admin.

**Dónde vive cada cosa:**
- `legacy-vercel/` — la app actual (React + Supabase + Vercel), intacta, como referencia
  de UI/UX, modelo de datos y lógica de negocio. Sigue siendo la app en producción hasta
  que decidas cortar el switch.
- `firebase-app/` — la reescritura (React + Firebase + GitHub Pages). Proyecto
  independiente con su propio `package.json`.

---

## Mapeo de arquitectura

| Concepto | Vercel + Supabase | Firebase + GitHub Pages |
|---|---|---|
| Hosting frontend | Vercel (SSR-capable, rewrites en `vercel.json`) | GitHub Pages (estático puro) |
| Routing | `BrowserRouter` (Vercel reescribe todo a `index.html`) | `HashRouter` (`#/ruta`, no necesita rewrites del server) |
| Auth | Supabase Auth, email + PIN (`pin + '00'` como password) | Firebase Auth, **solo Google Sign-In** |
| Alta de usuarios | Admin crea fila en `auth.users` + `public.users` vía SQL template | Admin/teacher crea `invites/{email}`; se "reclama" al primer login con Google |
| Autorización | RLS policies (SQL) | Firestore/Storage Security Rules + custom claims (`role`) |
| Base de datos | Postgres (tablas relacionales, joins) | Firestore (colecciones de documentos, sin joins — se desnormaliza) |
| Realtime | Supabase Realtime (Postgres changes) | Firestore `onSnapshot` |
| Archivos | Supabase Storage | Firebase Storage |
| Server-side logic | Supabase Edge Functions (`register-student`) | Cloud Functions (`createInvite`, `claimInvite`, ...) |
| CI/CD | GitHub Actions → deploy automático en Vercel | GitHub Actions → build y `actions/deploy-pages` |

---

## Sesión 1 — Setup del proyecto ✅ (ya hecho)

Ya está en `firebase-app/`: Vite + React + TS + Tailwind con los mismos design tokens
(verde `#86ef86`, Sora + DM Sans, dark/light), cliente de Firebase (`src/lib/firebase.ts`),
`firebase.json` + `firestore.rules` + `storage.rules` esqueleto, `functions/` con
`createInvite`/`claimInvite`, y el workflow `.github/workflows/deploy-firebase-app.yml`.

**Pendiente manual antes de la Sesión 2:** crear el proyecto en Firebase Console, activar
Google como proveedor en Authentication, completar `.env` y `.firebaserc`. Ver la lista
completa en `firebase-app/README.md`.

---

## Sesión 2 — Auth con Google y sistema de invitaciones

**Prompt:** "Termina el flujo de invitaciones de `firebase-app`: agrega una pantalla
`AdminInviteUserPage` (admin) y `TeacherInviteStudentPage` (teacher) que llamen a la
Cloud Function `createInvite` con un formulario (email, nombre, rol, teacher asignado si
aplica). Muestra la lista de invitaciones pendientes por profesor. Prueba de punta a
punta con el emulador de Firebase: crear invitación → loguearse con una cuenta de Google
de prueba → verificar que `claimInvite` crea `users/{uid}` y borra la invitación."

**Entregables:**
- `features/admin/AdminInviteUserPage.tsx`, `features/teachers/TeacherInviteStudentPage.tsx`
- Regla de Firestore para listar invitaciones pendientes (solo lectura para
  admin/teacher dueño, vía una colección espejo de solo-lectura si hace falta)
- Tests del flujo con Firebase Emulator Suite

---

## Sesión 3 — Modelo de datos en Firestore y Security Rules completas

**Prompt:** "Diseña las colecciones de Firestore para todo el modelo de datos de Tutory
(ver tabla de abajo) y escribe `firestore.rules` completas: admin ve todo, teacher ve
solo sus estudiantes y lo que les pertenece, student ve solo lo suyo. Crea un script de
seed (`scripts/seed.ts` con el Admin SDK) con 1 admin, 2 teachers, 4 students y datos de
ejemplo, pensado para correr contra el emulador."

**Modelo de datos objetivo (colecciones):**

```
users            /users/{uid}                         (role, name, email, teacherId, avatarUrl)
groups           /groups/{groupId}                     (name, teacherId)
groupMembers     /groups/{groupId}/members/{uid}
studyPlans       /studyPlans/{planId}                  (name, description)
units            /studyPlans/{planId}/units/{unitId}   (title, order)
topics           /studyPlans/{planId}/units/{unitId}/topics/{topicId}  (title, contentHtml, order)
topicProgress    /users/{uid}/topicProgress/{topicId}  (answers, score, updatedAt)
quizzes          /quizzes/{quizId}                     (teacherId, title, date, questions[])
quizResults      /quizzes/{quizId}/results/{uid}        (answers, score, takenAt)
tasks            /tasks/{taskId}                        (teacherId, studentId, title, dueDate, status)
taskSubmissions  /tasks/{taskId}/submissions/{uid}       (text, voiceUrl, images[], submittedAt)
resources        /resources/{resourceId}                (teacherId, studentId|null, title, url, type)
classSessions    /classSessions/{sessionId}              (studentId, teacherId, scheduledDate, status, notes)
cycles           /cycles/{cycleId}                       (studentId, startDate, endDate, minClasses, tokens)
messages         /chats/{chatId}/messages/{messageId}    (senderId, body, sentAt, readAt) — chatId = uids ordenados y unidos
alerts           /alerts/{alertId}                       (type, data, resolved)
```

> Nota: sin joins, cada documento que necesite mostrarse en una lista (ej. `StudentCard`
> con nombre + próxima clase) debe traer los datos que necesita desnormalizados o
> resolverse con 2-3 queries en paralelo — no repliques el patrón de 5 `JOIN`s de SQL.

**Entregables:**
- `firestore.rules` completas (reemplaza el placeholder `allow read, write: if false`)
- `firestore.indexes.json` con los índices compuestos que pida la consola al primer uso
- `scripts/seed.ts`

---

## Sesión 4 — Vista Teacher: listado de estudiantes

**Prompt:** "Construye la vista principal del docente sobre Firestore: lista de sus
estudiantes (`where('teacherId', '==', uid)`) con nombre, foto, plan activo, próxima
clase y badges de alertas. Click en un estudiante abre su perfil con tabs: Plan,
Recursos, Tareas, Quizzes, Clases, Mensajes."

---

## Sesión 5 — Plan de estudios y Topics

**Prompt:** "Implementa el lector de plan de estudios contra las colecciones
`studyPlans/units/topics`. El estudiante lee el topic y responde preguntas de opción
múltiple, guardando el resultado en `users/{uid}/topicProgress/{topicId}`."

---

## Sesión 6 — Tareas

**Prompt:** "Módulo de tareas sobre `tasks`/`tasks/{id}/submissions`. Adjuntos (audio,
imágenes) van a Firebase Storage bajo `task-attachments/{uid}/...` (regla ya existe en
`storage.rules`). Feedback del docente y notificación de badge cuando hay feedback
nuevo."

---

## Sesión 7 — Quizzes diarios

**Prompt:** "Módulo de quizzes sobre `quizzes`/`quizzes/{id}/results`. Historial de
scores por estudiante, quiz del día asignado por fecha."

---

## Sesión 8 — Gestión de clases y calendario

**Prompt:** "Módulo de `classSessions` y `cycles`. Igual lógica de festivos
colombianos y reagendado que la versión Supabase (`legacy-vercel/src/lib/colombianHolidays.ts`
se puede copiar tal cual, no depende de Supabase)."

---

## Sesión 9 — Recursos y mensajes en tiempo real

**Prompt:** "Módulo de `resources` y chat en `/chats/{chatId}/messages` con
`onSnapshot` de Firestore para tiempo real (reemplaza Supabase Realtime). Badge de
mensajes no leídos."

---

## Sesión 10 — Vista Admin y pulido final

**Prompt:** "Panel de admin: todos los docentes/estudiantes, alertas, métricas básicas.
Prueba el flujo completo de punta a punta contra el emulador con los datos del seed."

---

## Sesión 11 — Deploy

**Prompt:** "Configura el deploy real: proyecto de Firebase en producción, GitHub Pages
como Source = GitHub Actions, secrets de `VITE_FIREBASE_*` y credenciales de deploy de
Cloud Functions en GitHub Actions. Documenta el corte: cuándo apagar `legacy-vercel` (o
dejarlo como fallback)."

---

## Pendientes manuales generales (no los puede hacer Claude)

1. Crear el proyecto en Firebase Console y activar Google como proveedor de Auth.
2. Configurar el OAuth consent screen en Google Cloud Console.
3. Habilitar el plan Blaze (pay-as-you-go) — Cloud Functions con dependencias externas
   lo requieren aunque el uso real caiga en la capa gratuita.
4. Habilitar GitHub Pages (Settings → Pages → Source → "GitHub Actions").
5. Cargar los secrets `VITE_FIREBASE_*` en GitHub Actions.
6. Configurar dominio personalizado, si aplica (DNS + "Authorized domains" en Firebase Auth).
7. Migrar datos reales de Postgres a Firestore, si en algún momento hay usuarios reales
   en producción sobre Supabase (no cubierto arriba — es un script aparte, pedirlo
   explícitamente cuando haga falta).
