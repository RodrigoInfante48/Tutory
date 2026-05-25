import { useState, useRef, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../../app/AppLayout'
import {
  usePlans,
  createPlan,
  updatePlan,
  deletePlan,
  type AdminPlan,
} from '../../hooks/useAdminPlans'

// ── Modal ─────────────────────────────────────────────────────────────────────

interface PlanFormData {
  name: string
  description: string
  published: boolean
}

interface PlanModalProps {
  initial?: AdminPlan
  onClose: () => void
  onSaved: () => void
}

function PlanModal({ initial, onClose, onSaved }: PlanModalProps) {
  const [form, setForm] = useState<PlanFormData>({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    published: initial?.published ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es requerido.')
      nameRef.current?.focus()
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (initial) {
        await updatePlan(initial.id, {
          name: form.name.trim(),
          description: form.description.trim() || null,
          published: form.published,
        })
      } else {
        await createPlan(form.name.trim(), form.description.trim(), form.published)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initial ? 'Editar plan' : 'Nuevo plan'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej: English A1 – Beginner"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descripción opcional del plan de estudios…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Publicar</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Los estudiantes solo ven planes publicados
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.published}
              onClick={() => setForm((f) => ({ ...f, published: !f.published }))}
              className={[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900',
                form.published ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                  form.published ? 'translate-x-6' : 'translate-x-1',
                ].join(' ')}
              />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-dark font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? 'Guardando…' : initial ? 'Guardar cambios' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirm dialog ──────────────────────────────────────────────────────

interface DeleteDialogProps {
  plan: AdminPlan
  onClose: () => void
  onDeleted: () => void
}

function DeleteDialog({ plan, onClose, onDeleted }: DeleteDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      await deletePlan(plan.id)
      onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-xl">
            🗑️
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Eliminar plan</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          ¿Seguro que quieres eliminar <span className="font-semibold text-gray-900 dark:text-white">"{plan.name}"</span>?
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
          Se borrarán en cascada todas sus unidades, topics y preguntas. Esta acción no se puede deshacer.
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Table skeleton ─────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPlansPage() {
  const navigate = useNavigate()
  const { plans, loading, error, reload } = usePlans()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<AdminPlan | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminPlan | null>(null)

  function openCreate() {
    setEditTarget(null)
    setModalOpen(true)
  }

  function openEdit(plan: AdminPlan, e: React.MouseEvent) {
    e.stopPropagation()
    setEditTarget(plan)
    setModalOpen(true)
  }

  function openDelete(plan: AdminPlan, e: React.MouseEvent) {
    e.stopPropagation()
    setDeleteTarget(plan)
  }

  function handleSaved() {
    setModalOpen(false)
    setEditTarget(null)
    reload()
  }

  function handleDeleted() {
    setDeleteTarget(null)
    reload()
  }

  return (
    <AppLayout title="Planes de estudio">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              Planes de estudio
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {loading ? '…' : `${plans.length} plan${plans.length !== 1 ? 'es' : ''}`}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-dark font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
          >
            <span className="text-base leading-none">+</span>
            Nuevo plan
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && <TableSkeleton />}

        {/* Empty state */}
        {!loading && !error && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Sin planes aún
            </h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs">
              Crea el primer plan de estudios para empezar a organizar el contenido.
            </p>
            <button
              onClick={openCreate}
              className="px-4 py-2.5 bg-primary text-primary-dark font-semibold text-sm rounded-lg hover:opacity-90 transition-opacity"
            >
              + Nuevo plan
            </button>
          </div>
        )}

        {/* Plans table */}
        {!loading && plans.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">
                    Nombre
                  </th>
                  <th className="text-left px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                    Descripción
                  </th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                    Unidades
                  </th>
                  <th className="text-center px-5 py-3.5 font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    onClick={() => navigate(`/admin/plans/${plan.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-dark dark:group-hover:text-primary transition-colors">
                        {plan.name}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {plan.description ?? <span className="italic text-gray-300 dark:text-gray-600">Sin descripción</span>}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {plan.unit_count}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {plan.published ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400" />
                          Publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600" />
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div
                        className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => openEdit(plan, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Editar"
                          title="Editar plan"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => openDelete(plan, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          aria-label="Eliminar"
                          title="Eliminar plan"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <PlanModal
          initial={editTarget ?? undefined}
          onClose={() => { setModalOpen(false); setEditTarget(null) }}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <DeleteDialog
          plan={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={handleDeleted}
        />
      )}
    </AppLayout>
  )
}
