import { describe, expect, it } from 'vitest'
import { availableOptions, EMPTY_FILTERS, filterGoals, uniqueValues } from './filters.ts'
import type { Goal } from './types.ts'

function goal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g',
    matchId: 1,
    competition: 'La Liga',
    country: 'Spain',
    season: '2015/2016',
    matchDate: '2016-01-01',
    stadium: null,
    homeTeam: 'Barcelona',
    awayTeam: 'Real Madrid',
    homeScore: 1,
    awayScore: 0,
    team: 'Barcelona',
    player: 'Lionel Messi',
    period: 1,
    minute: 1,
    second: 0,
    x: 110,
    y: 40,
    distanceMeters: 9.1,
    bodyPart: 'Left Foot',
    shotType: 'Open Play',
    technique: 'Normal',
    playPattern: 'Regular Play',
    xg: 0.3,
    assist: null,
    ...overrides,
  }
}

const goals = [
  goal({ id: 'a' }),
  goal({ id: 'b', season: '2016/2017' }),
  goal({ id: 'c', competition: 'Premier League', team: 'Arsenal', player: 'Thierry Henry' }),
]

const ids = (list: Goal[]) => list.map((g) => g.id)

describe('filterGoals', () => {
  it('returns everything when no filter is set', () => {
    expect(ids(filterGoals(goals, EMPTY_FILTERS))).toEqual(['a', 'b', 'c'])
  })

  it('combines competition and season filters', () => {
    const result = filterGoals(goals, { ...EMPTY_FILTERS, competition: 'La Liga', season: '2016/2017' })
    expect(ids(result)).toEqual(['b'])
  })

  it('filters by team', () => {
    expect(ids(filterGoals(goals, { ...EMPTY_FILTERS, team: 'Arsenal' }))).toEqual(['c'])
  })

  it('treats a search of only spaces as no search', () => {
    expect(ids(filterGoals(goals, { ...EMPTY_FILTERS, playerSearch: '   ' }))).toEqual(['a', 'b', 'c'])
  })

  it('searches player names case-insensitively, ignoring surrounding spaces', () => {
    expect(ids(filterGoals(goals, { ...EMPTY_FILTERS, playerSearch: '  HENRY ' }))).toEqual(['c'])
  })
})

describe('uniqueValues', () => {
  it('returns each value once, sorted', () => {
    expect(uniqueValues(goals, 'competition')).toEqual(['La Liga', 'Premier League'])
  })
})

describe('availableOptions', () => {
  it('offers everything when nothing is chosen', () => {
    expect(availableOptions(goals, EMPTY_FILTERS)).toEqual({
      competitions: ['La Liga', 'Premier League'],
      seasons: ['2015/2016', '2016/2017'],
      teams: ['Arsenal', 'Barcelona'],
    })
  })

  it('narrows seasons and teams to the chosen league', () => {
    const options = availableOptions(goals, { ...EMPTY_FILTERS, competition: 'Premier League' })
    expect(options.competitions).toEqual(['La Liga', 'Premier League']) // league list never narrows
    expect(options.seasons).toEqual(['2015/2016'])
    expect(options.teams).toEqual(['Arsenal'])
  })

  it('narrows teams to the chosen league and season', () => {
    const options = availableOptions(goals, { ...EMPTY_FILTERS, competition: 'La Liga', season: '2016/2017' })
    expect(options.teams).toEqual(['Barcelona'])
  })
})
