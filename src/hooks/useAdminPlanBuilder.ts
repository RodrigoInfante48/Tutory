import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface PlanBuilderTopic {
  id: string
  unit_id: string
  title: string
  order: number
}

export interface PlanBuilderUnit {
  id: string
  title: string
  order: number
  topics: PlanBuilderTopic[]
}

export interface PlanBuilderPlan {
  id: string
  name: string
  description: string | null
}

export function usePlanBuilder(planId: string) {
  const [plan, setPlan] = useState<PlanBuilderPlan | null>(null)
  const [units, setUnits] = useState<PlanBuilderUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [planRes, unitsRes] = await Promise.all([
        supabase.from('study_plans').select('id, name, description').eq('id', planId).single(),
        supabase
          .from('units')
          .select('id, title, order')
          .eq('plan_id', planId)
          .order('order', { ascending: true }),
      ])
      if (planRes.error) throw planRes.error
      if (unitsRes.error) throw unitsRes.error

      const unitIds = (unitsRes.data ?? []).map((u: { id: string }) => u.id)

      let topicsData: PlanBuilderTopic[] = []
      if (unitIds.length > 0) {
        const { data, error: topicsErr } = await supabase
          .from('topics')
          .select('id, unit_id, title, order')
          .in('unit_id', unitIds)
          .order('order', { ascending: true })
        if (topicsErr) throw topicsErr
        topicsData = (data ?? []) as PlanBuilderTopic[]
      }

      const unitRows = (unitsRes.data ?? []) as Omit<PlanBuilderUnit, 'topics'>[]
      const built: PlanBuilderUnit[] = unitRows.map((u) => ({
        ...u,
        topics: topicsData.filter((t) => t.unit_id === u.id),
      }))

      setPlan(planRes.data as PlanBuilderPlan)
      setUnits(built)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el plan')
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    load()
  }, [load])

  async function createUnit(title: string) {
    const maxOrder = units.length > 0 ? Math.max(...units.map((u) => u.order)) : 0
    const { data, error: err } = await supabase
      .from('units')
      .insert({ plan_id: planId, title: title.trim(), order: maxOrder + 1 })
      .select('id, title, order')
      .single()
    if (err) throw err
    setUnits((prev) => [...prev, { ...(data as Omit<PlanBuilderUnit, 'topics'>), topics: [] }])
  }

  async function updateUnit(id: string, title: string) {
    const { error: err } = await supabase
      .from('units')
      .update({ title: title.trim() })
      .eq('id', id)
    if (err) throw err
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, title: title.trim() } : u)))
  }

  async function deleteUnit(id: string) {
    const { error: err } = await supabase.from('units').delete().eq('id', id)
    if (err) throw err
    setUnits((prev) => prev.filter((u) => u.id !== id))
  }

  async function reorderUnit(id: string, direction: 'up' | 'down') {
    const sorted = [...units].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((u) => u.id === id)
    const neighborIdx = direction === 'up' ? idx - 1 : idx + 1
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return

    const curr = sorted[idx]
    const neighbor = sorted[neighborIdx]

    await Promise.all([
      supabase.from('units').update({ order: neighbor.order }).eq('id', curr.id),
      supabase.from('units').update({ order: curr.order }).eq('id', neighbor.id),
    ])

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === curr.id) return { ...u, order: neighbor.order }
        if (u.id === neighbor.id) return { ...u, order: curr.order }
        return u
      }),
    )
  }

  async function createTopic(unitId: string, title: string) {
    const unit = units.find((u) => u.id === unitId)
    const maxOrder =
      unit && unit.topics.length > 0 ? Math.max(...unit.topics.map((t) => t.order)) : 0
    const { data, error: err } = await supabase
      .from('topics')
      .insert({ unit_id: unitId, title: title.trim(), order: maxOrder + 1 })
      .select('id, unit_id, title, order')
      .single()
    if (err) throw err
    const newTopic = data as PlanBuilderTopic
    setUnits((prev) =>
      prev.map((u) => (u.id === unitId ? { ...u, topics: [...u.topics, newTopic] } : u)),
    )
  }

  async function updateTopic(id: string, title: string) {
    const { error: err } = await supabase
      .from('topics')
      .update({ title: title.trim() })
      .eq('id', id)
    if (err) throw err
    setUnits((prev) =>
      prev.map((u) => ({
        ...u,
        topics: u.topics.map((t) => (t.id === id ? { ...t, title: title.trim() } : t)),
      })),
    )
  }

  async function deleteTopic(id: string) {
    const { error: err } = await supabase.from('topics').delete().eq('id', id)
    if (err) throw err
    setUnits((prev) =>
      prev.map((u) => ({ ...u, topics: u.topics.filter((t) => t.id !== id) })),
    )
  }

  async function reorderTopic(id: string, direction: 'up' | 'down') {
    const unit = units.find((u) => u.topics.some((t) => t.id === id))
    if (!unit) return

    const sorted = [...unit.topics].sort((a, b) => a.order - b.order)
    const idx = sorted.findIndex((t) => t.id === id)
    const neighborIdx = direction === 'up' ? idx - 1 : idx + 1
    if (neighborIdx < 0 || neighborIdx >= sorted.length) return

    const curr = sorted[idx]
    const neighbor = sorted[neighborIdx]

    await Promise.all([
      supabase.from('topics').update({ order: neighbor.order }).eq('id', curr.id),
      supabase.from('topics').update({ order: curr.order }).eq('id', neighbor.id),
    ])

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unit.id) return u
        return {
          ...u,
          topics: u.topics.map((t) => {
            if (t.id === curr.id) return { ...t, order: neighbor.order }
            if (t.id === neighbor.id) return { ...t, order: curr.order }
            return t
          }),
        }
      }),
    )
  }

  return {
    plan,
    units,
    loading,
    error,
    reload: load,
    createUnit,
    updateUnit,
    deleteUnit,
    reorderUnit,
    createTopic,
    updateTopic,
    deleteTopic,
    reorderTopic,
  }
}
