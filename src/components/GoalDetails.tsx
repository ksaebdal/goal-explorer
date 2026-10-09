import type { Goal } from '../lib/types.ts'

export function GoalDetails({ goal }: { goal: Goal | undefined }) {
  // aria-live makes screen readers announce the new goal when the selection changes.
  if (!goal)
    return (
      <aside className="details muted" aria-live="polite">
        Click a dot or a row to see the goal.
      </aside>
    )

  return (
    <aside className="details" aria-live="polite">
      <h2>{goal.player}</h2>
      <p className="muted">
        {goal.team}, {goal.minute}'
      </p>
      <dl>
        <dt>Match</dt>
        <dd>
          {goal.homeTeam} {goal.homeScore}–{goal.awayScore} {goal.awayTeam}
        </dd>
        <dt>League</dt>
        <dd>
          {goal.competition} ({goal.country}), {goal.season}
        </dd>
        <dt>Date</dt>
        <dd>{goal.matchDate}</dd>
        <dt>Arena</dt>
        <dd>{goal.stadium ?? 'Unknown'}</dd>
        <dt>Distance</dt>
        <dd>{goal.distanceMeters} m</dd>
        <dt>Shot</dt>
        <dd>
          {goal.shotType}, {goal.bodyPart}, {goal.technique}
        </dd>
        <dt>Situation</dt>
        <dd>{goal.playPattern}</dd>
        <dt>xG</dt>
        <dd>{goal.xg ?? '–'}</dd>
      </dl>
    </aside>
  )
}
