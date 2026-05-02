import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../features/auth/AuthContext'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { appUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const initial = appUser?.name?.charAt(0).toUpperCase() ?? '?'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-semibold text-gray-800 cursor-pointer hover:opacity-90 transition-opacity"
            aria-label="Menú de usuario"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {appUser?.name ?? '—'}
                </p>
                <p className="text-xs text-gray-400 truncate">{appUser?.email ?? ''}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
