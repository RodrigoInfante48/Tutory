import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export function useTeacherTaskBadge(): number {
  const { appUser } = useAuth()
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    if (!appUser?.id || appUser.role !== 'teacher') return
    const { count: c } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('teacher_id', appUser.id)
      .eq('status', 'submitted')
    setCount(c ?? 0)
  }, [appUser?.id, appUser?.role])

  useEffect(() => { load() }, [load])
  return count
}

export function useStudentTaskBadge(): number {
  const { appUser } = useAuth()
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    if (!appUser?.id || appUser.role !== 'student') return
    const { count: c } = await supabase
      .from('task_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('student_id', appUser.id)
      .not('feedback', 'is', null)
      .is('feedback_read_at', null)
    setCount(c ?? 0)
  }, [appUser?.id, appUser?.role])

  useEffect(() => { load() }, [load])
  return count
}
