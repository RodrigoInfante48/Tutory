import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface PlanOption {
  id: string
  name: string
  description: string | null
}

export function useAllPlans() {
  const [plans, setPlans] = useState<PlanOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('study_plans')
      .select('id, name, description')
      .order('name', { ascending: true })
      .then(({ data }) => {
        setPlans((data ?? []) as PlanOption[])
        setLoading(false)
      })
  }, [])

  return { plans, loading }
}

export async function assignPlanToStudent(studentId: string, planId: string | null) {
  const { error } = await supabase
    .from('students')
    .update({ plan_id: planId })
    .eq('id', studentId)
  if (error) throw error
}
