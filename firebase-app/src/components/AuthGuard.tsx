import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, type UserRole } from '../features/auth/AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

interface AuthGuardProps {
  children: ReactNode
  allowedRole?: UserRole
}

export default function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const { firebaseUser, appUser, loading, fetchError } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div
          className="w-9 h-9 rounded-full border-[3px] border-white/10 border-t-primary animate-spin"
          role="status"
          aria-label="Cargando"
        />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-950 text-center px-6">
        <div className="text-3xl">⚠️</div>
        <p className="text-sm text-red-400 max-w-xs">{fetchError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-5 py-2.5 rounded-lg bg-primary text-gray-950 font-semibold text-sm"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!firebaseUser || !appUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRole && appUser.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[appUser.role]} replace />
  }

  return <>{children}</>
}
