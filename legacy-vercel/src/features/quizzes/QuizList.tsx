import { useState } from 'react'
import { useTeacherQuizzes, deleteQuiz, type Quiz } from '../../hooks/useTeacherQuizzes'
import QuizCreator from './QuizCreator'
import QuizResults from './QuizResults'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr + 'T00:00:00'))
}

function isToday(dateStr: string | null) {
  if (!dateStr) return false
  return dateStr === new Date().toISOString().split('T')[0]
}

export default function QuizList() {
  const { quizzes, loading, error, reload } = useTeacherQuizzes()
  const [creating, setCreating] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(quiz: Quiz, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Eliminar el quiz "${quiz.title}"? Esta acción no se puede deshacer.`)) return
    setDeleting(quiz.id)
    try {
      await deleteQuiz(quiz.id)
      reload()
    } catch {
      alert('Error al eliminar el quiz')
    } finally {
      setDeleting(null)
    }
  }

  if (selectedQuiz) {
    return (
      <QuizResults
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
      />
    )
  }

  if (creating) {
    return (
      <QuizCreator
        onCreated={() => { setCreating(false); reload() }}
        onCancel={() => setCreating(false)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Quizzes
        </h2>
        <button
          onClick={() => setCreating(true)}
          className="bg-primary text-gray-900 text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Nuevo quiz
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && quizzes.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No has creado ningún quiz todavía.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 text-sm text-primary hover:underline font-medium"
          >
            Crear tu primer quiz
          </button>
        </div>
      )}

      {!loading && quizzes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="text-left px-4 py-2 font-medium">Título</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Fecha</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Preguntas</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {quizzes.map(quiz => (
                <tr
                  key={quiz.id}
                  onClick={() => setSelectedQuiz(quiz)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {quiz.title}
                      </span>
                      {isToday(quiz.date) && (
                        <span className="text-[10px] font-bold bg-primary text-gray-900 rounded-full px-1.5 py-0.5">
                          Hoy
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                    {formatDate(quiz.date)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    {quiz.questions.length}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={e => handleDelete(quiz, e)}
                      disabled={deleting === quiz.id}
                      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {deleting === quiz.id ? '…' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
