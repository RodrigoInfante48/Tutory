import { useEffect } from 'react'
import { AuthProvider } from './features/auth/AuthContext'
import AppRouter from './app/router'

export default function App() {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode === 'true') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
