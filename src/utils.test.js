import { describe, it, expect, vi } from 'vitest'
import { generateId, today } from './utils'

describe('generateId', () => {
  it('returns a non-empty string', () => {
    expect(typeof generateId()).toBe('string')
    expect(generateId().length).toBeGreaterThan(0)
  })

  it('returns unique values on successive calls', () => {
    expect(generateId()).not.toBe(generateId())
  })
})

describe('today', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the current local date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-09T12:00:00'))
    expect(today()).toBe('2026-04-09')
    vi.useRealTimers()
  })
})
