import { useUnreadCount } from './useMessages'
import { useTeacherTaskBadge, useStudentTaskBadge } from './useTaskBadge'
import { useAuth } from '../features/auth/AuthContext'

export interface NavItem {
  label: string
  href: string
  emoji: string
  badge?: number
}

export function useNavItems(): NavItem[] {
  const { appUser } = useAuth()
  const unreadCount = useUnreadCount()
  const teacherTaskBadge = useTeacherTaskBadge()
  const studentTaskBadge = useStudentTaskBadge()

  if (appUser?.role === 'admin') {
    return [
      { label: 'Panel Admin', href: '/admin', emoji: '🛠️' },
      { label: 'Planes', href: '/admin/plans', emoji: '📖' },
    ]
  }

  if (appUser?.role === 'student') {
    return [
      { label: 'Mi portal', href: '/student', emoji: '🏠', badge: studentTaskBadge || undefined },
      { label: 'Mi Vault', href: '/student/vault', emoji: '🗄️' },
    ]
  }

  return [
    { label: 'Dashboard', href: '/teacher', emoji: '🏠' },
    { label: 'Clases', href: '/teacher/classes', emoji: '📅' },
    { label: 'Tareas', href: '/teacher/tasks', emoji: '📝', badge: teacherTaskBadge || undefined },
    { label: 'Quizzes', href: '/teacher/quizzes', emoji: '🧠' },
    { label: 'Grupos', href: '/teacher/groups', emoji: '👥' },
    { label: 'Recursos', href: '/teacher/resources', emoji: '📚' },
    { label: 'Mensajes', href: '/teacher/messages', emoji: '💬', badge: unreadCount },
  ]
}
