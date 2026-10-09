import { angleFromCentreDegrees, distanceToGoalMeters, goalMouthAngleDegrees } from './geometry.ts'
import type { Assist, Shot, RawEvent, RawMatch } from './types.ts'

// Period 5 is the penalty shootout. Those shots don't count in the score,
// so we leave them out.
const PENALTY_SHOOTOUT_PERIOD = 5

// The match file and the events file sometimes spell a team differently
// (e.g. "Stade Malherbe Caen" vs "Caen"). Ids are stable, so we match on the
// id and use the match file's name, keeping it consistent with homeTeam/awayTeam.
function teamName(match: RawMatch, team: { id: number; name: string }): string {
  if (team.id === match.home_team.home_team_id) return match.home_team.home_team_name
  if (team.id === match.away_team.away_team_id) return match.away_team.away_team_name
  return team.name
}

const SET_PIECES = new Set(['Corner', 'Free Kick', 'Throw-in', 'Goal Kick', 'Kick Off'])

/** Describes what kind of pass an assist was, most specific first. */
function assistKind(pass: NonNullable<RawEvent['pass']>): string {
  if (pass.type && SET_PIECES.has(pass.type.name)) return pass.type.name
  if (pass.cut_back) return 'Cut-back'
  if (pass.cross) return 'Cross'
  if (pass.through_ball || pass.technique?.name === 'Through Ball') return 'Through Ball'
  return 'Pass'
}

/** Finds the pass that set up a shot, using the shot's key_pass_id. */
function findAssist(shot: RawEvent, eventsById: Map<string, RawEvent>): Assist | null {
  const keyPassId = shot.shot?.key_pass_id
  const pass = keyPassId ? eventsById.get(keyPassId) : undefined
  if (!pass?.pass || !pass.location) return null
  return {
    player: pass.player?.name ?? 'Unknown',
    playerId: pass.player?.id ?? null,
    fromX: pass.location[0],
    fromY: pass.location[1],
    toX: pass.pass.end_location[0],
    toY: pass.pass.end_location[1],
    kind: assistKind(pass.pass),
    height: pass.pass.height.name,
  }
}

/** Turns one match + its events into a list of all its shots (goals and misses). */
export function extractShots(match: RawMatch, events: RawEvent[]): Shot[] {
  // A Map gives fast lookup by id. Searching the ~3500-event array for every goal would be slower.
  const eventsById = new Map(events.map((e) => [e.id, e]))
  return events
    .filter(
      (e) =>
        e.type.name === 'Shot' &&
        e.shot !== undefined &&
        e.period !== PENALTY_SHOOTOUT_PERIOD &&
        e.location !== undefined,
    )
    .map((e) => {
      // The filter above guarantees these exist; `!` tells TypeScript so.
      const shot = e.shot!
      const [x, y] = e.location!
      return {
        id: e.id,
        matchId: match.match_id,
        competition: match.competition.competition_name,
        country: match.competition.country_name,
        season: match.season.season_name,
        matchDate: match.match_date,
        stadium: match.stadium?.name ?? null,
        homeTeam: match.home_team.home_team_name,
        awayTeam: match.away_team.away_team_name,
        homeScore: match.home_score,
        awayScore: match.away_score,
        team: teamName(match, e.team),
        player: e.player?.name ?? 'Unknown',
        playerId: e.player?.id ?? null,
        period: e.period,
        minute: e.minute,
        second: e.second,
        x,
        y,
        distanceMeters: distanceToGoalMeters(x, y),
        goalMouthAngle: goalMouthAngleDegrees(x, y),
        angleFromCentre: angleFromCentreDegrees(x, y),
        outcome: shot.outcome.name,
        bodyPart: shot.body_part.name,
        shotType: shot.type.name,
        technique: shot.technique.name,
        playPattern: e.play_pattern.name,
        xg: shot.statsbomb_xg !== undefined ? Math.round(shot.statsbomb_xg * 1000) / 1000 : null,
        assist: findAssist(e, eventsById),
      }
    })
}
