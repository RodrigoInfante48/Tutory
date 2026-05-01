import AppLayout from '../../app/AppLayout'

export default function AdminDashboard() {
  return (
    <AppLayout title="Panel de Administración">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Panel de Administración 🛠️
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Aquí gestionarás docentes, estudiantes y métricas del sistema.
        </p>
      </div>
    </AppLayout>
  )
}
