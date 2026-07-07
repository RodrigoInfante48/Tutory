/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const configError: string | null =
  !firebaseConfig.apiKey || !firebaseConfig.projectId
    ? 'Error de configuración: faltan variables de entorno de Firebase. Contacta al administrador.'
    : null

// Se inicializa siempre para que el tipo nunca sea null en el resto de la app.
// Cuando configError está seteado, main.tsx muestra un fallback en vez de montar <App />.
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export const googleProvider = new GoogleAuthProvider()
// Restringe (opcionalmente) el picker a cuentas de un dominio de Google Workspace, ej:
// googleProvider.setCustomParameters({ hd: 'tudominio.com' })
