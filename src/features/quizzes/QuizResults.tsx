import { useQuizResults, type QuizResultRow } from '../../hooks/useQuizResults'
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

function QuestionBar({ pct, label }: { pct: number; label: string }) {
  const barColor =
    pct > 70
      ? 'bg-green-500'
      : pct >= 40
      ? 'bg-yellow-400'
      : 'bg-red-500'

  const textColor =
    pct > 70
      ? 'text-green-700 dark:text-green-400'
      : pct >= 40
      ? 'text-yellow-700 dark:text-yellow-400'
      : 'text-red-700 dark:text-red-400'

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{label}</p>
        <span className={`text-xs font-bold shrink-0 ${textColor}`}>{Math.round(pct)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function exportCSV(quiz: Quiz, results: QuizResultRow[]) {
  const headers = [
    'Estudiante',
    ...quiz.questions.map((_q, i) => `Pregunta ${i + 1}`),
    'Score Total',
  ]

  const rows = results.map((r: QuizResultRow) => [
    r.student_name,
    ...quiz.questions.map((q, i) =>
      r.answers[i] === q.correct_index ? 'Correcto' : 'Incorrecto'
    ),
    `${Math.round(r.score)}%`,
  ])

  const csv = [headers, ...rows]
    .map((row: string[]) => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${quiz.title.replace(/\s+/g, '_')}_resultados.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function QuizResults({ quiz, onBack }: Props) {
  const { results, loading, error } = useQuizResults(quiz.id)

  const avg =
    results.length > 0
      ? results.reduce((s: number, r: QuizResultRow) => s + r.score, 0) / results.length
      : null

  const questionStats = quiz.questions.map((q, i) => {
    if (results.length === 0) return { pct: 0, label: q.text }
    const correct = results.filter((r: QuizResultRow) => r.answers[i] === q.correct_index).length
    return { pct: (correct / results.length) * 100, label: q.text }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
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
        <>
          {/* Analytics per question */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aciertos por pregunta
            </h3>
            <div className="space-y-3">
              {questionStats.map((stat, i) => (
                <QuestionBar
                  key={i}
                  pct={stat.pct}
                  label={`P${i + 1}: ${stat.label}`}
                />
              ))}
            </div>
          </div>

          {/* Results table + export */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Resultados individuales
              </h3>
              <button
                onClick={() => exportCSV(quiz, results)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exportar CSV
              </button>
            </div>

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
                  {results.map((r: QuizResultRow) => (
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
          </div>
        </>
      )}
    </div>
  )
}
