import { useState } from 'react'
import { type StudentSummary } from '../../hooks/useTeacherStudents'
import { useStudentProfile } from '../../hooks/useStudentProfile'
import { useAllPlans, assignPlanToStudent } from '../../hooks/useAssignPlan'
import { useStudyPlan } from '../../hooks/useStudyPlan'
import { useTeacherTasksForStudent, createTask, saveFeedback } from '../../hooks/useTeacherTasks'
import { useStudentClassSessions, updateSessionStatus, createSession, type SessionStatus } from '../../hooks/useClassSessions'
import { useAuth } from '../auth/AuthContext'
import CycleStatus from '../classes/CycleStatus'
import { useTeacherResources, createResource, deleteResource, type ResourceType } from '../../hooks/useResources'
import ChatWindow from '../messages/ChatWindow'

interface StudentProfileProps {
  student: StudentSummary
  onClose: () => void
}

type TabId = 'plan' | 'recursos' | 'tareas' | 'quizzes' | 'clases' | 'mensajes'

const TABS: { id: TabId; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'recursos', label: 'Recursos' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'quizzes', label: 'Quizzes' },
  { id: 'clases', label: 'Clases' },
  { id: 'mensajes', label: 'Mensajes' },
]

function TabLabel({ label, badge }: { label: string; badge?: number }) {
  return (
    <span className="flex items-center gap-1.5">
      {label}
      {badge ? (
        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-red-500 text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </span>
  )
}

function formatDate(iso: string, includeTime = false): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(iso))
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
    submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
    taken: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
    no_show: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400',
    cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    rescheduled: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400',
    holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400',
  }
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    submitted: 'Entregada',
    reviewed: 'Revisada',
    scheduled: 'Programada',
    taken: 'Tomada',
    no_show: 'No show',
    cancelled: 'Cancelada',
    rescheduled: 'Reagendada',
    holiday: 'Festivo',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return <img src={url} alt={name} className="w-16 h-16 rounded-full object-cover" />
  }
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
      <span className="text-xl font-semibold text-primary">{initials}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">{message}</p>
  )
}

