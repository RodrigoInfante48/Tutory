import AppLayout from '../../app/AppLayout'

export default function TeacherDashboard() {
  return (
    <AppLayout title="Dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Bienvenida, Valentina 👋
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Aquí verás tus estudiantes y próximas clases.
        </p>
      </div>
    </AppLayout>
  )
}
