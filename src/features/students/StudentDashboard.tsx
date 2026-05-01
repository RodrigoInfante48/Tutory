import { useEffect, useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useStudyPlan } from '../../hooks/useStudyPlan'
import StudyPlanView from '../study-plans/StudyPlanView'
import { supabase } from '../../lib/supabase'

function useStudentPlanId(userId: string | undefined) {
  const [planId, setPlanId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('students')
      .select('plan_id')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setPlanId(data?.plan_id ?? null)
        setLoaded(true)
      })
  }, [userId])

  return { planId, loaded }
}

export default function StudentDashboard() {
  const { appUser } = useAuth()
  const { planId, loaded } = useStudentPlanId(appUser?.id)
  const { plan, loading } = useStudyPlan(planId, appUser?.id ?? '')

  return (
    <AppLayout title="Mi Portal">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Hola, {appUser?.name?.split(' ')[0] ?? 'estudiante'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aquí está tu plan de estudios.
          </p>
        </div>

        {/* Plan */}
        {!loaded || loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plan ? (
          <StudyPlanView plan={plan} />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Tu docente aún no te ha asignado un plan de estudios.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
