import { Link, useLocation } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useUnreadCount } from '../hooks/useMessages'
import { useAuth } from '../features/auth/AuthContext'

interface NavItem {
  label: string
  href: string
  emoji: string
  badge?: number
}

function useNavItems(): NavItem[] {
  const { appUser } = useAuth()
  const unreadCount = useUnreadCount()

  if (appUser?.role === 'admin') {
    return [
      { label: 'Panel Admin', href: '/admin', emoji: '🛠️' },
    ]
  }

  if (appUser?.role === 'student') {
    return [
      { label: 'Mi portal', href: '/student', emoji: '🏠' },
    ]
  }

  return [
    { label: 'Dashboard', href: '/teacher', emoji: '🏠' },
    { label: 'Clases', href: '/teacher/classes', emoji: '📅' },
    { label: 'Tareas', href: '/teacher/tasks', emoji: '📝' },
    { label: 'Quizzes', href: '/teacher/quizzes', emoji: '🧠' },
    { label: 'Recursos', href: '/teacher/resources', emoji: '📚' },
    { label: 'Mensajes', href: '/teacher/messages', emoji: '💬', badge: unreadCount },
  ]
}

export default function Sidebar() {
  const location = useLocation()
  const navItems = useNavItems()

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <span className="font-heading font-bold text-2xl text-primary">
          Tutory
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary-dark dark:text-primary'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <span className="text-lg leading-none">{item.emoji}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">Tutory v0.1.0</p>
      </div>
    </aside>
  )
}
