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
  /** Sign in using a 4-digit PIN — appends '00' to meet Supabase's 6-char minimum. */
  signInWithPin: (email: string, pin: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  /** True when a session exists but no matching row was found in the users table. */
  profileMissing: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchAppUser(userId: string): Promise<AppUser | null> {
  try {
    const { data, error } = await Promise.race([
      supabase
        .from('users')
        .select('id, email, role, name, avatar_url')
        .eq('id', userId)
        .single(),
      new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('timeout after 20s') }), 20000)
      ),
    ])
    if (error) {
      console.error('[fetchAppUser] Supabase error:', JSON.stringify(error))
      return null
    }
    if (!data) {
      console.error('[fetchAppUser] No row found for userId:', userId)
      return null
    }
    return data as AppUser
  } catch (err) {
    console.error('[fetchAppUser] Exception:', err)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Effect 1: subscribe to auth state — ONLY update session state here.
  // Never call supabase.from() or getSession() inside this callback:
  // the auth client holds the token lock during the callback and any
  // concurrent Supabase query will trigger "lock stolen" errors.
  useEffect(() => {
    let mounted = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      if (!newSession) {
        setAppUser(null)
        setLoading(false)
      } else {
        setLoading(true)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Effect 2: fetch the app-level user profile whenever the session changes.
  // This runs in a separate React render cycle (after the auth lock is released),
  // so the supabase.from() query can acquire the token lock without contention.
  useEffect(() => {
    if (!session) return
    let mounted = true

    fetchAppUser(session.user.id).then((user) => {
      if (mounted) {
        setAppUser(user)
        setLoading(false)
      }
    })

    return () => { mounted = false }
  }, [session])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  const signInWithPin = (email: string, pin: string) => signIn(email, pin + '00')

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const profileMissing = !loading && session !== null && appUser === null

  return (
    <AuthContext.Provider value={{ session, appUser, loading, profileMissing, signIn, signInWithPin, signOut }}>
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
