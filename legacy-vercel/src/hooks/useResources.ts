import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../features/auth/AuthContext'

export type ResourceType = 'link' | 'pdf' | 'video' | 'audio' | 'other'

export interface Resource {
  id: string
  teacher_id: string
  student_id: string | null
  title: string
  url: string
  description: string | null
  type: ResourceType
  created_at: string
  student_name?: string | null
}

export interface CreateResourceInput {
  title: string
  url: string
  description?: string
  type: ResourceType
  student_id?: string | null
}

export function useTeacherResources() {
  const { appUser } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!appUser) return
    try {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('resources')
        .select(`
          id, teacher_id, student_id, title, url, description, type, created_at,
          students!resources_student_id_fkey (
            users!students_id_fkey ( name )
          )
        `)
        .eq('teacher_id', appUser.id)
        .order('created_at', { ascending: false })

      if (err) throw err

      const mapped: Resource[] = (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        teacher_id: r.teacher_id as string,
        student_id: r.student_id as string | null,
        title: r.title as string,
        url: r.url as string,
        description: r.description as string | null,
        type: r.type as ResourceType,
        created_at: r.created_at as string,
        student_name: r.student_id
          ? ((r.students as Record<string, unknown>)?.users as Record<string, unknown>)?.name as string ?? null
          : null,
      }))
      setResources(mapped)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar recursos')
    } finally {
      setLoading(false)
    }
  }, [appUser])

  useEffect(() => { load() }, [load])

  return { resources, loading, error, reload: load }
}

export async function createResource(teacherId: string, input: CreateResourceInput): Promise<void> {
  const { error } = await supabase.from('resources').insert({
    teacher_id: teacherId,
    student_id: input.student_id ?? null,
    title: input.title.trim(),
    url: input.url.trim(),
    description: input.description?.trim() || null,
    type: input.type,
  })
  if (error) throw error
}

export async function deleteResource(id: string): Promise<void> {
  const { error } = await supabase.from('resources').delete().eq('id', id)
  if (error) throw error
}

export function useStudentResources(studentId: string) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studentId) return
    async function load() {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('resources')
          .select('id, teacher_id, student_id, title, url, description, type, created_at')
          .or(`student_id.eq.${studentId},student_id.is.null`)
          .order('created_at', { ascending: false })
        if (err) throw err
        setResources((data ?? []) as Resource[])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  return { resources, loading, error }
}
