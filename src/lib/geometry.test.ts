import { describe, expect, it } from 'vitest'
import { distanceToGoalMeters } from './geometry.ts'

describe('distanceToGoalMeters', () => {
  it('is 0 on the goal line in the middle of the goal', () => {
    expect(distanceToGoalMeters(120, 40)).toBe(0)
  })

  it('is 11 m from the penalty spot (12 yards)', () => {
    // 12 yards * 0.9144 = 10.97 m, rounded to 11.0
    expect(distanceToGoalMeters(108, 40)).toBe(11)
  })

  it('uses straight-line distance for shots from an angle', () => {
    // 3-4-5 triangle: 30 yards along, 40 yards across = 50 yards = 45.72 m
    expect(distanceToGoalMeters(90, 0)).toBe(45.7)
  })
})
