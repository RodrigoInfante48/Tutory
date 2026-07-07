import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const { firebaseUser, loading, profileMissing, fetchError, signInWithGoogle } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [signingIn, setSigningIn] = useState(false)

  if (!loading && firebaseUser && !profileMissing && !fetchError) {
    return <Navigate to="/" replace />
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    const { error } = await signInWithGoogle()
    setSigningIn(false)
    if (error) setError(error)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-heading font-bold text-3xl text-gray-900 dark:text-white mb-2">Tutory</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Entra con la cuenta de Google que te dio tu profesor o administrador.
        </p>

        {profileMissing && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Tu cuenta de Google no tiene una invitación pendiente en Tutory. Pídele a tu profesor o
            administrador que te agregue.
          </div>
        )}
        {fetchError && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {fetchError}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 px-4 py-3 text-sm text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.86 2.7-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
          </svg>
          {signingIn ? 'Conectando...' : 'Continuar con Google'}
        </button>
      </div>
    </div>
  )
}
