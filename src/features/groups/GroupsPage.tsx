import React, { useState, useRef, useEffect } from 'react'
import AppLayout from '../../app/AppLayout'
import { useAuth } from '../auth/AuthContext'
import { useTeacherGroups, createGroup, addGroupMember, removeGroupMember, type Group } from '../../hooks/useGroups'
import { useTeacherStudents, type StudentSummary } from '../../hooks/useTeacherStudents'

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-900"
      />
    )
  }
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark dark:text-primary flex items-center justify-center text-xs font-bold border-2 border-white dark:border-gray-900">
      {initials || '?'}
    </div>
  )
}

function AddMemberDropdown({
  group,
  allStudents,
  onAdd,
}: {
  group: Group
  allStudents: StudentSummary[]
  onAdd: (studentId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const memberIds = new Set(group.members.map(m => m.student_id))
  const available = allStudents.filter(s => !memberIds.has(s.id))

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (available.length === 0) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors text-lg leading-none"
        title="Agregar estudiante"
      >
        +
      </button>
      {open && (
        <div className="absolute left-0 top-10 z-20 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-y-auto">
          {available.map(s => (
            <button
              key={s.id}
              onClick={() => { onAdd(s.id); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
            >
              <Avatar name={s.name} avatarUrl={s.avatar_url} />
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function GroupsPage() {
  const { appUser } = useAuth()
  const { groups, loading, error, reload } = useTeacherGroups()
  const { students } = useTeacherStudents()

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [removingKey, setRemovingKey] = useState<string | null>(null)
  const [addingKey, setAddingKey] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!appUser || !newName.trim()) { setCreateError('El nombre es obligatorio.'); return }
    try {
      setCreating(true)
      setCreateError(null)
      await createGroup(appUser.id, newName.trim())
      setShowCreate(false)
      setNewName('')
      reload()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Error al crear grupo')
    } finally {
      setCreating(false)
    }
  }

  async function handleAddMember(groupId: string, studentId: string) {
    const key = `${groupId}:${studentId}`
    setAddingKey(key)
    try {
      await addGroupMember(groupId, studentId)
      reload()
    } finally {
      setAddingKey(null)
    }
  }

  async function handleRemoveMember(groupId: string, studentId: string) {
    const key = `${groupId}:${studentId}`
    setRemovingKey(key)
    try {
      await removeGroupMember(groupId, studentId)
      reload()
    } finally {
      setRemovingKey(null)
    }
  }

  return (
    <AppLayout title="Grupos">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Grupos</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Organiza a tus estudiantes en grupos para asignar quizzes y recursos
            </p>
          </div>
          <button
            onClick={() => { setShowCreate(true); setNewName(''); setCreateError(null) }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors"
          >
            <span className="text-base">+</span> Crear grupo
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-heading font-semibold text-gray-900 dark:text-white">Nuevo grupo</h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                {createError && (
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    {createError}
                  </p>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del grupo *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="Ej. Intermediate B, Grupo Martes..."
                    autoFocus
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-60"
                  >
                    {creating ? 'Creando...' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Cargando grupos...</div>
        ) : error ? (
          <div className="py-8 text-center text-sm text-red-500">{error}</div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl mb-3">
              👥
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay grupos aún. ¡Crea el primero!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
              >
                {/* Group header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                      {group.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                      {group.members.length === 0
                        ? 'Sin miembros'
                        : `${group.members.length} ${group.members.length === 1 ? 'estudiante' : 'estudiantes'}`}
                    </p>
                  </div>
                </div>

                {/* Members row */}
                <div className="flex flex-wrap items-center gap-2">
                  {group.members.map(member => {
                    const removeKey = `${group.id}:${member.student_id}`
                    return (
                      <div key={member.student_id} className="relative group/member">
                        <Avatar name={member.name} avatarUrl={member.avatar_url} />
                        <button
                          onClick={() => handleRemoveMember(group.id, member.student_id)}
                          disabled={removingKey === removeKey}
                          title={`Quitar a ${member.name}`}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] leading-none items-center justify-center hidden group-hover/member:flex hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          {removingKey === removeKey ? '·' : '×'}
                        </button>
                        <span className="sr-only">{member.name}</span>
                      </div>
                    )
                  })}

                  {/* Tooltip names row */}
                  {group.members.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-1">
                      {group.members.map(m => (
                        <span key={m.student_id} className="text-xs text-gray-500 dark:text-gray-400">
                          {m.name.split(' ')[0]}{group.members[group.members.length - 1].student_id !== m.student_id ? ',' : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  <AddMemberDropdown
                    group={group}
                    allStudents={students}
                    onAdd={(studentId) => handleAddMember(group.id, studentId)}
                  />

                  {addingKey?.startsWith(group.id) && (
                    <span className="text-xs text-gray-400">Agregando...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
