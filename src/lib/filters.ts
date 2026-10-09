import type { Shot } from './types.ts'

export interface GoalFilters {
  competition: string // '' means "all"
  season: string
  team: string
  /** Free-text search, matches any part of a name ("Pedro" matches "Pedro Neto"). */
  playerSearch: string
  /** One exact player, e.g. after clicking a name in "Top scorers". */
  player: string
}

export const EMPTY_FILTERS: GoalFilters = {
  competition: '',
  season: '',
  team: '',
  playerSearch: '',
  player: '',
}

export function filterShots(goals: Shot[], filters: GoalFilters): Shot[] {
  const search = filters.playerSearch.trim().toLowerCase()
  return goals.filter(
    (g) =>
      (!filters.competition || g.competition === filters.competition) &&
      (!filters.season || g.season === filters.season) &&
      (!filters.team || g.team === filters.team) &&
      (!filters.player || g.player === filters.player) &&
      (!search || g.player.toLowerCase().includes(search)),
  )
}

/** Sorted list of the distinct values of one field, e.g. all team names. */
export function uniqueValues(goals: Shot[], field: 'competition' | 'season' | 'team'): string[] {
  return [...new Set(goals.map((g) => g[field]))].sort((a, b) => a.localeCompare(b))
}

/**
 * The choices each dropdown should offer. Each one only lists values that
 * exist given the choices above it (league → season → team).
 */
export function availableOptions(goals: Shot[], filters: GoalFilters) {
  const inCompetition = filterShots(goals, { ...EMPTY_FILTERS, competition: filters.competition })
  const inSeason = filterShots(inCompetition, { ...EMPTY_FILTERS, season: filters.season })
  return {
    competitions: uniqueValues(goals, 'competition'),
    seasons: uniqueValues(inCompetition, 'season'),
    teams: uniqueValues(inSeason, 'team'),
  }
}
