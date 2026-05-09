import { vi } from 'vitest'

// Creates a thenable chain mock — every method returns itself so calls can be
// chained, and awaiting the chain resolves with `resolveValue`.
export function makeChain(resolveValue: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const self: any = {
    select: vi.fn(() => self),
    eq: vi.fn(() => self),
    gte: vi.fn(() => self),
    lte: vi.fn(() => self),
    order: vi.fn(() => self),
    limit: vi.fn(() => self),
    in: vi.fn(() => self),
    maybeSingle: vi.fn(() => Promise.resolve(resolveValue)),
    single: vi.fn(() => Promise.resolve(resolveValue)),
    then: (resolve: (v: unknown) => unknown, reject?: (e: unknown) => unknown) =>
      Promise.resolve(resolveValue).then(resolve, reject),
    catch: (reject: (e: unknown) => unknown) => Promise.resolve(resolveValue).catch(reject),
  }
  return self
}

export const supabase = {
  from: vi.fn(),
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({}),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
  },
}

export const configError = null
