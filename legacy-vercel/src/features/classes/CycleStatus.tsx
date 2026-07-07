import { useCycleForStudent, type CycleWithProgress } from '../../hooks/useCycles'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

interface CycleBarProps {
  cycle: CycleWithProgress
}

function CycleBar({ cycle }: CycleBarProps) {
  const pct = cycle.min_classes > 0
    ? Math.min(100, Math.round((cycle.taken_count / cycle.min_classes) * 100))
    : 100

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Ciclo activo
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(cycle.start_date)} — {formatDate(cycle.end_date)}
          </p>
        </div>
        {cycle.is_at_risk && !cycle.is_complete ? (
          <span className="flex-shrink-0 text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full px-2 py-0.5">
            En riesgo
          </span>
        ) : cycle.is_complete ? (
          <span className="flex-shrink-0 text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5">
            Completo
          </span>
        ) : null}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            {cycle.taken_count} de {cycle.min_classes} clases mínimas
          </span>
          <span className={`font-semibold ${cycle.is_complete ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
            {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              cycle.is_complete
                ? 'bg-primary'
                : pct >= 75
                ? 'bg-yellow-400'
                : 'bg-red-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Tokens: <strong className="text-gray-700 dark:text-gray-300">{cycle.tokens}</strong></span>
        <span>Restantes: <strong className="text-gray-700 dark:text-gray-300">{Math.max(0, cycle.min_classes - cycle.taken_count)}</strong></span>
      </div>
    </div>
  )
}

interface CycleStatusProps {
  studentId: string
}

export default function CycleStatus({ studentId }: CycleStatusProps) {
  const { cycle, loading } = useCycleForStudent(studentId)

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3 mb-2" />
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  if (!cycle) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">Sin ciclo activo.</p>
      </div>
    )
  }

  return <CycleBar cycle={cycle} />
}
