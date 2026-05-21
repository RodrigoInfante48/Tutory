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
  const { session, appUser, loading, fetchError } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05070B',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(255,255,255,0.08)',
          borderTop: '3px solid #86ef86',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#05070B',
        color: '#f0fdf4',
        fontFamily: 'DM Sans, sans-serif',
        padding: '24px',
        textAlign: 'center',
        gap: '16px',
      }}>
        <div style={{ fontSize: '32px' }}>⚠️</div>
        <p style={{ fontSize: '15px', color: '#f87171', maxWidth: '320px', margin: 0 }}>
          {fetchError}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: '#86ef86',
            color: '#031a03',
            border: 'none',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!session || !appUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If a specific role is required and user doesn't have it, redirect to their home
  if (allowedRole && appUser.role !== allowedRole) {
    return <Navigate to={ROLE_HOME[appUser.role]} replace />
  }

  return <>{children}</>
}
