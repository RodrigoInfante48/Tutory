import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface AdminPlan {
  id: string
  name: string
  description: string | null
  published: boolean
  created_at: string
  unit_count: number
}

export function usePlans() {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('study_plans')
        .select('id, name, description, published, created_at, units(id)')
        .order('created_at', { ascending: false })
      if (err) throw err

      const planList: AdminPlan[] = (data ?? []).map((p) => {
        const row = p as unknown as {
          id: string
          name: string
          description: string | null
          published: boolean
          created_at: string
          units: { id: string }[]
        }
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          published: row.published,
          created_at: row.created_at,
          unit_count: Array.isArray(row.units) ? row.units.length : 0,
        }
      })
      setPlans(planList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { plans, loading, error, reload: load }
}

export async function createPlan(name: string, description: string, published: boolean) {
  const { data, error } = await supabase
    .from('study_plans')
    .insert({ name, description: description.trim() || null, published })
    .select('id')
    .single()
  if (error) throw error
  return data as { id: string }
}

export async function updatePlan(
  id: string,
  fields: { name?: string; description?: string | null; published?: boolean },
) {
  const { error } = await supabase.from('study_plans').update(fields).eq('id', id)
  if (error) throw error
}

export async function deletePlan(id: string) {
  const { error } = await supabase.from('study_plans').delete().eq('id', id)
  if (error) throw error
}
