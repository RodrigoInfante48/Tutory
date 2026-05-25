import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../app/AppLayout'

export default function AdminPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()

  return (
    <AppLayout title="Plan de estudio">
      <div className="p-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/admin/plans')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-6"
        >
          ← Volver a planes
        </button>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🚧</div>
          <h2 className="text-xl font-heading font-bold text-gray-700 dark:text-gray-300 mb-2">
            En construcción
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs">
            La vista detallada del plan se construirá en la próxima sesión.
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600 mt-3 font-mono">{planId}</p>
        </div>
      </div>
    </AppLayout>
  )
}
