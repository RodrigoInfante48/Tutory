# Tutory

Portal de gestión para profesores de inglés. Permite a los docentes ver y gestionar sus estudiantes, planes de estudio, recursos, tareas, quizzes y seguimiento de clases desde cualquier dispositivo.

**Inspirado en:** [Inglés con Sebas](https://app.inglesconsebas.com) — los archivos `login.html` y `portal.html` del repo son plantillas de referencia de ese producto.

---

## ¿Qué hace la app?

| Rol | Capacidades principales |
|-----|------------------------|
| **Estudiante** | Ver plan de estudios, hacer quizzes, entregar tareas, ver recursos, seguir clases y reagendarlas |
| **Docente** | Gestionar estudiantes asignados, crear quizzes/tareas, subir recursos, ver agenda, anotar avances |
| **Admin** | Vista global: todos los estudiantes, docentes, alertas, reportes y configuración |

### Módulos del portal

- **Home** — resumen del día, quiz diario, próxima clase
- **Plan de estudios** — unidades, temas, progreso por estudiante
- **Recursos** — links, archivos y materiales por estudiante o grupo
- **Tareas** — asignación, entrega con texto/audio/imágenes, retroalimentación
- **Quizzes** — banco de preguntas, resultados, quiz diario
- **Clases (Movements)** — calendario de sesiones, estados (tomada, no-show, reagendada, festivo), ciclos y tokens
- **Mensajes** — chat docente ↔ estudiante
- **Grupos** — clases grupales
- **Topics** — contenido interactivo con preguntas por tema

### Stack de la plantilla de referencia

- Frontend: HTML + CSS + React (via CDN, sin build)
- Backend: PHP (`api.php`, `auth.php`, `calendar.php`)
- Autenticación: usuario + PIN (4 dígitos)
- Temas: dark / light mode
- Fuentes: Sora + DM Sans (Google Fonts)

---

## Objetivo del proyecto

Construir una versión propia de este portal — **Tutory** — bajo control total, para que Valentina (y eventualmente otros docentes) puedan operar su propio negocio de clases de inglés sin depender de terceros.

---

## Estructura de archivos (estado inicial)

```
Tutory/
├── login.html          # Plantilla de referencia — pantalla de login
├── login password.html # Pantalla de recuperación de acceso
├── portal.html         # Plantilla de referencia — portal principal (SPA)
├── Login.png           # Captura de la pantalla de login
├── login password.png  # Captura de recuperación de acceso
└── portal.png          # Captura del portal
```

> Los HTML de referencia son archivos únicos de ~900KB que mezclan CSS, React y lógica de negocio. La versión propia se construirá con una arquitectura separada y mantenible.

---

## Stack objetivo (Tutory v1)

| Capa | Tecnología |
|------|-----------|
| Frontend | React + Vite + TailwindCSS |
| Backend / API | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Auth | Supabase Auth (email/password o magic link) |
| Deploy | Vercel (frontend) + Supabase cloud (backend) |
| CI/CD | GitHub Actions |

---

## Roadmap por sesiones

Ver [CLAUDE.md](./CLAUDE.md) para la guía de desarrollo sesión a sesión.
