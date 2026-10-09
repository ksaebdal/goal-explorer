import type { Shot } from './types.ts'

// The raw data sometimes names one player in two ways ("Phil Foden" and
// "Philip Foden", or a new surname after marriage), and two different players
// can share a name. The app groups and filters by name, so we fix names once,
// here, so that one name always means exactly one player:
//   1. each player id gets the name from its most recent match;
//   2. if two ids still end up with the same name, the id is added to tell them apart.

interface NameSighting {
  id: number
  name: string
  matchDate: string
}

/** Returns the goals with scorer and assister names made consistent (see above). */
export function normalizePlayerNames(goals: Shot[]): Shot[] {
  const sightings: NameSighting[] = goals.flatMap((g) => [
    ...(g.playerId === null ? [] : [{ id: g.playerId, name: g.player, matchDate: g.matchDate }]),
    ...(g.assist === null || g.assist.playerId === null
      ? []
      : [{ id: g.assist.playerId, name: g.assist.player, matchDate: g.matchDate }]),
  ])

  // 1. Latest name per id. (ISO dates like "2024-04-06" compare correctly as strings.)
  //    Two names on the same date? Pick alphabetically, so the result never depends on
  //    the order the files happened to be read in.
  const latest = new Map<number, NameSighting>()
  for (const s of sightings) {
    const current = latest.get(s.id)
    const isNewer =
      !current || s.matchDate > current.matchDate || (s.matchDate === current.matchDate && s.name < current.name)
    if (isNewer) latest.set(s.id, s)
  }

  // 2. Which names are used by more than one id?
  const idsPerName = new Map<string, number>()
  for (const { name } of latest.values()) idsPerName.set(name, (idsPerName.get(name) ?? 0) + 1)

  const finalName = (id: number | null, fallback: string): string => {
    if (id === null) return fallback
    const name = latest.get(id)!.name
    return idsPerName.get(name)! > 1 ? `${name} (id ${id})` : name
  }

  return goals.map((g) => ({
    ...g,
    player: finalName(g.playerId, g.player),
    assist: g.assist && { ...g.assist, player: finalName(g.assist.playerId, g.assist.player) },
  }))
}
