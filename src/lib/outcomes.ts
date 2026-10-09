// The raw data has 8 shot outcomes. A scatter of dots can only use about three
// colours that everyone (including colour-blind people) can tell apart, so we
// group them. The exact outcome is still shown in the details panel.

import type { Shot } from './types.ts'

export const OUTCOME_GROUPS = ['Goal', 'Saved', 'Missed'] as const
export type OutcomeGroup = (typeof OUTCOME_GROUPS)[number]

/** "Saved Off Target" → "Saved", "Blocked" → "Missed", ... */
export function outcomeGroup(outcome: string): OutcomeGroup {
  if (outcome === 'Goal') return 'Goal'
  if (outcome.startsWith('Saved')) return 'Saved' // Saved, Saved Off Target, Saved to Post
  return 'Missed' // Off T, Wayward, Blocked, Post
}

/** Human-friendly outcome text, e.g. "Off T" → "Off target". */
export function outcomeLabel(outcome: string): string {
  const labels: Record<string, string> = { 'Off T': 'Off target', 'Saved Off Target': 'Saved (off target)' }
  return labels[outcome] ?? outcome
}

/**
 * How many shots fall in each group, for the legend. Saved and Missed are only
 * counted when the misses are loaded (pass null otherwise), so the legend can leave them out.
 */
export function countByGroup(goals: Shot[], misses: Shot[] | null): Partial<Record<OutcomeGroup, number>> {
  const counts: Partial<Record<OutcomeGroup, number>> = { Goal: goals.length }
  if (misses === null) return counts
  counts.Saved = 0
  counts.Missed = 0
  for (const shot of misses) counts[outcomeGroup(shot.outcome)]!++
  return counts
}
