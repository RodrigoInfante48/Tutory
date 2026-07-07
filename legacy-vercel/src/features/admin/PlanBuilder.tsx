import { useState, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppLayout from '../../app/AppLayout'
import { usePlanBuilder } from '../../hooks/useAdminPlanBuilder'
import TopicEditor from './TopicEditor'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354ZM11.189 6.25 9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064Z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.576l-.66-6.6a.75.75 0 1 1 1.492-.149Z" />
    </svg>
  )
}

// ── Inline input ──────────────────────────────────────────────────────────────

interface InlineInputProps {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  placeholder?: string
  disabled?: boolean
}

function InlineInput({ value, onChange, onSave, onCancel, placeholder, disabled }: InlineInputProps) {
  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); onSave() }
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-w-0 px-2 py-0.5 text-sm rounded border border-primary/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
      />
      <button
        type="button"
        onClick={onSave}
        disabled={disabled || !value.trim()}
        className="p-0.5 text-green-600 dark:text-primary hover:bg-green-50 dark:hover:bg-green-950/30 rounded transition-colors disabled:opacity-40"
        title="Guardar (Enter)"
      >
        ✓
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
        title="Cancelar (Esc)"
      >
        ✕
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PlanBuilder() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()

  const {
    plan,
    units,
    loading,
    error,
    createUnit,
    updateUnit,
    deleteUnit,
    reorderUnit,
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopic,
    updateTopicContent,
    saveQuestions,
  } = usePlanBuilder(planId!)

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  // Inline editing state
  const [editingUnit, setEditingUnit] = useState<{ id: string; value: string } | null>(null)
  const [editingTopic, setEditingTopic] = useState<{ id: string; value: string } | null>(null)

  // Inline adding state
  const [addingUnit, setAddingUnit] = useState(false)
  const [addingUnitValue, setAddingUnitValue] = useState('')
  const [addingTopicUnitId, setAddingTopicUnitId] = useState<string | null>(null)
  const [addingTopicValue, setAddingTopicValue] = useState('')

  // Delete confirmation state
  const [confirmDeleteUnit, setConfirmDeleteUnit] = useState<string | null>(null)
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState<string | null>(null)

  // Async operation state
  const [opLoading, setOpLoading] = useState(false)
  const [opError, setOpError] = useState<string | null>(null)

  const sortedUnits = [...units].sort((a, b) => a.order - b.order)
  const allTopics = units.flatMap((u) => u.topics)
  const selectedTopic = allTopics.find((t) => t.id === selectedTopicId) ?? null
  const selectedUnit = selectedTopic
    ? units.find((u) => u.topics.some((t) => t.id === selectedTopicId))
    : null

  async function op(fn: () => Promise<unknown>) {
    setOpLoading(true)
    setOpError(null)
    try {
      await fn()
    } catch (err) {
      setOpError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setOpLoading(false)
    }
  }

  // ── Unit handlers ──

  async function handleSaveUnit() {
    if (!editingUnit?.value.trim()) return
    await op(async () => {
      await updateUnit(editingUnit.id, editingUnit.value)
      setEditingUnit(null)
    })
  }

  async function handleAddUnit() {
    if (!addingUnitValue.trim()) return
    await op(async () => {
      await createUnit(addingUnitValue)
      setAddingUnit(false)
      setAddingUnitValue('')
    })
  }

  async function handleDeleteUnit(id: string) {
    await op(async () => {
      const unitTopicIds = units.find((u) => u.id === id)?.topics.map((t) => t.id) ?? []
      await deleteUnit(id)
      setConfirmDeleteUnit(null)
      if (selectedTopicId && unitTopicIds.includes(selectedTopicId)) {
        setSelectedTopicId(null)
      }
    })
  }

  // ── Topic handlers ──

  async function handleSaveTopic() {
    if (!editingTopic?.value.trim()) return
    await op(async () => {
      await updateTopic(editingTopic.id, editingTopic.value)
      setEditingTopic(null)
    })
  }

  async function handleAddTopic(unitId: string) {
    if (!addingTopicValue.trim()) return
    await op(async () => {
      await createTopic(unitId, addingTopicValue)
      setAddingTopicUnitId(null)
      setAddingTopicValue('')
    })
  }

  async function handleDeleteTopic(id: string) {
    await op(async () => {
      await deleteTopic(id)
      setConfirmDeleteTopic(null)
      if (selectedTopicId === id) setSelectedTopicId(null)
    })
  }

  return (
    <AppLayout title={plan?.name ?? 'Editor de plan'}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-5 flex-wrap">
          <button
            onClick={() => navigate('/admin')}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Admin
          </button>
          <span className="text-gray-300 dark:text-gray-600">→</span>
          <button
            onClick={() => navigate('/admin/plans')}
            className="hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Planes
          </button>
          <span className="text-gray-300 dark:text-gray-600">→</span>
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
            {loading ? '…' : (plan?.name ?? planId)}
          </span>
        </nav>

        {/* Op error banner */}
        {opError && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm flex items-center justify-between gap-3">
            <span>{opError}</span>
            <button
              onClick={() => setOpError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-16 text-gray-400">
            <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">Cargando plan…</span>
          </div>
        )}

        {/* Load error */}
        {!loading && error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Two-column layout */}
        {!loading && !error && (
          <div className="flex gap-5 items-start">
            {/* ── Left: unit tree (1/3) ── */}
            <div className="w-1/3 min-w-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Panel header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Estructura del plan
                </h2>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {sortedUnits.length} unidad{sortedUnits.length !== 1 ? 'es' : ''}
                </span>
              </div>

              <div className="p-3 space-y-2">
                {sortedUnits.length === 0 && !addingUnit && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
                    Sin unidades. Agrega la primera.
                  </p>
                )}

                {sortedUnits.map((unit, uIdx) => {
                  const sortedTopics = [...unit.topics].sort((a, b) => a.order - b.order)
                  const isEditingUnit = editingUnit?.id === unit.id
                  const isDeletingUnit = confirmDeleteUnit === unit.id
                  const isFirst = uIdx === 0
                  const isLast = uIdx === sortedUnits.length - 1

                  return (
                    <div
                      key={unit.id}
                      className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      {/* Unit header row */}
                      <div
                        className={[
                          'flex items-center gap-2 px-3 py-2.5',
                          isDeletingUnit
                            ? 'bg-red-50 dark:bg-red-950/30'
                            : 'bg-gray-50 dark:bg-gray-800/60',
                        ].join(' ')}
                      >
                        {isDeletingUnit ? (
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <span className="text-xs text-red-600 dark:text-red-400 flex-1 min-w-0 truncate">
                              ¿Eliminar "{unit.title}" y todos sus topics?
                            </span>
                            <button
                              onClick={() => handleDeleteUnit(unit.id)}
                              disabled={opLoading}
                              className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                            >
                              Sí
                            </button>
                            <button
                              onClick={() => setConfirmDeleteUnit(null)}
                              className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : isEditingUnit ? (
                          <InlineInput
                            value={editingUnit.value}
                            onChange={(v) => setEditingUnit((prev) => prev ? { ...prev, value: v } : null)}
                            onSave={handleSaveUnit}
                            onCancel={() => setEditingUnit(null)}
                            disabled={opLoading}
                          />
                        ) : (
                          <>
                            <span className="flex-1 min-w-0 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {unit.title}
                            </span>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                onClick={() => setEditingUnit({ id: unit.id, value: unit.title })}
                                className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors"
                                title="Editar unidad"
                              >
                                <IconEdit />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteUnit(unit.id)}
                                className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                title="Eliminar unidad"
                              >
                                <IconTrash />
                              </button>
                              <div className="flex flex-col ml-0.5 border-l border-gray-200 dark:border-gray-700 pl-1">
                                <button
                                  onClick={() => op(() => reorderUnit(unit.id, 'up'))}
                                  disabled={isFirst || opLoading}
                                  className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none text-[11px]"
                                  title="Subir"
                                >
                                  ▲
                                </button>
                                <button
                                  onClick={() => op(() => reorderUnit(unit.id, 'down'))}
                                  disabled={isLast || opLoading}
                                  className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none text-[11px]"
                                  title="Bajar"
                                >
                                  ▼
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Topic list */}
                      <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {sortedTopics.map((topic, tIdx) => {
                          const isEditingTopic = editingTopic?.id === topic.id
                          const isDeletingTopic = confirmDeleteTopic === topic.id
                          const isFirstTopic = tIdx === 0
                          const isLastTopic = tIdx === sortedTopics.length - 1
                          const isSelected = selectedTopicId === topic.id

                          return (
                            <div
                              key={topic.id}
                              className={[
                                'group flex items-center gap-2 px-3 py-1.5',
                                isSelected && !isEditingTopic && !isDeletingTopic
                                  ? 'bg-primary/10'
                                  : isDeletingTopic
                                    ? 'bg-red-50 dark:bg-red-950/20'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/30',
                              ].join(' ')}
                            >
                              {isDeletingTopic ? (
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <span className="text-xs text-red-600 dark:text-red-400 flex-1 min-w-0 truncate">
                                    ¿Eliminar "{topic.title}"?
                                  </span>
                                  <button
                                    onClick={() => handleDeleteTopic(topic.id)}
                                    disabled={opLoading}
                                    className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
                                  >
                                    Sí
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteTopic(null)}
                                    className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : isEditingTopic ? (
                                <>
                                  <span className="text-gray-200 dark:text-gray-700 text-xs flex-shrink-0 select-none">└</span>
                                  <InlineInput
                                    value={editingTopic.value}
                                    onChange={(v) => setEditingTopic((prev) => prev ? { ...prev, value: v } : null)}
                                    onSave={handleSaveTopic}
                                    onCancel={() => setEditingTopic(null)}
                                    disabled={opLoading}
                                  />
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-200 dark:text-gray-700 text-xs flex-shrink-0 select-none">└</span>
                                  <button
                                    onClick={() =>
                                      setSelectedTopicId(isSelected ? null : topic.id)
                                    }
                                    className={[
                                      'flex-1 min-w-0 text-left text-xs py-0.5 truncate transition-colors',
                                      isSelected
                                        ? 'text-green-700 dark:text-primary font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
                                    ].join(' ')}
                                  >
                                    {topic.title}
                                  </button>
                                  <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        setEditingTopic({ id: topic.id, value: topic.title })
                                      }
                                      className="p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      title="Editar topic"
                                    >
                                      <IconEdit />
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteTopic(topic.id)}
                                      className="p-0.5 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                      title="Eliminar topic"
                                    >
                                      <IconTrash />
                                    </button>
                                    <div className="flex flex-col border-l border-gray-200 dark:border-gray-700 pl-0.5 ml-0.5">
                                      <button
                                        onClick={() => op(() => reorderTopic(topic.id, 'up'))}
                                        disabled={isFirstTopic || opLoading}
                                        className="text-gray-200 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none text-[9px]"
                                        title="Subir"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        onClick={() => op(() => reorderTopic(topic.id, 'down'))}
                                        disabled={isLastTopic || opLoading}
                                        className="text-gray-200 dark:text-gray-700 hover:text-gray-500 dark:hover:text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors leading-none text-[9px]"
                                        title="Bajar"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}

                        {/* Add topic */}
                        {addingTopicUnitId === unit.id ? (
                          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/60 dark:bg-gray-800/20">
                            <span className="text-gray-200 dark:text-gray-700 text-xs flex-shrink-0 select-none">└</span>
                            <InlineInput
                              value={addingTopicValue}
                              onChange={setAddingTopicValue}
                              onSave={() => handleAddTopic(unit.id)}
                              onCancel={() => {
                                setAddingTopicUnitId(null)
                                setAddingTopicValue('')
                              }}
                              placeholder="Título del topic…"
                              disabled={opLoading}
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setAddingTopicUnitId(unit.id)
                              setAddingTopicValue('')
                            }}
                            className="w-full flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-primary-dark dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <span className="text-sm leading-none">+</span>
                            Agregar topic
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {/* Add unit */}
                {addingUnit ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                    <InlineInput
                      value={addingUnitValue}
                      onChange={setAddingUnitValue}
                      onSave={handleAddUnit}
                      onCancel={() => {
                        setAddingUnit(false)
                        setAddingUnitValue('')
                      }}
                      placeholder="Título de la unidad…"
                      disabled={opLoading}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAddingUnit(true)
                      setAddingUnitValue('')
                    }}
                    className="w-full flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-400 dark:text-gray-500 hover:text-primary-dark dark:hover:text-primary rounded-xl border border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/40 transition-colors"
                  >
                    <span className="text-base leading-none">+</span>
                    Agregar unidad
                  </button>
                )}
              </div>
            </div>

            {/* ── Right: topic panel (2/3) ── */}
            <div className="flex-1 min-w-0 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 min-h-[500px] flex flex-col">
              {selectedTopic ? (
                <TopicEditor
                  topic={selectedTopic}
                  unitTitle={selectedUnit?.title ?? ''}
                  updateTopicContent={updateTopicContent}
                  saveQuestions={saveQuestions}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-2xl mb-4">
                    👈
                  </div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Selecciona un topic
                  </p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 max-w-[200px]">
                    Haz click en cualquier topic del árbol para ver su panel de edición
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
