import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface Question {
  text: string
  options: string[]
  correct_index: number
}

export interface Quiz {
  id: string
  teacher_id: string
  title: string
  date: string | null
  questions: Question[]
  created_at: string
}

export function useTeacherQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('quizzes')
      .select('*')
      .order('date', { ascending: false, nullsFirst: false })

    if (err) setError(err.message)
    else setQuizzes((data ?? []) as Quiz[])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { quizzes, loading, error, reload: load }
}

export async function createQuiz(quiz: {
  title: string
  date: string
  questions: Question[]
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { error } = await supabase
    .from('quizzes')
    .insert({ teacher_id: user.id, ...quiz })

  if (error) throw new Error(error.message)
}

export async function deleteQuiz(quizId: string) {
  const { error } = await supabase
    .from('quizzes')
    .delete()
    .eq('id', quizId)

  if (error) throw new Error(error.message)
}
