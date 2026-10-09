import { describe, expect, it } from 'vitest'
import { assistsOf, distanceBands, summarize, topCounts } from './stats.ts'
import type { Assist, Goal } from './types.ts'

const anAssist: Assist = { player: 'X', playerId: 1, fromX: 0, fromY: 0, toX: 1, toY: 1, kind: 'Pass', height: 'Ground Pass' }

// Only the fields the stats look at matter; the rest are filled with dummies.
function goal(distanceMeters: number, bodyPart = 'Right Foot', assist: Assist | null = null, player = 'P'): Goal {
  return { distanceMeters, bodyPart, assist, player } as Goal
}

describe('summarize', () => {
  it('computes count, average distance and shares', () => {
    const goals = [
      goal(10, 'Head', anAssist, 'Haaland'),
      goal(20, 'Right Foot', null, 'Haaland'),
      goal(30, 'Head', null, 'Kane'),
      goal(15, 'Left Foot', anAssist, 'Salah'),
    ]
    expect(summarize(goals)).toEqual({
      goals: 4,
      scorers: 3,
      averageDistanceMeters: 18.8, // 75 / 4 = 18.75, rounded to one decimal
      assistedShare: 0.5,
      headerShare: 0.5,
    })
  })

  it('returns nulls instead of dividing by zero when there are no goals', () => {
    expect(summarize([])).toEqual({
      goals: 0,
      scorers: 0,
      averageDistanceMeters: null,
      assistedShare: null,
      headerShare: null,
    })
  })
})

describe('topCounts', () => {
  it('counts values, biggest first, ties sorted alphabetically', () => {
    expect(topCounts(['Messi', 'Suárez', 'Messi', 'Neymar', 'Suárez', 'Messi'], 10)).toEqual([
      { label: 'Messi', count: 3 },
      { label: 'Suárez', count: 2 },
      { label: 'Neymar', count: 1 },
    ])
  })

  it('sorts equal counts alphabetically', () => {
    expect(topCounts(['b', 'a', 'c', 'b', 'a'], 10).map((c) => c.label)).toEqual(['a', 'b', 'c'])
  })

  it('keeps only the top `limit` entries', () => {
    expect(topCounts(['a', 'b', 'b', 'c', 'c', 'c'], 2).map((c) => c.label)).toEqual(['c', 'b'])
  })

  it('returns an empty list for no values', () => {
    expect(topCounts([], 5)).toEqual([])
  })
})

describe('distanceBands', () => {
  it('puts each goal in its 5 m band, with an open last band', () => {
    const bands = distanceBands([goal(0), goal(4.9), goal(5), goal(29.9), goal(30), goal(55)])
    expect(bands).toEqual([
      { label: '0–5', count: 2 },
      { label: '5–10', count: 1 },
      { label: '10–15', count: 0 },
      { label: '15–20', count: 0 },
      { label: '20–25', count: 0 },
      { label: '25–30', count: 1 },
      { label: '30+', count: 2 },
    ])
  })

  it('returns every band, all zero, when there are no goals', () => {
    expect(distanceBands([]).every((b) => b.count === 0)).toBe(true)
    expect(distanceBands([])).toHaveLength(7)
  })
})

describe('assistsOf', () => {
  it('returns the assists and skips goals without one', () => {
    const other = { ...anAssist, player: 'Y' }
    expect(assistsOf([goal(10, 'Head', anAssist), goal(20), goal(5, 'Head', other)])).toEqual([anAssist, other])
  })
})
