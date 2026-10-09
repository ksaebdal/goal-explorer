import { memo, useId } from 'react'
import { GOAL_CENTER, PITCH_LENGTH, PITCH_WIDTH } from '../lib/geometry.ts'
import type { Goal } from '../lib/types.ts'

interface PitchProps {
  goals: Goal[]
  selected: Goal | undefined
  onSelect: (goal: Goal) => void
}

// The SVG uses the same coordinate system as StatsBomb (120 x 80), so a
// goal at location [108, 40] is simply drawn at x=108, y=40. No maths needed!
export function Pitch({ goals, selected, onSelect }: PitchProps) {
  // SVG ids are global to the whole page; useId() makes ours unique.
  const arrowId = useId()
  return (
    <figure className="pitch-figure">
      <svg
        className="pitch"
        viewBox={`-2 -2 ${PITCH_LENGTH + 4} ${PITCH_WIDTH + 4}`}
        role="img"
        aria-label="Football pitch with goal locations. Use the table below to select goals with the keyboard."
      >
        <defs>
          {/* An arrowhead that lines can use via markerEnd. */}
          <marker id={arrowId} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="assist-arrowhead" />
          </marker>
        </defs>
        <PitchMarkings />
        <GoalDots goals={goals} onSelect={onSelect} />

        {/* The selected goal is drawn on top. pointer-events="none" lets clicks pass through to the dots below. */}
        {selected && (
          <g pointerEvents="none">
            {selected.assist && (
              <circle className="assist-start" cx={selected.assist.fromX} cy={selected.assist.fromY} r={0.9} />
            )}
            <line className="shot-line" x1={selected.x} y1={selected.y} x2={GOAL_CENTER.x} y2={GOAL_CENTER.y} />
            <circle className="goal-dot selected" cx={selected.x} cy={selected.y} r={1.6} />
            {/* Drawn after the red dot so a tap-in's arrowhead isn't hidden under it (later = on top). */}
            {selected.assist && (
              <line
                className="assist-line"
                x1={selected.assist.fromX}
                y1={selected.assist.fromY}
                x2={selected.assist.toX}
                y2={selected.assist.toY}
                markerEnd={`url(#${arrowId})`}
              />
            )}
          </g>
        )}
      </svg>
      <figcaption className="legend">
        <span><i className="swatch goal" /> Goal</span>
        <span><i className="swatch selected" /> Selected goal</span>
        <span><i className="swatch assist" /> Assist (pass)</span>
      </figcaption>
    </figure>
  )
}

// memo() makes React skip redrawing all the dots unless `goals` or `onSelect`
// actually changed. Selecting a goal only redraws the small overlay above.
const GoalDots = memo(function GoalDots({ goals, onSelect }: Omit<PitchProps, 'selected'>) {
  return (
    <g>
      {goals.map((g) => (
        <circle key={g.id} className="goal-dot" cx={g.x} cy={g.y} r={0.9} onClick={() => onSelect(g)}>
          <title>{`${g.player} (${g.team}) – ${g.distanceMeters} m`}</title>
        </circle>
      ))}
    </g>
  )
})

/** The white lines. Measurements are in yards, like the StatsBomb data. */
function PitchMarkings() {
  return (
    <g className="markings">
      <rect x={0} y={0} width={PITCH_LENGTH} height={PITCH_WIDTH} />
      <line x1={60} y1={0} x2={60} y2={PITCH_WIDTH} />
      <circle cx={60} cy={40} r={10} />
      <circle cx={60} cy={40} r={0.4} className="spot" />
      <PenaltyArea side="left" />
      <PenaltyArea side="right" />
    </g>
  )
}

function PenaltyArea({ side }: { side: 'left' | 'right' }) {
  // Draw the left side, and mirror x for the right side.
  const mx = (x: number) => (side === 'left' ? x : PITCH_LENGTH - x)
  return (
    <>
      <rect x={Math.min(mx(0), mx(18))} y={18} width={18} height={44} />
      <rect x={Math.min(mx(0), mx(6))} y={30} width={6} height={20} />
      <circle cx={mx(12)} cy={40} r={0.4} className="spot" />
      {/* The "D": part of a 10-yard circle around the penalty spot, outside the box. */}
      <path d={`M ${mx(18)} 32 A 10 10 0 0 ${side === 'left' ? 1 : 0} ${mx(18)} 48`} />
      {/* The goal itself (8 yards wide), drawn just behind the line. */}
      <rect x={Math.min(mx(0), mx(-1.5))} y={36} width={1.5} height={8} className="goal" />
    </>
  )
}