export default function StudentProfile({ student, onClose }: StudentProfileProps) {
  const { appUser } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('plan')
  const [planId, setPlanId] = useState<string | null>(student.plan?.id ?? null)
  const { data, loading } = useStudentProfile(student.id, planId)
  const { tasks: teacherTasks } = useTeacherTasksForStudent(student.id)

  const submittedCount = teacherTasks.filter(t => t.status === 'submitted').length

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
          <Avatar name={student.name} url={student.avatar_url} />
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white truncate">
              {student.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{student.email}</p>
            {student.plan && (
              <span className="inline-block mt-1 text-xs font-medium bg-primary/20 text-green-800 dark:text-green-300 rounded-full px-2 py-0.5">
                {student.plan.name}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab.id === 'tareas'
                ? <TabLabel label="Tareas" badge={submittedCount} />
                : tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === 'plan' && (
                <PlanTab
                  studentId={student.id}
                  planId={planId}
                  units={data.planUnits}
                  onPlanChange={setPlanId}
                />
              )}
              {activeTab === 'recursos' && (
                <RecursosTab studentId={student.id} />
              )}
              {activeTab === 'tareas' && (
                <TareasTab
                  studentId={student.id}
                  teacherId={appUser?.id ?? ''}
                />
              )}
              {activeTab === 'quizzes' && (
                <QuizzesTab results={data.quizResults} />
              )}
              {activeTab === 'clases' && (
                <ClasesTab studentId={student.id} teacherId={appUser?.id ?? ''} />
              )}
              {activeTab === 'mensajes' && (
                <MensajesTab
                  partnerId={student.id}
                  partnerName={student.name}
                  partnerAvatar={student.avatar_url}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PlanTab({
  studentId,
  planId,
  units,
  onPlanChange,
}: {
  studentId: string
  planId: string | null
  units: { id: string; title: string; order: number }[]
  onPlanChange: (id: string | null) => void
}) {
  const { plans, loading: plansLoading } = useAllPlans()
  const { plan: fullPlan } = useStudyPlan(planId, studentId)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [showSelector, setShowSelector] = useState(false)

  async function handleAssign(newPlanId: string | null) {
    setAssigning(true)
    setAssignError(null)
    try {
      await assignPlanToStudent(studentId, newPlanId)
      onPlanChange(newPlanId)
      setShowSelector(false)
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Error al asignar plan')
    } finally {
      setAssigning(false)
    }
  }

  const currentPlan = plans.find(p => p.id === planId)

  return (
    <div className="space-y-4">
      {/* Plan selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          {planId ? (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Plan asignado</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentPlan?.name ?? '…'}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin plan asignado</p>
          )}
        </div>
        <button
          onClick={() => setShowSelector(s => !s)}
          className="flex-shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-primary/30 rounded-lg px-3 py-1.5"
        >
          {planId ? 'Cambiar plan' : 'Asignar plan'}
        </button>
      </div>

      {/* Plan dropdown */}
      {showSelector && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {plansLoading ? (
            <p className="text-xs text-gray-400 p-3">Cargando planes…</p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {planId && (
                <li>
                  <button
                    onClick={() => handleAssign(null)}
                    disabled={assigning}
                    className="w-full text-left px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    Quitar plan
                  </button>
                </li>
              )}
              {plans.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => handleAssign(p.id)}
                    disabled={assigning || p.id === planId}
                    className={`w-full text-left px-3 py-2.5 transition-colors ${
                      p.id === planId
                        ? 'bg-primary/5 text-primary text-xs font-semibold'
                        : 'text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    } disabled:cursor-default`}
                  >
                    <span className="font-medium">{p.name}</span>
                    {p.description && (
                      <span className="block text-gray-400 truncate mt-0.5">{p.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {assignError && (
        <p className="text-xs text-red-500">{assignError}</p>
      )}

      {/* Units + topics */}
      {!planId ? (
        <EmptyState message="Asigna un plan para ver su contenido." />
      ) : units.length === 0 ? (
        <EmptyState message="El plan no tiene unidades aún." />
      ) : (
        <ol className="space-y-3">
          {units.map((unit, i) => {
            const fullUnit = fullPlan?.units.find(u => u.id === unit.id)
            const topics = fullUnit?.topics ?? []
            const completedCount = topics.filter(t => t.progress?.completed).length

            return (
              <li key={unit.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">
                    {unit.title}
                  </span>
                  {topics.length > 0 && (
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {completedCount}/{topics.length}
                    </span>
                  )}
                </div>
                {topics.length > 0 && (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topics.map(t => (
                      <li key={t.id} className="flex items-center gap-2 px-3 py-2">
                        <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          t.progress?.completed
                            ? 'bg-primary'
                            : 'border border-gray-300 dark:border-gray-600'
                        }`} />
                        <span className={`text-xs flex-1 truncate ${
                          t.progress?.completed
                            ? 'text-gray-400 line-through'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {t.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string; emoji: string }[] = [
  { value: 'link', label: 'Enlace', emoji: '🔗' },
  { value: 'pdf', label: 'PDF', emoji: '📄' },
  { value: 'video', label: 'Video', emoji: '🎬' },
  { value: 'audio', label: 'Audio', emoji: '🎵' },
  { value: 'other', label: 'Otro', emoji: '📎' },
]

function RecursosTab({ studentId }: { studentId: string }) {
  const { appUser } = useAuth()
  const { resources, loading, reload } = useTeacherResources()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', description: '', type: 'link' as ResourceType })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filter to this student's resources or global ones
  const studentResources = resources.filter(
    (r) => r.student_id === studentId || r.student_id === null
  )

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!appUser) return
    if (!form.title.trim() || !form.url.trim()) {
      setFormError('Título y URL son obligatorios.')
      return
    }
    try {
      setSaving(true)
      setFormError(null)
      await createResource(appUser.id, { ...form, student_id: studentId })
      setShowForm(false)
      setForm({ title: '', url: '', description: '', type: 'link' })
      reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return
    setDeletingId(id)
    try {
      await deleteResource(id)
      reload()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {studentResources.length} recurso{studentResources.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary-dark dark:text-primary hover:bg-primary/20 transition-colors font-medium"
        >
          {showForm ? 'Cancelar' : '+ Agregar'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-y-3">
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título *"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="URL *"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <div className="flex gap-2">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {RESOURCE_TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
            >
              {saving ? '...' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : studentResources.length === 0 ? (
        <EmptyState message="No hay recursos asignados a este estudiante." />
      ) : (
        <ul className="space-y-2">
          {studentResources.map((r) => {
            const typeOpt = RESOURCE_TYPE_OPTIONS.find((t) => t.value === r.type)
            return (
              <li key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 group">
                <span className="text-lg flex-shrink-0">{typeOpt?.emoji ?? '📎'}</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline truncate block"
                  >
                    {r.title}
                  </a>
                  {r.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{r.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                    {r.student_id === null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">Global</span>
                    )}
                  </div>
                </div>
                {r.student_id === studentId && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-all flex-shrink-0"
                    title="Eliminar"
                  >
                    {deletingId === r.id ? '...' : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function TareasTab({ studentId, teacherId }: { studentId: string; teacherId: string }) {
  const { tasks, loading, reload } = useTeacherTasksForStudent(studentId)
  const [showForm, setShowForm] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formDue, setFormDue] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [savingFeedback, setSavingFeedback] = useState(false)
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  async function handleCreate() {
    if (!formTitle.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await createTask({
        teacherId,
        studentId,
        title: formTitle,
        description: formDesc,
        dueDate: formDue || null,
      })
      setFormTitle('')
      setFormDesc('')
      setFormDue('')
      setShowForm(false)
      await reload()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear tarea')
    } finally {
      setCreating(false)
    }
  }

  function openFeedback(taskId: string, existing: string | null) {
    setFeedbackTaskId(taskId)
    setFeedbackText(existing ?? '')
    setFeedbackError(null)
  }

  async function handleSaveFeedback(submissionId: string) {
    if (!feedbackTaskId) return
    setSavingFeedback(true)
    setFeedbackError(null)
    try {
      await saveFeedback({ submissionId, taskId: feedbackTaskId, feedback: feedbackText })
      setFeedbackTaskId(null)
      setFeedbackText('')
      await reload()
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Error al guardar feedback')
    } finally {
      setSavingFeedback(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nueva tarea'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
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
          <div className="flex items-center gap-3">
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
              disabled={creating || !formTitle.trim()}
              className="self-end flex-shrink-0 bg-primary text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creando…' : 'Crear'}
            </button>
          </div>
          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>
      )}

      {/* Tasks list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState message="No hay tareas asignadas. Crea la primera." />
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <li key={task.id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Task header */}
              <div className="flex items-start justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-gray-400 mt-1">Entrega: {formatDate(task.due_date)}</p>
                  )}
                </div>
                <StatusBadge status={task.status} />
              </div>

              {/* Submission */}
              {task.submission && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Respuesta del estudiante
                  </p>
                  {task.submission.body ? (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {task.submission.body}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Sin texto.</p>
                  )}
                  <p className="text-xs text-gray-400">
                    Entregado: {formatDate(task.submission.submitted_at, true)}
                  </p>

                  {/* Feedback */}
                  {feedbackTaskId === task.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Escribe tu feedback…"
                        rows={3}
                        className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveFeedback(task.submission!.id)}
                          disabled={savingFeedback}
                          className="text-xs font-semibold bg-primary text-gray-900 px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {savingFeedback ? 'Guardando…' : 'Guardar feedback'}
                        </button>
                        <button
                          onClick={() => setFeedbackTaskId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5"
                        >
                          Cancelar
                        </button>
                      </div>
                      {feedbackError && <p className="text-xs text-red-500">{feedbackError}</p>}
                    </div>
                  ) : task.submission.feedback ? (
                    <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5">
                      <p className="text-xs font-semibold text-primary mb-1">Tu feedback</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {task.submission.feedback}
                      </p>
                      <button
                        onClick={() => openFeedback(task.id, task.submission!.feedback)}
                        className="mt-1.5 text-xs text-primary hover:underline"
                      >
                        Editar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openFeedback(task.id, null)}
                      className="text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
                    >
                      Dar feedback
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function QuizzesTab({ results }: { results: { id: string; score: number | null; taken_at: string; quiz: { id: string; title: string; date: string | null } | null }[] }) {
  if (results.length === 0) {
    return <EmptyState message="No hay quizzes realizados." />
  }
  return (
    <ul className="space-y-3">
      {results.map(r => (
        <li key={r.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {r.quiz?.title ?? 'Quiz'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.taken_at, true)}</p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className={`text-lg font-bold ${r.score !== null && r.score >= 60 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {r.score !== null ? `${r.score}%` : '—'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

const SESSION_STATUS_OPTIONS: { value: SessionStatus; label: string }[] = [
  { value: 'scheduled',   label: 'Programada' },
  { value: 'taken',       label: 'Tomada' },
  { value: 'no_show',     label: 'No show' },
  { value: 'cancelled',   label: 'Cancelada' },
  { value: 'rescheduled', label: 'Reagendada' },
  { value: 'holiday',     label: 'Festivo' },
]

function ClasesTab({ studentId, teacherId }: { studentId: string; teacherId: string }) {
  const { sessions, loading, reload } = useStudentClassSessions(studentId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<SessionStatus>('scheduled')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // New session form
  const [showNew, setShowNew] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('09:00')
  const [newNotes, setNewNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  function startEdit(s: { id: string; status: string; notes: string | null }) {
    setEditingId(s.id)
    setEditStatus(s.status as SessionStatus)
    setEditNotes(s.notes ?? '')
    setSaveError(null)
  }

  async function handleSave(sessionId: string) {
    setSaving(true)
    setSaveError(null)
    try {
      await updateSessionStatus(sessionId, editStatus, editNotes || undefined)
      setEditingId(null)
      await reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    if (!newDate) return
    setCreating(true)
    setCreateError(null)
    try {
      await createSession({
        teacherId,
        studentId,
        scheduledDate: `${newDate}T${newTime}:00`,
        notes: newNotes || undefined,
      })
      setNewDate('')
      setNewTime('09:00')
      setNewNotes('')
      setShowNew(false)
      await reload()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear sesión')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Cycle progress */}
      <CycleStatus studentId={studentId} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}
        </p>
        <button
          onClick={() => setShowNew(s => !s)}
          className="text-xs font-medium text-primary border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
        >
          {showNew ? 'Cancelar' : '+ Nueva sesión'}
        </button>
      </div>

      {/* New session form */}
      {showNew && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Fecha</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-gray-400 block mb-1">Hora</label>
              <input
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Notas (opcional)"
            value={newNotes}
            onChange={e => setNewNotes(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {createError && <p className="text-xs text-red-500">{createError}</p>}
          <button
            onClick={handleCreate}
            disabled={creating || !newDate}
            className="w-full text-sm font-semibold bg-primary text-gray-900 rounded-lg py-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creando…' : 'Crear sesión'}
          </button>
        </div>
      )}

      {/* Sessions list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState message="No hay clases registradas. Crea la primera." />
      ) : (
        <ul className="space-y-3">
          {sessions.map(s => (
            <li key={s.id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(s.scheduled_date, true)}
                </p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  <button
                    onClick={() => editingId === s.id ? setEditingId(null) : startEdit(s)}
                    className="text-xs text-gray-400 hover:text-primary transition-colors"
                    aria-label="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414L9 13z" />
                    </svg>
                  </button>
                </div>
              </div>

              {s.notes && editingId !== s.id && (
                <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/50">
                  {s.notes}
                </p>
              )}

              {editingId === s.id && (
                <div className="p-3 border-t border-gray-100 dark:border-gray-700/50 space-y-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Estado</label>
                    <div className="flex flex-wrap gap-1.5">
                      {SESSION_STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setEditStatus(opt.value)}
                          className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                            editStatus === opt.value
                              ? 'border-primary bg-primary/10 text-primary dark:text-green-400'
                              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="Notas de la clase…"
                    rows={2}
                    className="w-full text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                  {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(s.id)}
                      disabled={saving}
                      className="text-xs font-semibold bg-primary text-gray-900 px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MensajesTab({
  partnerId,
  partnerName,
  partnerAvatar,
}: {
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
}) {
  return (
    <div className="h-[500px] -mx-6 -mb-6">
      <ChatWindow
        partnerId={partnerId}
        partnerName={partnerName}
        partnerAvatar={partnerAvatar}
      />
    </div>
  )
}
