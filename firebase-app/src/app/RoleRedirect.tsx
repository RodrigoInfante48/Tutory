import { Navigate } from 'react-router-dom'
import { useAuth, type UserRole } from '../features/auth/AuthContext'

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
}

export default function RoleRedirect() {
  const { appUser } = useAuth()
  if (!appUser) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[appUser.role]} replace />
}
