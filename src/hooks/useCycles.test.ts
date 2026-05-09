import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { makeChain } from '../__mocks__/supabase'

// vi.mock is hoisted above imports by Vitest, so this runs before any import
// of '../lib/supabase'. The module-level supabase.from is a plain vi.fn() that
// we configure per-test via mockReturnValueOnce.
vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
  configError: null,
}))

// These imports resolve AFTER the mock is applied
import { supabase } from '../lib/supabase'
import { useTeacherCycleAlerts } from './useCycles'

const TODAY = '2024-06-15'

beforeEach(() => {
  vi.clearAllMocks()
  vi.setSystemTime(new Date(TODAY))
})

// Wires the three sequential supabase.from() calls that useTeacherCycleAlerts makes:
//   1. from('students')      → student list
//   2. from('cycles')        → cycle list
//   3. from('class_sessions')× N → taken count per cycle
function mockTeacherCycleData(
  cycles: Array<{
    id: string
    student_id: string
    start_date: string
    end_date: string
    min_classes: number
    takenCount: number
  }>
) {
  const students = [...new Set(cycles.map((c) => c.student_id))].map((id) => ({
    id,
    users: { name: `Student ${id}` },
  }))

  const cycleRows = cycles.map(({ takenCount: _t, ...c }) => c)

  vi.mocked(supabase.from)
    .mockReturnValueOnce(makeChain({ data: students, error: null }))
    .mockReturnValueOnce(makeChain({ data: cycleRows, error: null }))

  for (const c of cycles) {
    vi.mocked(supabase.from).mockReturnValueOnce(
      makeChain({ count: c.takenCount, error: null })
    )
  }
}

describe('useTeacherCycleAlerts — deficit and isImpossible', () => {
  it('computes deficit as min_classes minus takenCount', async () => {
    mockTeacherCycleData([
      {
        id: 'c1',
        student_id: 's1',
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        min_classes: 8,
        takenCount: 3,
      },
    ])

    const { result } = renderHook(() => useTeacherCycleAlerts('teacher-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.alerts).toHaveLength(1)
    expect(result.current.alerts[0].deficit).toBe(5)
    expect(result.current.alerts[0].takenCount).toBe(3)
    expect(result.current.alerts[0].minClasses).toBe(8)
  })

  it('marks isImpossible=false when deficit <= daysLeft', async () => {
    // TODAY=2024-06-15, end_date=2024-06-30 → daysLeft=15, deficit=5 → not impossible
    mockTeacherCycleData([
      {
        id: 'c1',
        student_id: 's1',
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        min_classes: 8,
        takenCount: 3,
      },
    ])

    const { result } = renderHook(() => useTeacherCycleAlerts('teacher-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.alerts[0].isImpossible).toBe(false)
  })

  it('marks isImpossible=true when deficit > daysLeft', async () => {
    // TODAY=2024-06-15, end_date=2024-06-17 → daysLeft=2, deficit=5 → impossible
    mockTeacherCycleData([
      {
        id: 'c1',
        student_id: 's1',
        start_date: '2024-06-01',
        end_date: '2024-06-17',
        min_classes: 8,
        takenCount: 3,
      },
    ])

    const { result } = renderHook(() => useTeacherCycleAlerts('teacher-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.alerts[0].isImpossible).toBe(true)
  })

  it('marks isImpossible=false when deficit=0 (student completed all classes)', async () => {
    mockTeacherCycleData([
      {
        id: 'c1',
        student_id: 's1',
        start_date: '2024-06-01',
        end_date: '2024-06-17',
        min_classes: 8,
        takenCount: 8,
      },
    ])

    const { result } = renderHook(() => useTeacherCycleAlerts('teacher-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    // Complete cycle is filtered out from at-risk list
    expect(result.current.alerts).toHaveLength(0)
    expect(result.current.atRiskCount).toBe(0)
  })

  it('only includes cycles with deficit > 0 in alerts', async () => {
    mockTeacherCycleData([
      {
        id: 'c1',
        student_id: 's1',
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        min_classes: 8,
        takenCount: 8, // complete
      },
      {
        id: 'c2',
        student_id: 's2',
        start_date: '2024-06-01',
        end_date: '2024-06-30',
        min_classes: 8,
        takenCount: 2, // at risk
      },
    ])

    const { result } = renderHook(() => useTeacherCycleAlerts('teacher-1'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.alerts).toHaveLength(1)
    expect(result.current.alerts[0].studentId).toBe('s2')
    expect(result.current.atRiskCount).toBe(1)
  })

  it('returns empty alerts and loading=false when teacherId is null', () => {
    const { result } = renderHook(() => useTeacherCycleAlerts(null))

    expect(result.current.alerts).toHaveLength(0)
    expect(result.current.loading).toBe(false)
  })
})
