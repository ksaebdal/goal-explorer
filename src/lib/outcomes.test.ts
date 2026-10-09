import { describe, expect, it } from 'vitest'
import { countByGroup, outcomeGroup, outcomeLabel } from './outcomes.ts'
import type { Shot } from './types.ts'

describe('outcomeGroup', () => {
  it.each([
    ['Goal', 'Goal'],
    ['Saved', 'Saved'],
    ['Saved Off Target', 'Saved'],
    ['Saved to Post', 'Saved'],
    ['Off T', 'Missed'],
    ['Wayward', 'Missed'],
    ['Blocked', 'Missed'],
    ['Post', 'Missed'],
  ])('puts "%s" in group "%s"', (outcome, group) => {
    expect(outcomeGroup(outcome)).toBe(group)
  })
})

describe('outcomeLabel', () => {
  it('spells out the abbreviated outcomes', () => {
    expect(outcomeLabel('Off T')).toBe('Off target')
  })

  it('leaves the others as they are', () => {
    expect(outcomeLabel('Blocked')).toBe('Blocked')
  })
})

describe('countByGroup', () => {
  const shot = (outcome: string) => ({ outcome }) as Shot

  it('counts goals and, when loaded, saved and missed shots', () => {
    const misses = [shot('Saved'), shot('Saved to Post'), shot('Blocked'), shot('Off T'), shot('Post')]
    expect(countByGroup([shot('Goal'), shot('Goal')], misses)).toEqual({ Goal: 2, Saved: 2, Missed: 3 })
  })

  it('leaves Saved and Missed out when the misses are not loaded', () => {
    expect(countByGroup([shot('Goal')], null)).toEqual({ Goal: 1 })
  })

  it('shows 0 (not "missing") for groups with no shots once misses are loaded', () => {
    expect(countByGroup([], [])).toEqual({ Goal: 0, Saved: 0, Missed: 0 })
  })
})
