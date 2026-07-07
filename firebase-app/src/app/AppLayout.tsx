import { type ReactNode } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

interface AppLayoutProps {
  children: ReactNode
  title: string
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const { appUser, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="font-heading font-semibold text-lg text-gray-900 dark:text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {appUser && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{appUser.name}</span>
          )}
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Salir
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
