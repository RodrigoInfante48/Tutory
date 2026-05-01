import { useState } from 'react'
import { type StudentSummary } from '../../hooks/useTeacherStudents'
import { useStudentProfile } from '../../hooks/useStudentProfile'
import { useAllPlans, assignPlanToStudent } from '../../hooks/useAssignPlan'
import { useStudyPlan } from '../../hooks/useStudyPlan'

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
  const [activeTab, setActiveTab] = useState<TabId>('plan')
  const [planId, setPlanId] = useState<string | null>(student.plan?.id ?? null)
  const { data, loading } = useStudentProfile(student.id, planId)

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
              {tab.label}
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
                <RecursosTab resources={data.resources} />
              )}
              {activeTab === 'tareas' && (
                <TareasTab tasks={data.tasks} />
              )}
              {activeTab === 'quizzes' && (
                <QuizzesTab results={data.quizResults} />
              )}
              {activeTab === 'clases' && (
                <ClasesTab sessions={data.classSessions} />
              )}
              {activeTab === 'mensajes' && (
                <MensajesTab />
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

function RecursosTab({ resources }: { resources: { id: string; title: string; url: string; type: string; created_at: string }[] }) {
  if (resources.length === 0) {
    return <EmptyState message="No hay recursos asignados." />
  }
  const iconByType: Record<string, string> = {
    link: '🔗',
    pdf: '📄',
    video: '🎬',
    audio: '🎵',
    other: '📎',
  }
  return (
    <ul className="space-y-2">
      {resources.map(r => (
        <li key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <span className="text-lg flex-shrink-0">{iconByType[r.type] ?? '📎'}</span>
          <div className="flex-1 min-w-0">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline truncate block"
            >
              {r.title}
            </a>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function TareasTab({ tasks }: { tasks: { id: string; title: string; description: string | null; due_date: string | null; status: string; created_at: string }[] }) {
  if (tasks.length === 0) {
    return <EmptyState message="No hay tareas asignadas." />
  }
  return (
    <ul className="space-y-3">
      {tasks.map(t => (
        <li key={t.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{t.title}</p>
            <StatusBadge status={t.status} />
          </div>
          {t.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{t.description}</p>
          )}
          {t.due_date && (
            <p className="text-xs text-gray-400 mt-1">Entrega: {formatDate(t.due_date)}</p>
          )}
        </li>
      ))}
    </ul>
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

function ClasesTab({ sessions }: { sessions: { id: string; scheduled_date: string; status: string; notes: string | null }[] }) {
  if (sessions.length === 0) {
    return <EmptyState message="No hay clases registradas." />
  }
  return (
    <ul className="space-y-3">
      {sessions.map(s => (
        <li key={s.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(s.scheduled_date, true)}
            </p>
            <StatusBadge status={s.status} />
          </div>
          {s.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{s.notes}</p>
          )}
        </li>
      ))}
    </ul>
  )
}

function MensajesTab() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        El chat en tiempo real estará disponible próximamente.
      </p>
    </div>
  )
}
