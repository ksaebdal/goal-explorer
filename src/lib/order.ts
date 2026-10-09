import type { Shot } from './types.ts'

/** Newest match first; within a match, in the order the shots were taken. Use with Array.sort. */
export function compareShots(a: Shot, b: Shot): number {
  return (
    b.matchDate.localeCompare(a.matchDate) ||
    a.matchId - b.matchId ||
    a.period - b.period ||
    a.minute - b.minute ||
    a.second - b.second
  )
}
