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

export interface CycleAlert {
  studentId: string
  studentName: string
  takenCount: number
  minClasses: number
  endDate: string
  deficit: number
  daysLeft: number
  isImpossible: boolean
}

// All active cycles for a teacher's students — used for the dashboard alert badge and detail table
export function useTeacherCycleAlerts(teacherId: string | null): {
  atRiskCount: number
  alerts: CycleAlert[]
  loading: boolean
} {
  const [alerts, setAlerts] = useState<CycleAlert[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!teacherId) return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayStr = today.toISOString().split('T')[0]

        // Get all students of this teacher with their names
        const { data: students } = await supabase
          .from('students')
          .select('id, users(name)')
          .eq('teacher_id', teacherId)
        if (!students || cancelled) return

        const studentIds = students.map((s: { id: string }) => s.id)
        if (studentIds.length === 0) { setAlerts([]); return }

        const studentNameMap: Record<string, string> = {}
        for (const s of students) {
          const user = s.users as unknown as { name: string } | null
          studentNameMap[s.id] = user?.name ?? 'Estudiante'
        }

        // Get active cycles
        const { data: cycles } = await supabase
          .from('cycles')
          .select('id, student_id, start_date, end_date, min_classes')
          .in('student_id', studentIds)
          .gte('end_date', todayStr)
        if (!cycles || cancelled) return

        // For each cycle count taken sessions and compute deficit metrics
        const results = await Promise.all(
          cycles.map(async (c: { id: string; student_id: string; start_date: string; end_date: string; min_classes: number }) => {
            const { count } = await supabase
              .from('class_sessions')
              .select('*', { count: 'exact', head: true })
              .eq('student_id', c.student_id)
              .eq('status', 'taken')
              .gte('scheduled_date', c.start_date)
              .lte('scheduled_date', c.end_date + 'T23:59:59')

            const takenCount = count ?? 0
            const deficit = c.min_classes - takenCount
            const endDay = new Date(c.end_date)
            endDay.setHours(0, 0, 0, 0)
            const daysLeft = Math.max(0, Math.round((endDay.getTime() - today.getTime()) / 86400000))
            const isImpossible = deficit > 0 && deficit > daysLeft

            return {
              studentId: c.student_id,
              studentName: studentNameMap[c.student_id] ?? 'Estudiante',
              takenCount,
              minClasses: c.min_classes,
              endDate: c.end_date,
              deficit,
              daysLeft,
              isImpossible,
            } satisfies CycleAlert
          })
        )

        if (!cancelled) setAlerts(results.filter(r => r.deficit > 0))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [teacherId])

  return { atRiskCount: alerts.length, alerts, loading }
}
