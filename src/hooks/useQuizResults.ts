import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface QuizResultRow {
  id: string
  student_id: string
  student_name: string
  answers: number[]
  score: number
  taken_at: string
}

export function useQuizResults(quizId: string | null) {
  const [results, setResults] = useState<QuizResultRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!quizId) { setResults([]); return }
    setLoading(true)
    setError(null)

    async function fetch() {
      const { data: rows, error: err } = await supabase
        .from('quiz_results')
        .select('id, student_id, answers, score, taken_at')
        .eq('quiz_id', quizId!)
        .order('score', { ascending: false })

      if (err) { setError(err.message); setLoading(false); return }

      const ids = (rows ?? []).map(r => r.student_id)
      const { data: users } = ids.length
        ? await supabase.from('users').select('id, name').in('id', ids)
        : { data: [] }

      const nameMap = Object.fromEntries((users ?? []).map(u => [u.id, u.name]))

      setResults(
        (rows ?? []).map(r => ({
          id: r.id,
          student_id: r.student_id,
          student_name: nameMap[r.student_id] ?? 'Estudiante',
          answers: r.answers as number[],
          score: r.score,
          taken_at: r.taken_at,
        }))
      )
      setLoading(false)
    }

    fetch()
  }, [quizId])

  return { results, loading, error }
}
