import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTeacherStudents } from '../../hooks/useTeacherStudents'
import { createTask, saveFeedback } from '../../hooks/useTeacherTasks'

// ─── Types ──────────────────────────────────────────────────────────────────

interface RawTask {
  id: string
  title: string
  description: string | null
  due_date: string | null
  status: 'pending' | 'submitted' | 'reviewed'
  created_at: string
  student_id: string
  task_submissions: {
    id: string
    body: string | null
    feedback: string | null
    submitted_at: string
    feedback_read_at: string | null
  }[]
}

interface TaskWithStudent extends Omit<RawTask, 'task_submissions'> {
  student_name: string
  student_avatar: string | null
  submission: RawTask['task_submissions'][0] | null
}

type FilterStatus = 'submitted' | 'all' | 'pending' | 'reviewed'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string, includeTime = false): string {
  const d = new Date(iso)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
  if (includeTime) {
    opts.hour = '2-digit'
    opts.minute = '2-digit'
  }
  return d.toLocaleDateString('es-CO', opts)
}

function StatusBadge({ status }: { status: TaskWithStudent['status'] }) {
  const map: Record<typeof status, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    submitted: { label: 'Entregada', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    reviewed: { label: 'Revisada', className: 'bg-primary/20 text-green-800 dark:text-primary' },
  }
  const { label, className } = map[status]
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${className}`}>
      {label}
    </span>
  )
}

function Avatar({ name, src }: { name: string; src: string | null }) {
  if (src) {
    return <img src={src} alt={name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TeacherTasksPage() {
  const { appUser } = useAuth()
  const { students, loading: studentsLoading } = useTeacherStudents()

  const [rawTasks, setRawTasks] = useState<RawTask[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)

  const [filter, setFilter] = useState<FilterStatus>('submitted')

  // Create form
  const [showForm, setShowForm] = useState(false)
  const [formStudentId, setFormStudentId] = useState('')
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDue, setFormDue] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Feedback
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  // Ref for optimistic rollback
  const rawTasksRef = useRef<RawTask[]>([])
  useEffect(() => { rawTasksRef.current = rawTasks }, [rawTasks])

  const load = useCallback(async () => {
    if (!appUser?.id) return
    try {
      setTasksLoading(true)
      setTasksError(null)
      const { data, error: err } = await supabase
        .from('tasks')
        .select(`
          id, title, description, due_date, status, created_at, student_id,
          task_submissions(id, body, feedback, submitted_at, feedback_read_at)
        `)
        .eq('teacher_id', appUser.id)
        .order('created_at', { ascending: false })
      if (err) throw err
      setRawTasks((data ?? []) as RawTask[])
    } catch (err) {
      setTasksError(err instanceof Error ? err.message : 'Error al cargar tareas')
    } finally {
      setTasksLoading(false)
    }
  }, [appUser?.id])

  useEffect(() => { load() }, [load])

  // Merge tasks with student info from the students hook
  const tasks: TaskWithStudent[] = useMemo(() => rawTasks.map(t => {
    const student = students.find(s => s.id === t.student_id)
    return {
      ...t,
      student_name: student?.name ?? '—',
      student_avatar: student?.avatar_url ?? null,
      submission: t.task_submissions?.[0] ?? null,
    }
  }), [rawTasks, students])

  const filtered = useMemo(() => {
    if (filter === 'all') return tasks
    return tasks.filter(t => t.status === filter)
  }, [tasks, filter])

  const submittedCount = useMemo(() => tasks.filter(t => t.status === 'submitted').length, [tasks])
  const pendingCount = useMemo(() => tasks.filter(t => t.status === 'pending').length, [tasks])
  const reviewedCount = useMemo(() => tasks.filter(t => t.status === 'reviewed').length, [tasks])

  // ── Create task ────────────────────────────────────────────────────────────

  async function handleCreate() {
    if (!formTitle.trim() || !formStudentId) return
    setCreating(true)
    setCreateError(null)
    try {
      await createTask({
        teacherId: appUser!.id,
        studentId: formStudentId,
        title: formTitle,
        description: formDesc,
        dueDate: formDue || null,
      })
      setFormTitle('')
      setFormDesc('')
      setFormDue('')
      setFormStudentId('')
      setShowForm(false)
      await load()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear tarea')
      // form state preserved on error
    } finally {
      setCreating(false)
    }
  }

  // ── Save feedback (optimistic) ─────────────────────────────────────────────

  function openFeedback(taskId: string, existing: string | null) {
    setFeedbackTaskId(taskId)
    setFeedbackText(existing ?? '')
    setFeedbackError(null)
  }

  async function handleSaveFeedback(submissionId: string, taskId: string) {
    setSavingFeedback(true)
    setFeedbackError(null)
    const previous = rawTasksRef.current
    // Optimistic: mark as reviewed + update feedback immediately
    setRawTasks(prev => prev.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: 'reviewed' as const,
            task_submissions: t.task_submissions.map(s =>
              s.id === submissionId ? { ...s, feedback: feedbackText } : s
            ),
          }
        : t
    ))
    try {
      await saveFeedback({ submissionId, taskId, feedback: feedbackText })
      setFeedbackTaskId(null)
      setFeedbackText('')
    } catch (err) {
      setRawTasks(previous) // rollback on failure
      setFeedbackError(err instanceof Error ? err.message : 'Error al guardar feedback')
    } finally {
      setSavingFeedback(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const loading = studentsLoading || tasksLoading

  return (
    <AppLayout title="Tareas">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-heading font-bold text-gray-900 dark:text-white">Tareas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="flex-shrink-0 bg-primary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            {showForm ? 'Cancelar' : '+ Nueva tarea'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3 bg-white dark:bg-gray-900">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nueva tarea</p>

            <select
              value={formStudentId}
              onChange={e => setFormStudentId(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Seleccionar estudiante *</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Título de la tarea *"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />

            <textarea
              placeholder="Descripción (opcional)"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              rows={3}
              className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />

            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">Fecha límite</label>
                <input
                  type="date"
                  value={formDue}
                  onChange={e => setFormDue(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleCreate}
                disabled={creating || !formTitle.trim() || !formStudentId}
                className="flex-shrink-0 bg-primary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creando…' : 'Crear'}
              </button>
            </div>
            {createError && <p className="text-xs text-red-500">{createError}</p>}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: 'submitted', label: 'Por revisar', count: submittedCount },
            { key: 'all',       label: 'Todas',       count: tasks.length },
            { key: 'pending',   label: 'Pendientes',  count: pendingCount },
            { key: 'reviewed',  label: 'Revisadas',   count: reviewedCount },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === tab.key
                  ? 'bg-primary text-gray-900 border-transparent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                  filter === tab.key
                    ? 'bg-gray-900/20 text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasksError ? (
          <p className="text-sm text-red-500 py-4">{tasksError}</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {filter === 'submitted' ? 'No hay entregas pendientes de revisión.' : 'No hay tareas en esta categoría.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                feedbackTaskId={feedbackTaskId}
                feedbackText={feedbackText}
                savingFeedback={savingFeedback}
                feedbackError={feedbackError}
                onFeedbackTextChange={setFeedbackText}
                onOpenFeedback={openFeedback}
                onCloseFeedback={() => setFeedbackTaskId(null)}
                onSaveFeedback={handleSaveFeedback}
              />
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  )
}

// ─── TaskCard ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: TaskWithStudent
  feedbackTaskId: string | null
  feedbackText: string
  savingFeedback: boolean
  feedbackError: string | null
  onFeedbackTextChange: (v: string) => void
  onOpenFeedback: (taskId: string, existing: string | null) => void
  onCloseFeedback: () => void
  onSaveFeedback: (submissionId: string, taskId: string) => void
}

function TaskCard({
  task,
  feedbackTaskId,
  feedbackText,
  savingFeedback,
  feedbackError,
  onFeedbackTextChange,
  onOpenFeedback,
  onCloseFeedback,
  onSaveFeedback,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(task.status === 'submitted')

  const isFeedbackOpen = feedbackTaskId === task.id

  return (
    <li className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      {/* Card header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
      >
        <Avatar name={task.student_name} src={task.student_avatar} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary">{task.student_name}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
            {task.title}
          </p>
          {task.due_date && (
            <p className="text-xs text-gray-400 mt-0.5">Entrega: {formatDate(task.due_date)}</p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
          )}

          {task.submission ? (
            <div className="space-y-2">
              {/* Submission */}
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 p-3">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">
                  Respuesta del estudiante
                </p>
                {task.submission.body ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.submission.body}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">Sin texto.</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Entregado: {formatDate(task.submission.submitted_at, true)}
                </p>
              </div>

              {/* Feedback */}
              {isFeedbackOpen ? (
                <div className="space-y-2">
                  <textarea
                    value={feedbackText}
                    onChange={e => onFeedbackTextChange(e.target.value)}
                    placeholder="Escribe tu feedback…"
                    rows={3}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSaveFeedback(task.submission!.id, task.id)}
                      disabled={savingFeedback}
                      className="text-xs font-semibold bg-primary text-gray-900 px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {savingFeedback ? 'Guardando…' : 'Guardar feedback'}
                    </button>
                    <button
                      onClick={onCloseFeedback}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5"
                    >
                      Cancelar
                    </button>
                  </div>
                  {feedbackError && <p className="text-xs text-red-500">{feedbackError}</p>}
                </div>
              ) : task.submission.feedback ? (
                <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                  <p className="text-xs font-semibold text-primary mb-1">Tu feedback</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.submission.feedback}
                  </p>
                  <button
                    onClick={() => onOpenFeedback(task.id, task.submission!.feedback)}
                    className="mt-1.5 text-xs text-primary hover:underline"
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onOpenFeedback(task.id, null)}
                  className="w-full text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors"
                >
                  + Dar feedback
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-2">
              El estudiante aún no ha entregado esta tarea.
            </p>
          )}

          <p className="text-xs text-gray-400">Creada: {formatDate(task.created_at)}</p>
        </div>
      )}
    </li>
  )
}
