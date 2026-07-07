import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface NextClass {
  id: string
  scheduled_date: string
  session_type: string
}

export function useStudentNextClass(studentId: string | undefined) {
  const [nextClass, setNextClass] = useState<NextClass | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) { setLoading(false); return }
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('class_sessions')
      .select('id, scheduled_date, session_type')
      .eq('student_id', studentId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setNextClass(data as NextClass | null)
        setLoading(false)
      })
  }, [studentId])

  return { nextClass, loading }
}
