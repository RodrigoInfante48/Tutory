import { useQuizResults } from '../../hooks/useQuizResults'
import type { Quiz } from '../../hooks/useTeacherQuizzes'

interface Props {
  quiz: Quiz
  onBack: () => void
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400'
      : score >= 60
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {Math.round(score)}%
    </span>
  )
}

export default function QuizResults({ quiz, onBack }: Props) {
  const { results, loading, error } = useQuizResults(quiz.id)

  const avg =
    results.length > 0
      ? results.reduce((s, r) => s + r.score, 0) / results.length
      : null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
        >
          ← Volver
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white truncate">
            {quiz.title}
          </h2>
          <p className="text-xs text-gray-400">
            {quiz.date} · {quiz.questions.length} preguntas
          </p>
        </div>
        {avg !== null && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Promedio</p>
            <ScoreBadge score={avg} />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
          <p className="text-sm text-gray-400">
            Ningún estudiante ha hecho este quiz todavía.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase">
                <th className="text-left px-4 py-2 font-medium">Estudiante</th>
                <th className="text-left px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {results.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {r.student_name}
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={r.score} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                    {formatDate(r.taken_at)}
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
