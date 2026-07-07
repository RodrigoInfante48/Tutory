import { useState, useEffect } from 'react'
import { submitQuizResult, type TodayQuiz } from '../../hooks/useStudentQuiz'

interface Props {
  quiz: TodayQuiz
  studentId: string
  onDone: (score: number, correct: number, total: number) => void
}

const storageKey = (quizId: string, studentId: string) => `quiz_${quizId}_${studentId}`

interface SavedProgress {
  currentIndex: number
  answers: (number | null)[]
}

export default function QuizPlayer({ quiz, studentId, onDone }: Props) {
  const total = quiz.questions.length

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null))
  const [selected, setSelected] = useState<number | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(quiz.id, studentId))
      if (!raw) return
      const saved = JSON.parse(raw) as SavedProgress
      if (Array.isArray(saved.answers) && saved.answers.length === total && typeof saved.currentIndex === 'number') {
        setCurrentIndex(Math.min(Math.max(0, saved.currentIndex), total - 1))
        setAnswers(saved.answers)
      }
    } catch {
      // ignore corrupt localStorage
    }
  // only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (total === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">Este quiz no tiene preguntas.</p>
  }

  const question = quiz.questions[currentIndex]
  const isLast = currentIndex === total - 1

  async function handleSelect(optionIndex: number) {
    if (selected !== null || advancing || submitting) return

    const nextAnswers = answers.map((a, i) => (i === currentIndex ? optionIndex : a))
    setSelected(optionIndex)
    setAnswers(nextAnswers)
    setAdvancing(true)

    // let the selection highlight render before advancing
    await new Promise(r => setTimeout(r, 650))

    if (isLast) {
      setAdvancing(false)
      setSubmitting(true)
      try {
        const finalAnswers = nextAnswers.map(a => a ?? 0)
        const result = await submitQuizResult(quiz.id, studentId, finalAnswers, quiz.questions)
        localStorage.removeItem(storageKey(quiz.id, studentId))
        onDone(result.score, result.correct, result.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al enviar')
        setSubmitting(false)
      }
    } else {
      const nextIndex = currentIndex + 1
      const progress: SavedProgress = { currentIndex: nextIndex, answers: nextAnswers }
      localStorage.setItem(storageKey(quiz.id, studentId), JSON.stringify(progress))
      setCurrentIndex(nextIndex)
      setSelected(null)
      setAdvancing(false)
    }
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Guardando resultados…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="truncate font-medium text-gray-600 dark:text-gray-300">{quiz.title}</span>
          <span className="shrink-0 ml-2">{currentIndex + 1}/{total}</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
        {currentIndex + 1}. {question.text}
      </p>

      {/* Options — disabled once one is selected */}
      <div className="space-y-2.5">
        {question.options.map((opt, oi) => {
          const isSelected = selected === oi
          const isLocked = selected !== null
          return (
            <button
              key={oi}
              type="button"
              disabled={isLocked || advancing}
              onClick={() => handleSelect(oi)}
              className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/15 text-gray-900 dark:text-white font-semibold scale-[1.01] shadow-sm'
                  : isLocked
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-50 cursor-default'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/60 hover:bg-primary/5 cursor-pointer'
              }`}
            >
              <span className={`font-bold mr-2 ${isSelected ? 'text-primary' : 'text-gray-400'}`}>
                {String.fromCharCode(65 + oi)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {advancing && !submitting && (
        <p className="text-xs text-gray-400 text-center animate-pulse">
          {isLast ? 'Enviando…' : 'Siguiente pregunta…'}
        </p>
      )}

      {error && (
        <div className="space-y-2">
          <p className="text-sm text-red-500">{error}</p>
          <button
            onClick={() => { setError(null); setSelected(null); setAdvancing(false) }}
            className="text-xs text-primary hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
