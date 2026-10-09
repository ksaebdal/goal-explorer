import type { Shot } from './types.ts'

/** Newest match first; within a match, in the order the shots were taken. Use with Array.sort. */
export function compareShots(a: Shot, b: Shot): number {
  // ISO dates ("2015-05-23") sort correctly as plain strings - much faster than localeCompare.
  const newerFirst = a.matchDate < b.matchDate ? 1 : a.matchDate > b.matchDate ? -1 : 0
  return (
    newerFirst ||
    a.matchId - b.matchId ||
    a.period - b.period ||
    a.minute - b.minute ||
    a.second - b.second
  )
}
