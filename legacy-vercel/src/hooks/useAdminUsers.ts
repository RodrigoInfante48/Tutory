import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface AdminTeacher {
  id: string
  name: string
  email: string
  avatar_url: string | null
  studentCount: number
}

export interface AdminStudent {
  id: string
  name: string
  email: string
  avatar_url: string | null
  active: boolean
  teacherName: string | null
  planName: string | null
}

export interface AdminAlert {
  id: string
  type: string
  data: Record<string, unknown>
  resolved: boolean
  created_at: string
}

export function useAdminUsers() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([])
  const [students, setStudents] = useState<AdminStudent[]>([])
  const [alerts, setAlerts] = useState<AdminAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError(null)

        const [teachersRes, studentsRes, alertsRes] = await Promise.all([
          supabase
            .from('teachers')
            .select('id, users(name, email, avatar_url)'),
          supabase
            .from('students')
            .select('id, teacher_id, active, users(name, email, avatar_url), teachers(users(name)), study_plans(name)'),
          supabase
            .from('alerts')
            .select('id, type, data, resolved, created_at')
            .order('created_at', { ascending: false })
            .limit(20),
        ])

        if (teachersRes.error) throw teachersRes.error
        if (studentsRes.error) throw studentsRes.error
        if (alertsRes.error) throw alertsRes.error

        const studentCountByTeacher: Record<string, number> = {}
        for (const s of studentsRes.data ?? []) {
          const tId = (s as unknown as { teacher_id?: string }).teacher_id
          if (tId) {
            studentCountByTeacher[tId] = (studentCountByTeacher[tId] ?? 0) + 1
          }
        }

        const teacherList: AdminTeacher[] = (teachersRes.data ?? []).map(t => {
          const user = t.users as unknown as { name: string; email: string; avatar_url: string | null }
          return {
            id: t.id,
            name: user?.name ?? '',
            email: user?.email ?? '',
            avatar_url: user?.avatar_url ?? null,
            studentCount: studentCountByTeacher[t.id] ?? 0,
          }
        })

        const studentList: AdminStudent[] = (studentsRes.data ?? []).map(s => {
          const user = s.users as unknown as { name: string; email: string; avatar_url: string | null }
          const teacher = s.teachers as unknown as { users: { name: string } } | null
          const plan = s.study_plans as unknown as { name: string } | null
          return {
            id: s.id,
            name: user?.name ?? '',
            email: user?.email ?? '',
            avatar_url: user?.avatar_url ?? null,
            active: s.active,
            teacherName: teacher?.users?.name ?? null,
            planName: plan?.name ?? null,
          }
        })

        setTeachers(teacherList)
        setStudents(studentList)
        setAlerts((alertsRes.data ?? []) as AdminAlert[])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { teachers, students, alerts, loading, error }
}
