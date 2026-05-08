import { useState } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useStudentClassSessions, type SessionType } from '../../hooks/useClassSessions'
import { useStudentResources, type ResourceType } from '../../hooks/useResources'
import { useStudentGlossary, toggleMastered } from '../../hooks/useStudentGlossary'

// ─── Shared helpers ──────────────────────────────────────────────────────────

function formatDate(iso: string, long = false): string {
  return new Intl.DateTimeFormat('es-CO', long
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short', year: 'numeric' }
  ).format(new Date(iso))
}

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span className="text-4xl">{icon}</span>
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-xs">{text}</p>
    </div>
  )
}

// ─── Session type colours & labels ───────────────────────────────────────────

const SESSION_TYPE_META: Record<SessionType, { label: string; icon: string; color: string }> = {
  precision_sprint: { label: 'Precision Sprint', icon: '⚡', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  culture_club:     { label: 'Culture Club',     icon: '🌍', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
  professional_lab: { label: 'Professional Lab', icon: '💼', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  standard:         { label: 'Estándar',          icon: '📚', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

// ─── Grabaciones tab ─────────────────────────────────────────────────────────

function GrabacionesTab({ studentId }: { studentId: string }) {
  const { sessions, loading } = useStudentClassSessions(studentId)

  const withRecording = sessions.filter(
    (s) => s.status === 'taken' && s.session_recording_url
  )

  if (loading) return <Spinner />
  if (withRecording.length === 0) {
    return (
      <EmptyState
        icon="🎬"
        text="Aún no hay grabaciones disponibles. Tu docente las agregará después de cada clase."
      />
    )
  }

  return (
    <ul className="space-y-3">
      {withRecording.map((s) => {
        const meta = SESSION_TYPE_META[s.session_type] ?? SESSION_TYPE_META.standard
        return (
          <li
            key={s.id}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                  {meta.icon} {meta.label}
                </span>
                <span className="text-xs text-gray-400">{formatDate(s.scheduled_date, true)}</span>
              </div>
              {s.notes && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{s.notes}</p>
              )}
            </div>
            <a
              href={s.session_recording_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary-dark dark:text-primary hover:bg-primary/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ver grabación
            </a>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Resource type icons & labels ─────────────────────────────────────────────

const RESOURCE_META: Record<ResourceType, { icon: string; label: string; color: string }> = {
  video: { icon: '🎬', label: 'Video', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  pdf:   { icon: '📄', label: 'PDF',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  link:  { icon: '🔗', label: 'Link',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  audio: { icon: '🎵', label: 'Audio', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  other: { icon: '📎', label: 'Recurso', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

// ─── Materiales tab ───────────────────────────────────────────────────────────

function MaterialesTab({ studentId }: { studentId: string }) {
  const { resources, loading } = useStudentResources(studentId)
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all')

  const filtered = typeFilter === 'all'
    ? resources
    : resources.filter((r) => r.type === typeFilter)

  if (loading) return <Spinner />
  if (resources.length === 0) {
    return (
      <EmptyState
        icon="📚"
        text="Tu docente aún no ha subido materiales para ti."
      />
    )
  }

  const types: (ResourceType | 'all')[] = ['all', 'video', 'pdf', 'link', 'audio', 'other']
  const availableTypes = types.filter(
    (t) => t === 'all' || resources.some((r) => r.type === t)
  )

  return (
    <div className="space-y-4">
      {/* Type filter */}
      <div className="flex gap-1.5 flex-wrap">
        {availableTypes.map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              typeFilter === t
                ? 'border-primary bg-primary/10 text-primary-dark dark:text-primary'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            {t === 'all' ? 'Todos' : RESOURCE_META[t].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No hay materiales de este tipo.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((r) => {
            const meta = RESOURCE_META[r.type] ?? RESOURCE_META.other
            return (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:border-primary/50 hover:shadow-sm transition-all group"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {r.title}
                    </p>
                    {r.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {r.description}
                      </p>
                    )}
                    <span className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                  </div>
                  <svg
                    className="flex-shrink-0 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors mt-0.5"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ─── Glosario tab ─────────────────────────────────────────────────────────────

function GlosarioTab({ studentId }: { studentId: string }) {
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

  const filtered = entries.filter((e) => {
    if (filter === 'mastered' && !e.mastered) return false
    if (filter === 'pending' && e.mastered) return false
    if (search) {
      const q = search.toLowerCase()
      return e.word.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q)
    }
    return true
  })

  if (loading) return <Spinner />
  if (entries.length === 0) {
    return (
      <EmptyState
        icon="📖"
        text="Tu glosario está vacío. Tu docente irá agregando palabras durante las clases."
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {entries.filter((e) => e.mastered).length}/{entries.length} dominadas
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
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar palabra…"
          className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {(['all', 'pending', 'mastered'] as const).map((f) => (
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

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No hay palabras que coincidan.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((entry) => (
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

// ─── Tab definitions ──────────────────────────────────────────────────────────

type Tab = 'grabaciones' | 'materiales' | 'glosario'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'grabaciones', label: 'Grabaciones', emoji: '🎬' },
  { id: 'materiales',  label: 'Materiales',  emoji: '📚' },
  { id: 'glosario',    label: 'Glosario',    emoji: '📖' },
]

// ─── Main page ────────────────────────────────────────────────────────────────

export default function StudentVault() {
  const { appUser } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('grabaciones')

  return (
    <AppLayout title="Mi Vault">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>🗄️</span> Mi Vault
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tu biblioteca personal de clases, materiales y vocabulario.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-base leading-none">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {appUser?.id && activeTab === 'grabaciones' && (
            <GrabacionesTab studentId={appUser.id} />
          )}
          {appUser?.id && activeTab === 'materiales' && (
            <MaterialesTab studentId={appUser.id} />
          )}
          {appUser?.id && activeTab === 'glosario' && (
            <GlosarioTab studentId={appUser.id} />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
