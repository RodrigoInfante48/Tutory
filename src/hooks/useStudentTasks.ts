import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface StudentTask {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'submitted' | 'reviewed'
  created_at: string
  submission: {
    id: string
    body: string | null
    feedback: string | null
    submitted_at: string
    feedback_read_at: string | null
  } | null
}

export function useStudentTasks(studentId: string | undefined) {
  const [tasks, setTasks] = useState<StudentTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) return
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          id, title, description, due_date, status, created_at,
          task_submissions(id, body, feedback, submitted_at, feedback_read_at)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      if (err) throw err

      type RawSub = {
        id: string
        body: string | null
        feedback: string | null
        submitted_at: string
        feedback_read_at: string | null
      }

      const mapped: StudentTask[] = (data ?? []).map(t => {
        const subs = t.task_submissions as RawSub[]
        return {
          id: t.id,
          title: t.title,
          description: t.description,
          due_date: t.due_date,
          status: t.status as StudentTask['status'],
          created_at: t.created_at,
          submission: subs?.[0] ?? null,
        }
      })
      setTasks(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar tareas')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  return { tasks, loading, error, reload: load }
}

export async function submitTask(params: {
  taskId: string
  studentId: string
  body: string
}) {
  const { error: subErr } = await supabase
    .from('task_submissions')
    .insert({
      task_id: params.taskId,
      student_id: params.studentId,
      body: params.body.trim(),
    })
  if (subErr) throw subErr

  const { error: taskErr } = await supabase
    .from('tasks')
    .update({ status: 'submitted' })
    .eq('id', params.taskId)
  if (taskErr) throw taskErr
}

export async function markFeedbackRead(submissionId: string) {
  const { error } = await supabase
    .from('task_submissions')
    .update({ feedback_read_at: new Date().toISOString() })
    .eq('id', submissionId)
  if (error) throw error
}
