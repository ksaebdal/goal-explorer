import { describe, expect, it } from 'vitest'
import { angleFromCentreDegrees, distanceToGoalMeters, goalMouthAngleDegrees } from './geometry.ts'

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

describe('goalMouthAngleDegrees', () => {
  it('is about 37° from the penalty spot', () => {
    // 2 × atan(4 / 12) = 36.87°
    expect(goalMouthAngleDegrees(108, 40)).toBe(36.9)
  })

  it('is 180° on the goal line between the posts', () => {
    expect(goalMouthAngleDegrees(120, 40)).toBe(180)
  })

  it('is 0° on the goal line outside the posts (both posts in a straight line)', () => {
    expect(goalMouthAngleDegrees(120, 30)).toBe(0)
  })

  it('is the same on both sides of the pitch (symmetry)', () => {
    expect(goalMouthAngleDegrees(110, 25)).toBe(goalMouthAngleDegrees(110, 55))
  })

  it('gets smaller further away', () => {
    expect(goalMouthAngleDegrees(90, 40)).toBeLessThan(goalMouthAngleDegrees(108, 40))
  })

  it('stays sensible for the few shots recorded just behind the goal line', () => {
    expect(goalMouthAngleDegrees(120.1, 40)).toBeGreaterThan(170)
  })

  it('does not crash when standing exactly on a post', () => {
    expect(goalMouthAngleDegrees(120, 36)).toBe(180)
  })
})

describe('angleFromCentreDegrees', () => {
  it('is 0° straight in front of goal', () => {
    expect(angleFromCentreDegrees(108, 40)).toBe(0)
  })

  it('is 45° on the diagonal', () => {
    expect(angleFromCentreDegrees(110, 30)).toBe(45)
  })

  it('never goes past 90°, even for shots recorded just behind the goal line', () => {
    expect(angleFromCentreDegrees(120.1, 41)).toBe(90)
  })

  it('is 90° from the byline, on either side', () => {
    expect(angleFromCentreDegrees(120, 10)).toBe(90)
    expect(angleFromCentreDegrees(120, 70)).toBe(90)
  })
})
