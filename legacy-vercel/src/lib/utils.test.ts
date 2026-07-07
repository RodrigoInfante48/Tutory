import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('returns empty string with no arguments', () => {
    expect(cn()).toBe('')
  })

  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('joins multiple classes with a space', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('filters out undefined', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })

  it('filters out null', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('filters out false', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar')
  })

  it('filters out empty string', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('returns empty string when all values are falsy', () => {
    expect(cn(undefined, null, false)).toBe('')
  })

  it('handles a mix of truthy and falsy values', () => {
    expect(cn('a', false, 'b', null, undefined, 'c')).toBe('a b c')
  })
})
