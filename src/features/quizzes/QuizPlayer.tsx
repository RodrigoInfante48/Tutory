import { useState } from 'react'
import { submitQuizResult, type TodayQuiz } from '../../hooks/useStudentQuiz'

interface Props {
  quiz: TodayQuiz
  studentId: string
  onDone: (score: number, correct: number, total: number) => void
}

export default function QuizPlayer({ quiz, studentId, onDone }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array(quiz.questions.length).fill(null)
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allAnswered = answers.every(a => a !== null)

  function select(qIndex: number, oIndex: number) {
    setAnswers(prev => prev.map((a, i) => (i === qIndex ? oIndex : a)))
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await submitQuizResult(
        quiz.id,
        studentId,
        answers as number[],
        quiz.questions
      )
      onDone(result.score, result.correct, result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-heading font-bold text-gray-900 dark:text-white">
          {quiz.title}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {quiz.questions.length} pregunta{quiz.questions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ol className="space-y-5">
        {quiz.questions.map((q, qi) => (
          <li key={qi} className="space-y-2">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {qi + 1}. {q.text}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => select(qi, oi)}
                  className={`text-left text-sm rounded-lg border px-3 py-2 transition-colors ${
                    answers[qi] === oi
                      ? 'border-primary bg-primary/10 text-gray-900 dark:text-white dark:bg-primary/20 font-medium'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/50'
                  }`}
                >
                  <span className="font-semibold mr-1.5 text-gray-400">
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full bg-primary text-gray-900 font-semibold text-sm py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? 'Enviando…'
          : !allAnswered
          ? `Faltan ${answers.filter(a => a === null).length} respuesta(s)`
          : 'Entregar quiz'}
      </button>
    </div>
  )
}
