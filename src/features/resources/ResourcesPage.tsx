import React, { useState } from 'react'
import AppLayout from '../../app/AppLayout'
import {
  useTeacherResources,
  createResource,
  deleteResource,
  type ResourceType,
  type CreateResourceInput,
} from '../../hooks/useResources'
import { useAuth } from '../auth/AuthContext'
import { useTeacherStudents } from '../../hooks/useTeacherStudents'

const TYPE_OPTIONS: { value: ResourceType; label: string; emoji: string }[] = [
  { value: 'link', label: 'Enlace', emoji: '🔗' },
  { value: 'pdf', label: 'PDF', emoji: '📄' },
  { value: 'video', label: 'Video', emoji: '🎬' },
  { value: 'audio', label: 'Audio', emoji: '🎵' },
  { value: 'other', label: 'Otro', emoji: '📎' },
]

const TYPE_EMOJI: Record<string, string> = {
  link: '🔗', pdf: '📄', video: '🎬', audio: '🎵', other: '📎',
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export default function ResourcesPage() {
  const { appUser } = useAuth()
  const { resources, loading, error, reload } = useTeacherResources()
  const { students } = useTeacherStudents()

  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all')
  const [filterScope, setFilterScope] = useState<'all' | 'global' | 'assigned'>('all')

  const [form, setForm] = useState<CreateResourceInput>({
    title: '', url: '', description: '', type: 'link', student_id: null,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = resources.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (filterScope === 'global' && r.student_id !== null) return false
    if (filterScope === 'assigned' && r.student_id === null) return false
    return true
  })

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!appUser) return
    if (!form.title.trim() || !form.url.trim()) {
      setFormError('El título y la URL son obligatorios.')
      return
    }
    try {
      setSaving(true)
      setFormError(null)
      await createResource(appUser.id, form)
      setShowForm(false)
      setForm({ title: '', url: '', description: '', type: 'link', student_id: null })
      reload()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Error al crear recurso')
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
    <AppLayout title="Recursos">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Recursos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Comparte links, PDFs y videos con tus estudiantes
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            <span className="text-base">+</span> Nuevo recurso
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value as typeof filterScope)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todos</option>
            <option value="global">Globales</option>
            <option value="assigned">Asignados</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as typeof filterType)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="all">Todos los tipos</option>
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
            ))}
          </select>
        </div>

        {/* Modal: New Resource Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Nuevo recurso</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {formError && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{formError}</p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Nombre del recurso"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL *</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descripción opcional..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a</label>
                    <select
                      value={form.student_id ?? ''}
                      onChange={(e) => setForm({ ...form, student_id: e.target.value || null })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Todos (global)</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Resources List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Cargando recursos...</div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-3">📚</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No hay recursos. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                  {TYPE_EMOJI[r.type] ?? '📎'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 dark:text-white hover:text-primary truncate"
                    >
                      {r.title}
                    </a>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 capitalize">
                      {r.type}
                    </span>
                    {r.student_id ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {r.student_name ?? 'Estudiante'}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        Global
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">{formatDate(r.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deletingId === r.id}
                  className="flex-shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  {deletingId === r.id ? '...' : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
