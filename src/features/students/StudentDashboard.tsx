import AppLayout from '../../app/AppLayout'

export default function StudentDashboard() {
  return (
    <AppLayout title="Mi Portal">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Bienvenido/a 👋
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Aquí verás tus tareas, quizzes y progreso.
        </p>
      </div>
    </AppLayout>
  )
}
