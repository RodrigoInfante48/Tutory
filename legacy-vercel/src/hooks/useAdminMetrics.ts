import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface AdminMetrics {
  classesThisMonth: number
  pendingTasks: number
  completedQuizzes: number
  activeStudents: number
  unresolvedAlerts: number
}

export function useAdminMetrics() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

        const [classesRes, pendingTasksRes, quizzesRes, studentsRes, alertsRes] = await Promise.all([
          supabase
            .from('class_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'taken')
            .gte('scheduled_date', monthStart)
            .lte('scheduled_date', monthEnd),
          supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .in('status', ['pending', 'submitted']),
          supabase
            .from('quiz_results')
            .select('id', { count: 'exact', head: true })
            .gte('taken_at', monthStart)
            .lte('taken_at', monthEnd),
          supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('active', true),
          supabase
            .from('alerts')
            .select('id', { count: 'exact', head: true })
            .eq('resolved', false),
        ])

        setMetrics({
          classesThisMonth: classesRes.count ?? 0,
          pendingTasks: pendingTasksRes.count ?? 0,
          completedQuizzes: quizzesRes.count ?? 0,
          activeStudents: studentsRes.count ?? 0,
          unresolvedAlerts: alertsRes.count ?? 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar métricas')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { metrics, loading, error }
}
