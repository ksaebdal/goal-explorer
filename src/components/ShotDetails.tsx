import { outcomeLabel } from '../lib/outcomes.ts'
import type { Shot } from '../lib/types.ts'

export function ShotDetails({ shot }: { shot: Shot | undefined }) {
  // aria-live makes screen readers announce the new shot when the selection changes.
  if (!shot)
    return (
      <aside className="details muted" aria-live="polite">
        Click a dot or a row to see the shot.
      </aside>
    )

  const isGoal = shot.outcome === 'Goal'
  return (
    <aside className="details" aria-live="polite">
      <h2>{shot.player}</h2>
      <p className="muted">
        {shot.team}, {shot.minute}' · <strong className="outcome">{isGoal ? 'Goal' : outcomeLabel(shot.outcome)}</strong>
      </p>
      <dl>
        <dt>Match</dt>
        <dd>
          {shot.homeTeam} {shot.homeScore}–{shot.awayScore} {shot.awayTeam}
        </dd>
        <dt>League</dt>
        <dd>
          {shot.competition} ({shot.country}), {shot.season}
        </dd>
        <dt>Date</dt>
        <dd>{shot.matchDate}</dd>
        <dt>Arena</dt>
        <dd>{shot.stadium ?? 'Unknown'}</dd>
        <dt>Distance</dt>
        <dd>{shot.distanceMeters} m</dd>
        <dt>Goal-mouth angle</dt>
        <dd>
          {shot.goalMouthAngle}° <span className="muted">(how wide the goal looked)</span>
        </dd>
        <dt>Angle</dt>
        <dd>
          {shot.angleFromCentre}° <span className="muted">from straight on</span>
        </dd>
        <dt>Shot</dt>
        <dd>
          {shot.shotType}, {shot.bodyPart}, {shot.technique}
        </dd>
        {/* Only a pass that led to a goal is an "assist"; for a miss it's called a "key pass". */}
        <dt>{isGoal ? 'Assist' : 'Key pass'}</dt>
        <dd>
          {shot.assist ? (
            <>
              {shot.assist.player}
              <span className="muted">
                {' '}
                ({shot.assist.kind}, {shot.assist.height.toLowerCase()})
              </span>
            </>
          ) : (
            <span className="muted">None</span>
          )}
        </dd>
        <dt>Situation</dt>
        <dd>{shot.playPattern}</dd>
        <dt>xG</dt>
        <dd>{shot.xg ?? '–'}</dd>
      </dl>
    </aside>
  )
}
