import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmModal from '../../components/ConfirmModal'
import SkeletonCard from '../../components/SkeletonCard'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer,
} from 'recharts'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useStudyPlan } from '../../hooks/useStudyPlan'
import StudyPlanView, { StudyPlanSkeleton } from '../study-plans/StudyPlanView'
import { supabase } from '../../lib/supabase'
import { useStudentTasks, markFeedbackRead, type StudentTask } from '../../hooks/useStudentTasks'
import { useStudentQuiz } from '../../hooks/useStudentQuiz'
import QuizPlayer from '../quizzes/QuizPlayer'
import QuizHistory from '../quizzes/QuizHistory'
import { useStudentGlossary, toggleMastered } from '../../hooks/useStudentGlossary'
import { useStudentCoins } from '../../hooks/useStudentCoins'
import { useSkillScores, SKILLS } from '../../hooks/useSkillScores'
import { useStudentBadges, BADGE_META, ALL_BADGE_TYPES } from '../../hooks/useStudentBadges'
import { useStudentNextClass } from '../../hooks/useStudentNextClass'
import { useActivityStreak } from '../../hooks/useActivityStreak'

const SESSION_TYPE_LABELS: Record<string, string> = {
  precision_sprint: 'Precision Sprint',
  culture_club: 'Culture Club',
  professional_lab: 'Professional Lab',
  standard: 'Clase estándar',
}

