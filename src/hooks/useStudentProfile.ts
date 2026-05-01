import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface ProfileTask {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'submitted' | 'reviewed'
  created_at: string
}

export interface ProfileClassSession {
  id: string
  scheduled_date: string
  status: string
  notes: string | null
}

export interface ProfileResource {
  id: string
  title: string
  url: string
  type: string
  created_at: string
}

export interface ProfileQuizResult {
  id: string
  score: number | null
  taken_at: string
  quiz: { id: string; title: string; date: string | null } | null
}

export interface ProfileUnit {
  id: string
  title: string
  order: number
}

export interface StudentProfileData {
  tasks: ProfileTask[]
  classSessions: ProfileClassSession[]
  resources: ProfileResource[]
  quizResults: ProfileQuizResult[]
  planUnits: ProfileUnit[]
}

export function useStudentProfile(studentId: string | null, planId: string | null) {
  const [data, setData] = useState<StudentProfileData>({
    tasks: [],
    classSessions: [],
    resources: [],
    quizResults: [],
    planUnits: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return

    async function load() {
      try {
        setLoading(true)
        setError(null)

        const toPromise = <T,>(q: PromiseLike<T>): Promise<T> =>
          new Promise((res, rej) => q.then(res, rej))

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queries: Promise<any>[] = [
          toPromise(supabase
            .from('tasks')
            .select('id, title, description, due_date, status, created_at')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })),
          toPromise(supabase
            .from('class_sessions')
            .select('id, scheduled_date, status, notes')
            .eq('student_id', studentId)
            .order('scheduled_date', { ascending: false })),
          toPromise(supabase
            .from('resources')
            .select('id, title, url, type, created_at')
            .or(`student_id.eq.${studentId},student_id.is.null`)
            .order('created_at', { ascending: false })),
          toPromise(supabase
            .from('quiz_results')
            .select('id, score, taken_at, quizzes(id, title, date)')
            .eq('student_id', studentId)
            .order('taken_at', { ascending: false })),
        ]

        if (planId) {
          queries.push(
            toPromise(supabase
              .from('units')
              .select('id, title, order')
              .eq('plan_id', planId)
              .order('order', { ascending: true }))
          )
        }

        const results = await Promise.all(queries)

        const [tasksRes, classesRes, resourcesRes, quizRes, unitsRes] = results as Array<{
          data: unknown[] | null
          error: unknown
        }>

        const quizData = (quizRes.data ?? []) as Array<{
          id: string
          score: number | null
          taken_at: string
          quizzes: { id: string; title: string; date: string | null } | null
        }>

        setData({
          tasks: (tasksRes.data ?? []) as ProfileTask[],
          classSessions: (classesRes.data ?? []) as ProfileClassSession[],
          resources: (resourcesRes.data ?? []) as ProfileResource[],
          quizResults: quizData.map(r => ({
            id: r.id,
            score: r.score,
            taken_at: r.taken_at,
            quiz: r.quizzes,
          })),
          planUnits: (unitsRes?.data ?? []) as ProfileUnit[],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar perfil')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [studentId, planId])

  return { data, loading, error }
}
