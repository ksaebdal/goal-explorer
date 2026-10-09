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

// The goalposts are 8 yards apart, centred on the goal.
export const GOAL_POSTS_Y = [GOAL_CENTER.y - 4, GOAL_CENTER.y + 4] as const

const toDegrees = (radians: number) => (radians * 180) / Math.PI
const roundTo1 = (n: number) => Math.round(n * 10) / 10

/**
 * How wide the goal looks from (x, y): the angle between the lines to the two
 * posts, in degrees. 180 = on the goal line between the posts, about 37 from the
 * penalty spot, near 0 from a tight angle by the byline. Bigger = easier.
 */
export function goalMouthAngleDegrees(x: number, y: number): number {
  // Two arrows from the shot to each post; the angle between two arrows comes from their dot product.
  const [ax, ay] = [GOAL_CENTER.x - x, GOAL_POSTS_Y[0] - y]
  const [bx, by] = [GOAL_CENTER.x - x, GOAL_POSTS_Y[1] - y]
  const lengths = Math.hypot(ax, ay) * Math.hypot(bx, by)
  if (lengths === 0) return 180 // standing exactly on a post
  const cosine = Math.min(1, Math.max(-1, (ax * bx + ay * by) / lengths)) // clamp tiny rounding errors
  return roundTo1(toDegrees(Math.acos(cosine)))
}

/** Direction of the shot relative to straight-on: 0 = right in front of goal, 90 = from the byline. */
export function angleFromCentreDegrees(x: number, y: number): number {
  // A few shots are recorded just behind the goal line (x > 120); treat them as on the line, so we never go past 90°.
  const towardsGoal = Math.max(0, GOAL_CENTER.x - x)
  return roundTo1(toDegrees(Math.atan2(Math.abs(y - GOAL_CENTER.y), towardsGoal)))
}