function formatNextClass(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

interface ProgressOverviewProps {
  studentId: string
  totalTopics: number
  completedTopics: number
  progressPct: number
  avgScore: number | null
}

function ProgressOverview({ studentId, totalTopics, completedTopics, progressPct, avgScore }: ProgressOverviewProps) {
  const { nextClass, loading: loadingClass } = useStudentNextClass(studentId)
  const { streak, loading: loadingStreak } = useActivityStreak(studentId)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
      {/* Plan progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Progreso del plan</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {totalTopics === 0 ? '—' : `${completedTopics}/${totalTopics} temas`}
          </span>
        </div>
        <div className="relative h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 bottom-0 rounded-full"
            style={{ background: 'linear-gradient(90deg, #4ade80, #86ef86)' }}
            initial={{ width: 0 }}
            animate={{ width: totalTopics === 0 ? '0%' : `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-400 text-right">
          {totalTopics === 0 ? 'Sin plan asignado' : `${progressPct}% completado`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Quiz avg */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
          <p className="text-[11px] text-gray-400 mb-1">Promedio quizzes</p>
          <p className="text-xl font-bold font-heading text-gray-900 dark:text-white">
            {avgScore !== null ? `${avgScore}%` : '—'}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {avgScore === null ? 'Sin quizzes aún' : avgScore >= 80 ? '¡Excelente!' : avgScore >= 60 ? 'Bien' : 'Sigue practicando'}
          </p>
        </div>

        {/* Streak */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
          <p className="text-[11px] text-gray-400 mb-1">Racha</p>
          {loadingStreak ? (
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto w-12" />
          ) : (
            <>
              <p className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                {streak > 0 ? `🔥 ${streak}` : '—'}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {streak === 0 ? 'Sin actividad' : streak === 1 ? 'día seguido' : 'días seguidos'}
              </p>
            </>
          )}
        </div>

        {/* Next class */}
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3 text-center">
          <p className="text-[11px] text-gray-400 mb-1">Próxima clase</p>
          {loadingClass ? (
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse mx-auto w-14" />
          ) : nextClass ? (
            <>
              <p className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">
                {formatNextClass(nextClass.scheduled_date)}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                {SESSION_TYPE_LABELS[nextClass.session_type] ?? nextClass.session_type}
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold font-heading text-gray-900 dark:text-white">—</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Sin programar</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function useStudentPlanId(userId: string | undefined) {
  const [planId, setPlanId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('students')
      .select('plan_id')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        setPlanId(data?.plan_id ?? null)
        setLoaded(true)
      })
  }, [userId])

  return { planId, loaded }
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
  }
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    submitted: 'Entregada',
    reviewed: 'Revisada',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function TaskItem({
  task,
  onSubmit,
  onUpdate,
}: {
  task: StudentTask
  onSubmit: (taskId: string, body: string) => Promise<void>
  onUpdate: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasNewFeedback = task.submission?.feedback && !task.submission.feedback_read_at

  async function doSubmit() {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(task.id, body) // optimistic update + API + sync; body preserved on throw
      setBody('')
      setExpanded(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al entregar tarea')
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit() {
    if (!body.trim()) return
    setShowConfirm(true)
  }

  async function handleReadFeedback() {
    if (task.submission?.id && !task.submission.feedback_read_at) {
      await markFeedbackRead(task.submission.id)
      onUpdate()
    }
  }

  return (
    <li className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => {
          setExpanded(e => !e)
          if (hasNewFeedback) handleReadFeedback()
        }}
        className="w-full text-left flex items-start justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
            {hasNewFeedback && (
              <span className="text-[10px] font-bold bg-primary text-gray-900 rounded-full px-1.5 py-0.5">
                Feedback nuevo
              </span>
            )}
          </div>
          {task.due_date && (
            <p className="text-xs text-gray-400 mt-0.5">Entrega: {formatDate(task.due_date)}</p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </button>

      {expanded && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
          )}

          {task.submission ? (
            <div className="space-y-2">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-2.5">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Tu respuesta</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {task.submission.body ?? '—'}
                </p>
              </div>

              {task.submission.feedback && (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5">
                  <p className="text-xs font-semibold text-primary mb-1">Feedback del docente</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.submission.feedback}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Escribe tu respuesta aquí…"
                rows={4}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !body.trim()}
                className="w-full bg-primary text-gray-900 text-sm font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Entregando…' : 'Entregar tarea'}
              </button>
              {submitError && <p className="text-xs text-red-500">{submitError}</p>}
              {showConfirm && (
                <ConfirmModal
                  title="¿Entregar tarea?"
                  description="No podrás editarla después."
                  confirmLabel="Entregar"
                  onConfirm={() => { setShowConfirm(false); doSubmit() }}
                  onCancel={() => setShowConfirm(false)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function TasksSection({ studentId }: { studentId: string }) {
  const { tasks, loading, error, reload, optimisticSubmit } = useStudentTasks(studentId)

  const newFeedbackCount = tasks.filter(
    t => t.submission?.feedback && !t.submission.feedback_read_at
  ).length

  const activeTasks = tasks.filter(t => t.status !== 'reviewed')
  const reviewedTasks = tasks.filter(t => t.status === 'reviewed')

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-red-500 py-4">{error}</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Mis Tareas
        </h2>
        {newFeedbackCount > 0 && (
          <span className="text-xs font-bold bg-primary text-gray-900 rounded-full px-2 py-0.5">
            {newFeedbackCount} feedback nuevo
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Tu docente no te ha asignado tareas aún.
          </p>
        </div>
      ) : (
        <>
          {activeTasks.length > 0 && (
            <ul className="space-y-2">
              {activeTasks.map(task => (
                <TaskItem key={task.id} task={task} onSubmit={optimisticSubmit} onUpdate={reload} />
              ))}
            </ul>
          )}

          {reviewedTasks.length > 0 && (
            <details className="group">
              <summary className="text-xs font-medium text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none list-none flex items-center gap-1">
                <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                {reviewedTasks.length} tarea{reviewedTasks.length !== 1 ? 's' : ''} revisada{reviewedTasks.length !== 1 ? 's' : ''}
              </summary>
              <ul className="mt-2 space-y-2">
                {reviewedTasks.map(task => (
                  <TaskItem key={task.id} task={task} onSubmit={optimisticSubmit} onUpdate={reload} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  )
}

interface QuizSectionProps {
  studentId: string
  todayQuiz: ReturnType<typeof useStudentQuiz>['todayQuiz']
  alreadyTaken: boolean
  myScore: number | null
  history: ReturnType<typeof useStudentQuiz>['history']
  loading: boolean
  reload: () => void
}

function QuizSection({ studentId, todayQuiz, alreadyTaken, myScore, history, loading, reload }: QuizSectionProps) {
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  function handleQuizDone(score: number, correct: number, total: number) {
    setResult({ score, correct, total })
    reload()
  }

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
        <SkeletonCard lines={3} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Quiz del día
        </h2>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(h => !h)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {showHistory ? 'Ocultar historial' : 'Ver historial'}
          </button>
        )}
      </div>

      {showHistory ? (
        <QuizHistory history={history} />
      ) : result ? (
        /* Score card after submission */
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-2">
          <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            {Math.round(result.score)}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {result.correct} de {result.total} correctas
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {result.score >= 80
              ? '¡Excelente trabajo!'
              : result.score >= 60
              ? '¡Bien! Sigue practicando.'
              : 'Sigue adelante, puedes mejorar.'}
          </p>
        </div>
      ) : todayQuiz && !alreadyTaken ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <QuizPlayer
            quiz={todayQuiz}
            studentId={studentId}
            onDone={handleQuizDone}
          />
        </div>
      ) : todayQuiz && alreadyTaken ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-1">
          <p className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
            {Math.round(myScore ?? 0)}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ya completaste el quiz de hoy: <span className="font-medium">{todayQuiz.title}</span>
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No hay quiz programado para hoy.
          </p>
        </div>
      )}
    </div>
  )
}

function GlosarioSection({ studentId }: { studentId: string }) {
  const { entries, loading, reload } = useStudentGlossary(studentId)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'mastered'>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  async function handleToggle(id: string, current: boolean) {
    setTogglingId(id)
    try {
      await toggleMastered(id, !current)
      await reload()
    } finally {
      setTogglingId(null)
    }
  }

  const filtered = entries.filter(e => {
    if (filter === 'mastered' && !e.mastered) return false
    if (filter === 'pending' && e.mastered) return false
    if (search) {
      const q = search.toLowerCase()
      return e.word.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (entries.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Mi Glosario
        </h2>
        <span className="text-xs text-gray-400">
          {entries.filter(e => e.mastered).length}/{entries.length} dominadas
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar palabra…"
          className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {(['all', 'pending', 'mastered'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              filter === f
                ? 'border-primary bg-primary/10 text-primary dark:text-green-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
            }`}
          >
            {f === 'all' ? 'Todas' : f === 'mastered' ? 'Dominadas' : 'Por aprender'}
          </button>
        ))}
      </div>

      {/* Word list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No hay palabras que coincidan.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map(entry => (
            <li
              key={entry.id}
              className={`rounded-xl border p-3 flex items-start gap-3 transition-colors ${
                entry.mastered
                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <button
                onClick={() => handleToggle(entry.id, entry.mastered)}
                disabled={togglingId === entry.id}
                className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  entry.mastered
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                }`}
                title={entry.mastered ? 'Marcar como pendiente' : 'Marcar como dominada'}
              >
                {entry.mastered && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${entry.mastered ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                  {entry.word}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{entry.definition}</p>
                {entry.context_sentence && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">"{entry.context_sentence}"</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Coins needed to fill each level of the battery
const BATTERY_MAX = 500

function FluidityBattery({ studentId }: { studentId: string }) {
  const { total, loading } = useStudentCoins(studentId)
  const pct = Math.min(100, (total / BATTERY_MAX) * 100)

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h2 className="text-sm font-heading font-bold text-gray-900 dark:text-white tracking-wide uppercase">
            Batería de Fluidez
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">🪙</span>
          {loading ? (
            <span className="text-lg font-bold text-gray-300 dark:text-gray-600">—</span>
          ) : (
            <motion.span
              key={total}
              initial={{ scale: 1.4, color: '#86ef86' }}
              animate={{ scale: 1, color: '#166534' }}
              transition={{ duration: 0.4 }}
              className="text-lg font-bold dark:!text-[#86ef86]"
              style={{ color: '#166534' }}
            >
              {total}
            </motion.span>
          )}
          <span className="text-xs text-gray-400 font-medium">coins</span>
        </div>
      </div>

      {/* Battery bar */}
      <div className="relative h-5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Tick marks */}
        {[25, 50, 75].map(tick => (
          <div
            key={tick}
            className="absolute top-0 bottom-0 w-px bg-white/60 dark:bg-gray-700/80 z-10"
            style={{ left: `${tick}%` }}
          />
        ))}
        <motion.div
          className="absolute left-0 top-0 bottom-0 rounded-full"
          style={{ background: 'linear-gradient(90deg, #4ade80, #86ef86)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Shine */}
          <div className="absolute inset-0 rounded-full opacity-40"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 60%)' }}
          />
        </motion.div>
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>0</span>
        <span className="font-medium text-gray-500 dark:text-gray-400">
          {loading ? '…' : `${Math.round(pct)}%`} llena
        </span>
        <span>{BATTERY_MAX} 🏆</span>
      </div>

      {/* Reward legend */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {[
          { icon: '🏫', label: 'Clase tomada', pts: '+10' },
          { icon: '📝', label: 'Tarea entregada', pts: '+5' },
          { icon: '🎯', label: 'Quiz ≥ 80%', pts: '+15' },
          { icon: '📖', label: '10+ palabras dom.', pts: '+20' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span>{item.icon}</span>
            <span className="truncate">{item.label}</span>
            <span className="ml-auto font-semibold text-[#166534] dark:text-[#86ef86]">{item.pts}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillsRadar({ studentId }: { studentId: string }) {
  const { scores, loading } = useSkillScores(studentId)

  const data = SKILLS.map(skill => ({
    skill,
    score: scores[skill],
    fullMark: 100,
  }))

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎮</span>
        <h2 className="text-sm font-heading font-bold text-gray-900 dark:text-white tracking-wide uppercase">
          Skills Radar
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
            <PolarGrid
              stroke="#374151"
              strokeOpacity={0.6}
            />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#9ca3af', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}
            />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#86ef86"
              fill="#86ef86"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={{ fill: '#86ef86', r: 3 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}

      {/* Score pills */}
      <div className="grid grid-cols-3 gap-1.5">
        {SKILLS.map(skill => (
          <div
            key={skill}
            className="rounded-lg bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-center"
          >
            <p className="text-[10px] text-gray-400 leading-tight">{skill}</p>
            <p
              className="text-sm font-bold mt-0.5"
              style={{ color: scores[skill] >= 70 ? '#86ef86' : scores[skill] >= 40 ? '#fbbf24' : '#f87171' }}
            >
              {scores[skill]}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function BadgesSection({ studentId }: { studentId: string }) {
  const { badges, loading, markAllSeen } = useStudentBadges(studentId)
  const earnedMap = new Map(badges.map(b => [b.badge_type, b]))
  const newBadges = badges.filter(b => !b.seen)

  useEffect(() => {
    if (newBadges.length === 0) return
    const t = setTimeout(() => markAllSeen(), 3500)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badges.length])

  if (loading) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
          Mis Logros
        </h2>
        <AnimatePresence>
          {newBadges.length > 0 && (
            <motion.span
              key="new-badge-count"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="text-xs font-bold bg-primary text-gray-900 rounded-full px-2 py-0.5"
            >
              {newBadges.length} nuevo{newBadges.length !== 1 ? 's' : ''}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ALL_BADGE_TYPES.map(type => {
          const meta = BADGE_META[type]
          const earned = earnedMap.get(type)
          const isNew = earned != null && !earned.seen

          return (
            <motion.div
              key={type}
              initial={isNew ? { scale: 0.7, opacity: 0 } : false}
              animate={isNew ? { scale: 1, opacity: 1 } : {}}
              transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            >
              {earned ? (
                <div
                  className={`relative rounded-2xl p-4 text-center bg-gradient-to-br ${meta.gradient} shadow-lg ${meta.glow} overflow-hidden`}
                >
                  {/* Flash overlay for new badge */}
                  {isNew && (
                    <motion.div
                      className="absolute inset-0 bg-white/40 rounded-2xl pointer-events-none"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 1.8 }}
                    />
                  )}
                  <div className="text-4xl mb-2 drop-shadow">{meta.icon}</div>
                  <p className="text-sm font-bold text-white leading-tight">{meta.name}</p>
                  <p className="text-[11px] text-white/75 mt-1">
                    {formatDate(earned.earned_at)}
                  </p>
                  {isNew && (
                    <motion.div
                      className="absolute top-2 right-2"
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.25, 1] }}
                      transition={{ delay: 0.4, duration: 0.5, repeat: 2 }}
                    >
                      <span className="text-[10px] font-bold bg-white text-gray-900 rounded-full px-1.5 py-0.5 shadow">
                        ¡Nuevo!
                      </span>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl p-4 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-4xl mb-2 grayscale opacity-40">{meta.icon}</div>
                  <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 leading-tight">
                    {meta.name}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 leading-snug">
                    {meta.description}
                  </p>
                  <div className="mt-2 flex items-center justify-center gap-1 text-gray-400">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-[10px]">Bloqueado</span>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { appUser } = useAuth()
  const { planId, loaded } = useStudentPlanId(appUser?.id)
  const { plan, loading, totalTopics, completedTopics, progressPct } = useStudyPlan(planId, appUser?.id ?? '')
  const { todayQuiz, alreadyTaken, myScore, avgScore, history: quizHistory, loading: quizLoading, reload: reloadQuiz } = useStudentQuiz(appUser?.id)

  return (
    <AppLayout title="Mi Portal">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Hola, {appUser?.name?.split(' ')[0] ?? 'estudiante'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aquí está tu portal de aprendizaje.
          </p>
        </div>

        {/* Progress overview */}
        {appUser?.id && (
          <ProgressOverview
            studentId={appUser.id}
            totalTopics={totalTopics}
            completedTopics={completedTopics}
            progressPct={progressPct}
            avgScore={avgScore}
          />
        )}

        {/* Gamification: Fluidity Battery + Skills Radar */}
        {appUser?.id && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FluidityBattery studentId={appUser.id} />
            <SkillsRadar studentId={appUser.id} />
          </div>
        )}

        {/* Badges / Logros */}
        {appUser?.id && (
          <BadgesSection studentId={appUser.id} />
        )}

        {/* Quiz del día */}
        {appUser?.id && (
          <QuizSection
            studentId={appUser.id}
            todayQuiz={todayQuiz}
            alreadyTaken={alreadyTaken}
            myScore={myScore}
            history={quizHistory}
            loading={quizLoading}
            reload={reloadQuiz}
          />
        )}

        {/* Tasks */}
        {appUser?.id && (
          <TasksSection studentId={appUser.id} />
        )}

        {/* Glossary */}
        {appUser?.id && (
          <GlosarioSection studentId={appUser.id} />
        )}

        {/* Plan */}
        {!loaded || loading ? (
          <StudyPlanSkeleton />
        ) : plan ? (
          <div className="space-y-3">
            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
              Mi Plan de Estudios
            </h2>
            <StudyPlanView plan={plan} />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Tu docente aún no te ha asignado un plan de estudios.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
