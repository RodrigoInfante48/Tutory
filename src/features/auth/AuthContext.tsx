import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export type UserRole = 'admin' | 'teacher' | 'student'

export interface AppUser {
  id: string
  email: string
  role: UserRole
  name: string
  avatar_url: string | null
}

interface AuthState {
  session: Session | null
  appUser: AppUser | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchAppUser(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, name, avatar_url')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as AppUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    appUser: null,
    loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const appUser = session ? await fetchAppUser(session.user.id) : null
      setState({ session, appUser, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const appUser = session ? await fetchAppUser(session.user.id) : null
      setState({ session, appUser, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
