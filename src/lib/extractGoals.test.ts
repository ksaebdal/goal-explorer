import { describe, expect, it } from 'vitest'
import { extractGoals } from './extractGoals.ts'
import type { RawEvent, RawMatch } from './types.ts'

const match: RawMatch = {
  match_id: 1,
  match_date: '2024-04-06',
  competition: { competition_name: '1. Bundesliga', country_name: 'Germany' },
  season: { season_name: '2023/2024' },
  home_team: { home_team_id: 10, home_team_name: 'Union Berlin' },
  away_team: { away_team_id: 20, away_team_name: 'Bayer Leverkusen' },
  home_score: 0,
  away_score: 1,
  stadium: { name: 'Stadion An der Alten Försterei' },
}

// Helper that builds a shot event; pass only what differs from the default.
function shot(overrides: Partial<RawEvent> = {}, outcome = 'Goal'): RawEvent {
  return {
    id: 'shot-1',
    period: 1,
    minute: 10,
    second: 5,
    type: { name: 'Shot' },
    team: { id: 20, name: 'Bayer Leverkusen' },
    player: { id: 8, name: 'Florian Wirtz' },
    location: [108, 40],
    play_pattern: { name: 'Regular Play' },
    shot: {
      outcome: { name: outcome },
      body_part: { name: 'Right Foot' },
      type: { name: 'Open Play' },
      technique: { name: 'Normal' },
      statsbomb_xg: 0.12345,
    },
    ...overrides,
  }
}

describe('extractGoals', () => {
  it('turns a goal-scoring shot into a Goal with match info', () => {
    const [goal] = extractGoals(match, [shot()])
    expect(goal).toEqual({
      id: 'shot-1',
      matchId: 1,
      competition: '1. Bundesliga',
      country: 'Germany',
      season: '2023/2024',
      matchDate: '2024-04-06',
      stadium: 'Stadion An der Alten Försterei',
      homeTeam: 'Union Berlin',
      awayTeam: 'Bayer Leverkusen',
      homeScore: 0,
      awayScore: 1,
      team: 'Bayer Leverkusen',
      player: 'Florian Wirtz',
      playerId: 8,
      period: 1,
      minute: 10,
      second: 5,
      x: 108,
      y: 40,
      distanceMeters: 11,
      bodyPart: 'Right Foot',
      shotType: 'Open Play',
      technique: 'Normal',
      playPattern: 'Regular Play',
      xg: 0.123,
      assist: null,
    })
  })

  it('ignores shots that did not go in', () => {
    expect(extractGoals(match, [shot({}, 'Saved'), shot({}, 'Off T')])).toEqual([])
  })

  it('ignores events that are not shots', () => {
    const pass = { ...shot(), type: { name: 'Pass' }, shot: undefined }
    expect(extractGoals(match, [pass])).toEqual([])
  })

  it('ignores penalty shootout goals (period 5)', () => {
    expect(extractGoals(match, [shot({ period: 5 })])).toEqual([])
  })

  it('handles a match without a known stadium', () => {
    const [goal] = extractGoals({ ...match, stadium: null }, [shot()])
    expect(goal.stadium).toBeNull()
  })

  it('keeps extra-time goals (periods 3 and 4)', () => {
    expect(extractGoals(match, [shot({ period: 3 }), shot({ period: 4 })])).toHaveLength(2)
  })

  it('ignores goals without a location (nothing to draw)', () => {
    expect(extractGoals(match, [shot({ location: undefined })])).toEqual([])
  })

  it('uses the team name from the match file, matched by team id', () => {
    // The events file calls the team "Leverkusen", the match file "Bayer Leverkusen".
    const [goal] = extractGoals(match, [shot({ team: { id: 20, name: 'Leverkusen' } })])
    expect(goal.team).toBe('Bayer Leverkusen')
  })

  it("keeps the events file's team name if the id matches neither team", () => {
    const [goal] = extractGoals(match, [shot({ team: { id: 99, name: 'Mystery FC' } })])
    expect(goal.team).toBe('Mystery FC')
  })

  it('falls back to defaults when player or xG is missing', () => {
    const base = shot()
    const [goal] = extractGoals(match, [
      { ...base, player: undefined, shot: { ...base.shot!, statsbomb_xg: undefined } },
    ])
    expect(goal.player).toBe('Unknown')
    expect(goal.playerId).toBeNull()
    expect(goal.xg).toBeNull()
  })
})

describe('extractGoals – assists', () => {
  // Helper that builds a pass event; `pass` fields override the defaults.
  function pass(fields: Partial<NonNullable<RawEvent['pass']>> = {}): RawEvent {
    return {
      id: 'pass-1',
      period: 1,
      minute: 10,
      second: 2,
      type: { name: 'Pass' },
      team: { id: 20, name: 'Bayer Leverkusen' },
      player: { id: 7, name: 'Alejandro Grimaldo' },
      location: [90, 70],
      play_pattern: { name: 'Regular Play' },
      pass: { end_location: [110, 42], height: { name: 'High Pass' }, ...fields },
    }
  }

  // A goal whose key_pass_id points at the pass above.
  function assistedGoal(): RawEvent {
    const base = shot()
    return { ...base, shot: { ...base.shot!, key_pass_id: 'pass-1' } }
  }

  it('finds the assisting pass through key_pass_id', () => {
    const [goal] = extractGoals(match, [pass({ cross: true }), assistedGoal()])
    expect(goal.assist).toEqual({
      player: 'Alejandro Grimaldo',
      playerId: 7,
      fromX: 90,
      fromY: 70,
      toX: 110,
      toY: 42,
      kind: 'Cross',
      height: 'High Pass',
    })
  })

  it('has no assist when the shot has no key pass (e.g. a solo goal)', () => {
    const [goal] = extractGoals(match, [pass(), shot()])
    expect(goal.assist).toBeNull()
  })

  it('has no assist when the key pass id points at something that is not a pass', () => {
    const notAPass = { ...pass(), type: { name: 'Carry' }, pass: undefined }
    const [goal] = extractGoals(match, [notAPass, assistedGoal()])
    expect(goal.assist).toBeNull()
  })

  it("names the assister 'Unknown' if the pass has no player", () => {
    const [goal] = extractGoals(match, [{ ...pass(), player: undefined }, assistedGoal()])
    expect(goal.assist?.player).toBe('Unknown')
  })

  it('has no assist when the key pass is missing from the events', () => {
    const [goal] = extractGoals(match, [assistedGoal()])
    expect(goal.assist).toBeNull()
  })

  it.each([
    [{}, 'Pass'],
    [{ cross: true }, 'Cross'],
    [{ cut_back: true }, 'Cut-back'],
    // Cut-backs are usually also flagged as crosses; the more specific label wins.
    [{ cut_back: true, cross: true }, 'Cut-back'],
    [{ through_ball: true }, 'Through Ball'],
    [{ technique: { name: 'Through Ball' } }, 'Through Ball'],
    // A set piece wins over "cross": a corner is more informative than "a cross".
    [{ type: { name: 'Corner' }, cross: true }, 'Corner'],
    // "Recovery" is a pass right after winning the ball - open play, not a set piece.
    [{ type: { name: 'Recovery' } }, 'Pass'],
  ])('labels pass %o as "%s"', (fields, kind) => {
    const [goal] = extractGoals(match, [pass(fields), assistedGoal()])
    expect(goal.assist?.kind).toBe(kind)
  })
})
