// StatsBomb pitch: 120 x 80 yards. Every event is recorded as if the team
// with the ball attacks from left to right, so the goal being shot at is
// always on the right edge (x = 120), centred at y = 40.
export const PITCH_LENGTH = 120
export const PITCH_WIDTH = 80
export const GOAL_CENTER = { x: PITCH_LENGTH, y: PITCH_WIDTH / 2 }

const METERS_PER_YARD = 0.9144

/** Straight-line distance from (x, y) to the centre of the goal, in metres, rounded to 0.1. */
export function distanceToGoalMeters(x: number, y: number): number {
  const yards = Math.hypot(GOAL_CENTER.x - x, GOAL_CENTER.y - y)
  return Math.round(yards * METERS_PER_YARD * 10) / 10
}
