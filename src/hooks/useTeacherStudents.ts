import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export interface StudentSummary {
  id: string
  name: string
  email: string
  avatar_url: string | null
  phone: string | null
  active: boolean
  plan: { id: string; name: string } | null
  nextClass: { id: string; scheduled_date: string } | null
  pendingTasksCount: number
}

export function useTeacherStudents() {
  const { appUser } = useAuth()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appUser) return

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id, phone, active, users(name, email, avatar_url), study_plans(id, name)')
          .eq('teacher_id', appUser!.id)
          .eq('active', true)

        if (studentsError) throw studentsError

        const studentIds = (studentsData ?? []).map(s => s.id)

        if (studentIds.length === 0) {
          setStudents([])
          return
        }

        const now = new Date().toISOString()

        const [sessionsResult, tasksResult] = await Promise.all([
          supabase
            .from('class_sessions')
            .select('id, student_id, scheduled_date')
            .in('student_id', studentIds)
            .eq('status', 'scheduled')
            .gte('scheduled_date', now)
            .order('scheduled_date', { ascending: true }),
          supabase
            .from('tasks')
            .select('student_id')
            .in('student_id', studentIds)
            .eq('status', 'pending'),
        ])

        const nextClassByStudent: Record<string, { id: string; scheduled_date: string }> = {}
        for (const session of sessionsResult.data ?? []) {
          if (!nextClassByStudent[session.student_id]) {
            nextClassByStudent[session.student_id] = {
              id: session.id,
              scheduled_date: session.scheduled_date,
            }
          }
        }

        const pendingCountByStudent: Record<string, number> = {}
        for (const task of tasksResult.data ?? []) {
          if (task.student_id) {
            pendingCountByStudent[task.student_id] = (pendingCountByStudent[task.student_id] ?? 0) + 1
          }
        }

        const combined: StudentSummary[] = (studentsData ?? []).map(s => {
          const user = s.users as unknown as { name: string; email: string; avatar_url: string | null }
          const plan = s.study_plans as unknown as { id: string; name: string } | null
          return {
            id: s.id,
            name: user?.name ?? '',
            email: user?.email ?? '',
            avatar_url: user?.avatar_url ?? null,
            phone: s.phone,
            active: s.active,
            plan: plan ? { id: plan.id, name: plan.name } : null,
            nextClass: nextClassByStudent[s.id] ?? null,
            pendingTasksCount: pendingCountByStudent[s.id] ?? 0,
          }
        })

        setStudents(combined)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estudiantes')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [appUser])

  return { students, loading, error }
}
