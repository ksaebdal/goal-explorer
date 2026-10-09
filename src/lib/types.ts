// The shape of one shot in our generated data files (goals.json and shots/*.json).
// We keep it mostly "flat" so it is easy to filter and display.
export interface Shot {
  id: string
  matchId: number
  competition: string
  country: string
  season: string
  matchDate: string
  stadium: string | null
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  team: string
  player: string
  /** StatsBomb's id for the player; null in the rare case the data has no player. */
  playerId: number | null
  period: number
  minute: number
  second: number
  /** Where the shot was taken, in StatsBomb pitch coordinates (0-120, 0-80). */
  x: number
  y: number
  /** Distance from the shot location to the centre of the goal, in metres. */
  distanceMeters: number
  /** How wide the goal looked from the shot location, in degrees (see geometry.ts). */
  goalMouthAngle: number
  /** Direction relative to straight-on, in degrees: 0 = in front of goal, 90 = from the byline. */
  angleFromCentre: number
  /** "Goal", or how it was missed: "Saved", "Blocked", "Off T", "Wayward", "Post", ... */
  outcome: string
  bodyPart: string
  shotType: string
  technique: string
  playPattern: string
  xg: number | null
  /**
   * The pass that set up the shot (for a goal: the assist; for a miss: the "key pass"),
   * or null (e.g. direct free kicks, penalties, solo efforts).
   */
  assist: Assist | null
}

export interface Assist {
  player: string
  playerId: number | null
  /** Where the pass started and where it arrived, in pitch coordinates. */
  fromX: number
  fromY: number
  toX: number
  toY: number
  /** e.g. "Cross", "Through Ball", "Cut-back", "Corner" or "Pass". */
  kind: string
  /** "Ground Pass", "Low Pass" or "High Pass". */
  height: string
}

// --- The subset of the raw StatsBomb data that we actually read. ---

export interface RawMatch {
  match_id: number
  match_date: string
  competition: { competition_name: string; country_name: string }
  season: { season_name: string }
  home_team: { home_team_id: number; home_team_name: string }
  away_team: { away_team_id: number; away_team_name: string }
  home_score: number
  away_score: number
  stadium?: { name: string } | null
}

interface Named {
  name: string
}

interface NamedWithId extends Named {
  id: number
}

export interface RawEvent {
  id: string
  period: number
  minute: number
  second: number
  type: Named
  team: NamedWithId
  player?: NamedWithId
  location?: [number, number]
  play_pattern: Named
  shot?: {
    outcome: Named
    body_part: Named
    type: Named
    technique: Named
    statsbomb_xg?: number
    /** Id of the pass that led to this shot, if any. */
    key_pass_id?: string
  }
  pass?: {
    end_location: [number, number]
    height: Named
    type?: Named // set-piece passes: "Corner", "Free Kick", "Throw-in", ...
    technique?: Named // older data marks through balls here
    cross?: boolean
    cut_back?: boolean
    through_ball?: boolean
  }
}
