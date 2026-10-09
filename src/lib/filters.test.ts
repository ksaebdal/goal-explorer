import { describe, expect, it } from 'vitest'
import { availableOptions, EMPTY_FILTERS, filterShots, uniqueValues } from './filters.ts'
import type { Shot } from './types.ts'

function goal(overrides: Partial<Shot>): Shot {
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
    playerId: 1,
    period: 1,
    minute: 1,
    second: 0,
    x: 110,
    y: 40,
    distanceMeters: 9.1,
    goalMouthAngle: 40,
    angleFromCentre: 10,
    outcome: 'Goal',
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

const ids = (list: Shot[]) => list.map((g) => g.id)

describe('filterShots', () => {
  it('returns everything when no filter is set', () => {
    expect(ids(filterShots(goals, EMPTY_FILTERS))).toEqual(['a', 'b', 'c'])
  })

  it('combines competition and season filters', () => {
    const result = filterShots(goals, { ...EMPTY_FILTERS, competition: 'La Liga', season: '2016/2017' })
    expect(ids(result)).toEqual(['b'])
  })

  it('filters by team', () => {
    expect(ids(filterShots(goals, { ...EMPTY_FILTERS, team: 'Arsenal' }))).toEqual(['c'])
  })

  it('treats a search of only spaces as no search', () => {
    expect(ids(filterShots(goals, { ...EMPTY_FILTERS, playerSearch: '   ' }))).toEqual(['a', 'b', 'c'])
  })

  it('searches player names case-insensitively, ignoring surrounding spaces', () => {
    expect(ids(filterShots(goals, { ...EMPTY_FILTERS, playerSearch: '  HENRY ' }))).toEqual(['c'])
  })
})

describe('filterShots – exact player', () => {
  const pedros = [goal({ id: 'p', player: 'Pedro' }), goal({ id: 'n', player: 'Pedro Neto' })]

  it('matches only that exact name (unlike the free-text search)', () => {
    expect(ids(filterShots(pedros, { ...EMPTY_FILTERS, player: 'Pedro' }))).toEqual(['p'])
    expect(ids(filterShots(pedros, { ...EMPTY_FILTERS, playerSearch: 'Pedro' }))).toEqual(['p', 'n'])
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
