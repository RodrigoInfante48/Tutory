import type { QuizHistoryItem } from '../../hooks/useStudentQuiz'

interface Props {
  history: QuizHistoryItem[]
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-400' : score >= 60 ? 'bg-yellow-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-9 text-right">
        {Math.round(score)}%
      </span>
    </div>
  )
}

export default function QuizHistory({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
        No has hecho ningún quiz aún.
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {history.map(item => (
        <li
          key={item.id}
          className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 space-y-1.5"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {item.quiz_title}
            </p>
            <span className="text-xs text-gray-400 shrink-0">{formatDate(item.taken_at)}</span>
          </div>
          <ScoreBar score={item.score} />
          {item.total_questions > 0 && (
            <p className="text-[11px] text-gray-400">
              {Math.round((item.score / 100) * item.total_questions)}/{item.total_questions} correctas
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
