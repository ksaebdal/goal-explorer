import type { Assist, Goal } from './types.ts'

export interface Count {
  label: string
  count: number
}

export interface Summary {
  goals: number
  /** How many different players scored. */
  scorers: number
  /** Averages and shares are null when there are no goals (avoids dividing by zero). */
  averageDistanceMeters: number | null
  assistedShare: number | null
  headerShare: number | null
}

export function summarize(goals: Goal[]): Summary {
  const n = goals.length
  if (n === 0) return { goals: 0, scorers: 0, averageDistanceMeters: null, assistedShare: null, headerShare: null }
  const totalDistance = goals.reduce((sum, g) => sum + g.distanceMeters, 0)
  return {
    goals: n,
    scorers: new Set(goals.map((g) => g.player)).size,
    averageDistanceMeters: Math.round((totalDistance / n) * 10) / 10,
    assistedShare: goals.filter((g) => g.assist).length / n,
    headerShare: goals.filter((g) => g.bodyPart === 'Head').length / n,
  }
}

/** Counts how often each value occurs; biggest first, ties alphabetically. Returns at most `limit`. */
export function topCounts(values: string[], limit: number): Count[] {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return [...counts]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit)
}

/**
 * Groups goals into distance bands (in metres): "0–5", "5–10", ... and a last
 * open band ("30+"). Every band is returned, even empty ones, so the chart keeps its shape.
 */
export function distanceBands(goals: Goal[], bandSize = 5, lastBandStart = 30): Count[] {
  const bandCount = lastBandStart / bandSize + 1
  const counts = new Array<number>(bandCount).fill(0)
  for (const g of goals) counts[Math.min(Math.floor(g.distanceMeters / bandSize), bandCount - 1)]++
  return counts.map((count, i) => ({
    label: i === bandCount - 1 ? `${lastBandStart}+` : `${i * bandSize}–${(i + 1) * bandSize}`,
    count,
  }))
}

/** The assists of the goals that have one (goals without an assist are skipped). */
export function assistsOf(goals: Goal[]): Assist[] {
  return goals.flatMap((g) => (g.assist ? [g.assist] : []))
}
