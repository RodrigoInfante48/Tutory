import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 text-center px-6">
      <h1 className="font-heading font-bold text-4xl text-gray-900 dark:text-white mb-3">Tutory</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Tu profesor de inglés, tu plan de estudios y tus clases en un solo lugar.
      </p>
      <Link
        to="/login"
        className="px-5 py-2.5 rounded-lg bg-primary text-gray-950 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Iniciar sesión
      </Link>
    </div>
  )
}
