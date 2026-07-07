# Tutory — Firebase + GitHub Pages

Reescritura de Tutory sobre Firebase (Auth + Firestore + Storage + Cloud Functions) con
hosting estático en GitHub Pages. Reemplaza a `../legacy-vercel` (Supabase + Vercel).

Ver `../FIREBASE_MIGRATION_PROMPTS.md` para la secuencia completa de sesiones de desarrollo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript + TailwindCSS |
| Backend | Firebase (Auth + Firestore + Storage + Cloud Functions) |
| Deploy frontend | GitHub Pages (GitHub Actions → `actions/deploy-pages`) |
| Deploy backend | Firebase CLI (`firebase deploy`) |
| Auth | Firebase Auth, **solo Google Sign-In** (sin password) |

## Por qué estas decisiones

- **HashRouter en vez de BrowserRouter**: GitHub Pages es hosting estático puro, no
  reescribe rutas al servidor como hacía `vercel.json`. Con rutas tipo `#/teacher` el
  navegador nunca pide al servidor una ruta que no existe.
- **Login solo con Google**: los estudiantes y profesores ya no reciben un PIN/contraseña
  creado por el admin. En su lugar, el admin (o el teacher, para sus propios estudiantes)
  crea una **invitación** (`invites/{email}`) vía la Cloud Function `createInvite`. La
  primera vez que la persona entra con su cuenta de Google, `claimInvite` convierte esa
  invitación en su perfil definitivo (`users/{uid}`) y le asigna el rol como *custom claim*.
- **Custom claims para el rol**: las Firestore/Storage Security Rules leen
  `request.auth.token.role`, no un documento (evita una lectura extra y evita que el
  cliente pueda falsear su propio rol).
- **Firestore en vez de Postgres**: no hay RLS ni SQL — la autorización vive en
  `firestore.rules` / `storage.rules`. El modelo de datos relacional de Supabase se
  redefine como colecciones (ver Sesión 3 en el doc de migración).

## Desarrollo local

```bash
npm install
cp .env.example .env      # completar con la config de tu proyecto Firebase
npm run dev

# Emuladores de Firebase (Auth + Firestore + Storage + Functions) para no
# pegarle al proyecto real mientras desarrollás:
npm run emulators
```

## Estructura

```
firebase-app/
├── src/
│   ├── app/              # Router, layout, redirect por rol
│   ├── features/
│   │   ├── auth/         # AuthContext (Google Sign-In) + LoginPage
│   │   ├── teachers/
│   │   ├── students/
│   │   ├── admin/
│   │   └── landing/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── firebase.ts   # cliente de Firebase (Auth/Firestore/Storage)
│   │   └── utils.ts
│   └── styles/
├── functions/            # Cloud Functions (createInvite, claimInvite, ...)
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── firebase.json
└── .firebaserc
```

## Pendientes manuales (no lo puede hacer Claude)

1. Crear el proyecto en [Firebase Console](https://console.firebase.google.com), activar
   Authentication → Google, Firestore, Storage y Functions (plan Blaze necesario para
   Cloud Functions salientes/con dependencias externas).
2. Copiar la config del SDK web a `.env` (y a los secrets de GitHub Actions).
3. Reemplazar `tutory-REEMPLAZAR-project-id` en `.firebaserc` por el project ID real.
4. En **Authentication → Settings → Authorized domains**, agregar
   `<usuario>.github.io`.
5. En **Google Cloud Console → OAuth consent screen**, configurar el consent screen
   (nombre de la app, logo, dominios autorizados) — obligatorio para que el picker de
   Google no muestre advertencias.
6. Habilitar GitHub Pages en el repo: Settings → Pages → Source → "GitHub Actions".
7. Agregar los secrets `VITE_FIREBASE_*` en GitHub → Settings → Secrets and variables → Actions.
8. `firebase deploy --only firestore:rules,storage:rules,functions` (requiere `firebase login` local o un service account en CI).
