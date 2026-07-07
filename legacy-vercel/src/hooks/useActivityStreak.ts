import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function computeStreak(days: Set<string>): number {
  if (days.size === 0) return 0

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)
  const today = todayDate.toISOString().split('T')[0]

  const yesterdayDate = new Date(todayDate.getTime() - 86400000)
  const yesterday = yesterdayDate.toISOString().split('T')[0]

  let startDay: string
  if (days.has(today)) {
    startDay = today
  } else if (days.has(yesterday)) {
    startDay = yesterday
  } else {
    return 0
  }

  let streak = 0
  let current = new Date(startDay + 'T12:00:00')

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const key = current.toISOString().split('T')[0]
    if (days.has(key)) {
      streak++
      current = new Date(current.getTime() - 86400000)
    } else {
      break
    }
  }

  return streak
}

export function useActivityStreak(studentId: string | undefined) {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) { setLoading(false); return }

    Promise.all([
      supabase
        .from('topic_progress')
        .select('completed_at')
        .eq('student_id', studentId)
        .eq('completed', true)
        .not('completed_at', 'is', null),
      supabase
        .from('quiz_results')
        .select('taken_at')
        .eq('student_id', studentId),
    ]).then(([topicRes, quizRes]) => {
      const days = new Set<string>()
      for (const row of topicRes.data ?? []) {
        if (row.completed_at) days.add(row.completed_at.split('T')[0])
      }
      for (const row of quizRes.data ?? []) {
        if (row.taken_at) days.add(row.taken_at.split('T')[0])
      }
      setStreak(computeStreak(days))
      setLoading(false)
    })
  }, [studentId])

  return { streak, loading }
}
