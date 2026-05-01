import { useEffect, useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useStudyPlan } from '../../hooks/useStudyPlan'
import StudyPlanView from '../study-plans/StudyPlanView'
import { supabase } from '../../lib/supabase'
import { useStudentTasks, submitTask, markFeedbackRead, type StudentTask } from '../../hooks/useStudentTasks'
import { useStudentQuiz } from '../../hooks/useStudentQuiz'
import QuizPlayer from '../quizzes/QuizPlayer'
import QuizHistory from '../quizzes/QuizHistory'

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

function TaskItem({ task, studentId, onUpdate }: { task: StudentTask; studentId: string; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const hasNewFeedback = task.submission?.feedback && !task.submission.feedback_read_at

  async function handleSubmit() {
    if (!body.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await submitTask({ taskId: task.id, studentId, body })
      setBody('')
      setExpanded(false)
      onUpdate()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error al entregar tarea')
    } finally {
      setSubmitting(false)
    }
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
            </div>
          )}
        </div>
      )}
    </li>
  )
}

function TasksSection({ studentId }: { studentId: string }) {
  const { tasks, loading, error, reload } = useStudentTasks(studentId)

  const newFeedbackCount = tasks.filter(
    t => t.submission?.feedback && !t.submission.feedback_read_at
  ).length

  const activeTasks = tasks.filter(t => t.status !== 'reviewed')
  const reviewedTasks = tasks.filter(t => t.status === 'reviewed')

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                <TaskItem key={task.id} task={task} studentId={studentId} onUpdate={reload} />
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
                  <TaskItem key={task.id} task={task} studentId={studentId} onUpdate={reload} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  )
}

function QuizSection({ studentId }: { studentId: string }) {
  const { todayQuiz, alreadyTaken, myScore, history, loading, reload } = useStudentQuiz(studentId)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  function handleQuizDone(score: number, correct: number, total: number) {
    setResult({ score, correct, total })
    reload()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

export default function StudentDashboard() {
  const { appUser } = useAuth()
  const { planId, loaded } = useStudentPlanId(appUser?.id)
  const { plan, loading } = useStudyPlan(planId, appUser?.id ?? '')

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

        {/* Quiz del día */}
        {appUser?.id && (
          <QuizSection studentId={appUser.id} />
        )}

        {/* Tasks */}
        {appUser?.id && (
          <TasksSection studentId={appUser.id} />
        )}

        {/* Plan */}
        {!loaded || loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
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
