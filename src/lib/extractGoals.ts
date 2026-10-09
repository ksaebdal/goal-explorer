import { distanceToGoalMeters } from './geometry.ts'
import type { Goal, RawEvent, RawMatch } from './types.ts'

// Period 5 is the penalty shootout. Those "goals" don't count in the score,
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

/** Turns one match + its events into a list of Goal objects. */
export function extractGoals(match: RawMatch, events: RawEvent[]): Goal[] {
  return events
    .filter(
      (e) =>
        e.type.name === 'Shot' &&
        e.shot?.outcome.name === 'Goal' &&
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
        period: e.period,
        minute: e.minute,
        second: e.second,
        x,
        y,
        distanceMeters: distanceToGoalMeters(x, y),
        bodyPart: shot.body_part.name,
        shotType: shot.type.name,
        technique: shot.technique.name,
        playPattern: e.play_pattern.name,
        xg: shot.statsbomb_xg !== undefined ? Math.round(shot.statsbomb_xg * 1000) / 1000 : null,
      }
    })
}
