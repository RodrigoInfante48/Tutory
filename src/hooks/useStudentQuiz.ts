import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Question } from './useTeacherQuizzes'

export interface TodayQuiz {
  id: string
  title: string
  questions: Question[]
  date: string
}

export interface QuizHistoryItem {
  id: string
  quiz_id: string
  quiz_title: string
  score: number
  taken_at: string
  total_questions: number
}

export function useStudentQuiz(studentId: string | undefined) {
  const [todayQuiz, setTodayQuiz] = useState<TodayQuiz | null>(null)
  const [alreadyTaken, setAlreadyTaken] = useState(false)
  const [myScore, setMyScore] = useState<number | null>(null)
  const [history, setHistory] = useState<QuizHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!studentId) { setLoading(false); return }
    setLoading(true)
    setError(null)

    const today = new Date().toISOString().split('T')[0]

    const { data: studentRow } = await supabase
      .from('students')
      .select('teacher_id')
      .eq('id', studentId)
      .single()

    if (studentRow?.teacher_id) {
      const { data: quiz } = await supabase
        .from('quizzes')
        .select('id, title, date, questions')
        .eq('teacher_id', studentRow.teacher_id)
        .eq('date', today)
        .maybeSingle()

      if (quiz) {
        setTodayQuiz(quiz as TodayQuiz)

        const { data: result } = await supabase
          .from('quiz_results')
          .select('score')
          .eq('quiz_id', quiz.id)
          .eq('student_id', studentId)
          .maybeSingle()

        if (result) {
          setAlreadyTaken(true)
          setMyScore(result.score)
        } else {
          setAlreadyTaken(false)
          setMyScore(null)
        }
      } else {
        setTodayQuiz(null)
      }
    }

    const { data: histRows } = await supabase
      .from('quiz_results')
      .select('id, quiz_id, score, taken_at, quizzes(title, questions)')
      .eq('student_id', studentId)
      .order('taken_at', { ascending: false })
      .limit(30)

    setHistory(
      (histRows ?? []).map(r => {
        const q = r.quizzes as unknown as { title: string; questions: unknown[] } | null
        return {
          id: r.id,
          quiz_id: r.quiz_id,
          quiz_title: q?.title ?? 'Quiz',
          score: r.score,
          taken_at: r.taken_at,
          total_questions: q?.questions?.length ?? 0,
        }
      })
    )

    setLoading(false)
  }, [studentId])

  useEffect(() => { load() }, [load])

  return { todayQuiz, alreadyTaken, myScore, history, loading, error, reload: load }
}

export async function submitQuizResult(
  quizId: string,
  studentId: string,
  answers: number[],
  questions: Question[]
): Promise<{ score: number; correct: number; total: number }> {
  const correct = answers.filter((a, i) => a === questions[i]?.correct_index).length
  const total = questions.length
  const score = total > 0 ? Math.round((correct / total) * 100) : 0

  const { error } = await supabase
    .from('quiz_results')
    .insert({ quiz_id: quizId, student_id: studentId, answers, score })

  if (error) throw new Error(error.message)
  return { score, correct, total }
}
