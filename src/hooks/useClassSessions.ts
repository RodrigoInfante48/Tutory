import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type SessionStatus = 'scheduled' | 'taken' | 'no_show' | 'cancelled' | 'rescheduled' | 'holiday'

export interface ClassSession {
  id: string
  student_id: string
  teacher_id: string
  scheduled_date: string
  status: SessionStatus
  notes: string | null
  rescheduled_from: string | null
  student: {
    id: string
    name: string
    avatar_url: string | null
  } | null
}

interface UseClassSessionsOptions {
  teacherId: string | null
  year: number
  month: number // 0-indexed
}

export function useClassSessions({ teacherId, year, month }: UseClassSessionsOptions) {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    setError(null)
    try {
      const start = new Date(year, month, 1).toISOString()
      const end = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const { data, error: err } = await supabase
        .from('class_sessions')
        .select(`
          id, student_id, teacher_id, scheduled_date, status, notes, rescheduled_from,
          users:student_id ( id, name, avatar_url )
        `)
        .eq('teacher_id', teacherId)
        .gte('scheduled_date', start)
        .lte('scheduled_date', end)
        .order('scheduled_date', { ascending: true })
      if (err) throw err
      const mapped = (data ?? []).map((row: {
        id: string
        student_id: string
        teacher_id: string
        scheduled_date: string
        status: SessionStatus
        notes: string | null
        rescheduled_from: string | null
        users: { id: string; name: string; avatar_url: string | null } | null
      }) => ({
        id: row.id,
        student_id: row.student_id,
        teacher_id: row.teacher_id,
        scheduled_date: row.scheduled_date,
        status: row.status,
        notes: row.notes,
        rescheduled_from: row.rescheduled_from,
        student: row.users,
      }))
      setSessions(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clases')
    } finally {
      setLoading(false)
    }
  }, [teacherId, year, month])

  useEffect(() => { load() }, [load])

  return { sessions, loading, error, reload: load }
}

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus,
  notes?: string,
): Promise<void> {
  const { error } = await supabase
    .from('class_sessions')
    .update({ status, ...(notes !== undefined ? { notes } : {}) })
    .eq('id', sessionId)
  if (error) throw error
}

export async function createSession(params: {
  teacherId: string
  studentId: string
  scheduledDate: string
  notes?: string
  rescheduledFrom?: string
}): Promise<ClassSession> {
  const { data, error } = await supabase
    .from('class_sessions')
    .insert({
      teacher_id: params.teacherId,
      student_id: params.studentId,
      scheduled_date: params.scheduledDate,
      status: 'scheduled' as SessionStatus,
      notes: params.notes ?? null,
      rescheduled_from: params.rescheduledFrom ?? null,
    })
    .select(`
      id, student_id, teacher_id, scheduled_date, status, notes, rescheduled_from,
      users:student_id ( id, name, avatar_url )
    `)
    .single()
  if (error) throw error
  const row = data as {
    id: string
    student_id: string
    teacher_id: string
    scheduled_date: string
    status: SessionStatus
    notes: string | null
    rescheduled_from: string | null
    users: { id: string; name: string; avatar_url: string | null } | null
  }
  return {
    id: row.id,
    student_id: row.student_id,
    teacher_id: row.teacher_id,
    scheduled_date: row.scheduled_date,
    status: row.status,
    notes: row.notes,
    rescheduled_from: row.rescheduled_from,
    student: row.users,
  }
}

// For the student profile tab — loads all sessions for one student
export function useStudentClassSessions(studentId: string | null) {
  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('class_sessions')
        .select('id, student_id, teacher_id, scheduled_date, status, notes, rescheduled_from')
        .eq('student_id', studentId)
        .order('scheduled_date', { ascending: false })
      if (err) throw err
      setSessions((data ?? []).map((row: {
        id: string
        student_id: string
        teacher_id: string
        scheduled_date: string
        status: SessionStatus
        notes: string | null
        rescheduled_from: string | null
      }) => ({ ...row, student: null })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar clases')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  return { sessions, loading, error, reload: load }
}
