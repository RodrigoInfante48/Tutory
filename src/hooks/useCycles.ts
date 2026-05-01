import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Cycle {
  id: string
  student_id: string
  start_date: string
  end_date: string
  min_classes: number
  tokens: number
}

export interface CycleWithProgress extends Cycle {
  taken_count: number
  is_at_risk: boolean
  is_complete: boolean
}

export function useCycleForStudent(studentId: string | null): {
  cycle: CycleWithProgress | null
  loading: boolean
  error: string | null
  reload: () => void
} {
  const [cycle, setCycle] = useState<CycleWithProgress | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Get the active cycle (end_date >= today, nearest end_date)
      const { data: cycleData, error: cycleErr } = await supabase
        .from('cycles')
        .select('*')
        .eq('student_id', studentId)
        .gte('end_date', today)
        .order('end_date', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (cycleErr) throw cycleErr

      if (!cycleData) {
        setCycle(null)
        return
      }

      // Count taken sessions within the cycle period
      const { count, error: countErr } = await supabase
        .from('class_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'taken')
        .gte('scheduled_date', cycleData.start_date)
        .lte('scheduled_date', cycleData.end_date + 'T23:59:59')
      if (countErr) throw countErr

      const taken = count ?? 0
      setCycle({
        ...cycleData,
        taken_count: taken,
        is_complete: taken >= cycleData.min_classes,
        is_at_risk: taken < cycleData.min_classes,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar ciclo')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { load() }, [load])

  return { cycle, loading, error, reload: load }
}

// All active cycles for a teacher's students — used for the dashboard alert badge
export function useTeacherCycleAlerts(teacherId: string | null): {
  atRiskCount: number
  loading: boolean
} {
  const [atRiskCount, setAtRiskCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!teacherId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]

        // Get all students of this teacher
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .eq('teacher_id', teacherId)
        if (!students || cancelled) return

        const studentIds = students.map((s: { id: string }) => s.id)
        if (studentIds.length === 0) { setAtRiskCount(0); return }

        // Get active cycles
        const { data: cycles } = await supabase
          .from('cycles')
          .select('id, student_id, start_date, end_date, min_classes')
          .in('student_id', studentIds)
          .gte('end_date', today)
        if (!cycles || cancelled) return

        // For each cycle count taken sessions
        const checks = await Promise.all(
          cycles.map(async (c: { id: string; student_id: string; start_date: string; end_date: string; min_classes: number }) => {
            const { count } = await supabase
              .from('class_sessions')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', c.student_id)
              .eq('status', 'taken')
              .gte('scheduled_date', c.start_date)
              .lte('scheduled_date', c.end_date + 'T23:59:59')
            return (count ?? 0) < c.min_classes
          })
        )

        if (!cancelled) setAtRiskCount(checks.filter(Boolean).length)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [teacherId])

  return { atRiskCount, loading }
}
