import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type User, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getFunctions } from 'firebase/functions'
import { auth, db, googleProvider, app } from '../../lib/firebase'

export type UserRole = 'admin' | 'teacher' | 'student'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  name: string
  teacherId: string | null
  avatarUrl: string | null
}

interface AuthContextValue {
  firebaseUser: User | null
  appUser: AppUser | null
  loading: boolean
  /** True cuando hay sesión de Google pero no hay perfil ni invitación pendiente. */
  profileMissing: boolean
  fetchError: string | null
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const functions = getFunctions(app)

async function loadProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return snap.data() as AppUser
}

async function tryClaimInvite(): Promise<AppUser | null> {
  const claimInvite = httpsCallable<unknown, { profile: AppUser }>(functions, 'claimInvite')
  const result = await claimInvite()
  return result.data.profile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileMissing, setProfileMissing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      setFetchError(null)
      setProfileMissing(false)

      if (!user) {
        setAppUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let profile = await loadProfile(user.uid)
        if (!profile) {
          // Primer login: puede haber una invitación de un admin/teacher esperando.
          try {
            profile = await tryClaimInvite()
            // El custom claim `role` recién seteado no está en el ID token actual.
            await user.getIdToken(true)
          } catch {
            profile = null
          }
        }
        setAppUser(profile)
        setProfileMissing(profile === null)
      } catch (err) {
        console.error('[AuthProvider] Error cargando el perfil:', err)
        setFetchError('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.'
      return { error: message }
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ firebaseUser, appUser, loading, profileMissing, fetchError, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
