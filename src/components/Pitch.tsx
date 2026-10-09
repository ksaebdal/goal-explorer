import { memo, useId, type ReactNode } from 'react'
import { GOAL_CENTER, PITCH_LENGTH, PITCH_WIDTH } from '../lib/geometry.ts'
import { outcomeGroup, outcomeLabel } from '../lib/outcomes.ts'
import type { Shot } from '../lib/types.ts'

interface PitchProps {
  goals: Shot[]
  /** Missed shots to show (empty when they are switched off). */
  misses: Shot[]
  selected: Shot | undefined
  onSelect: (shot: Shot) => void
  /** The legend shown under the pitch. */
  children: ReactNode
}

// The SVG uses the same coordinate system as StatsBomb (120 x 80), so a
// shot at location [108, 40] is simply drawn at x=108, y=40. No maths needed!
export function Pitch({ goals, misses, selected, onSelect, children }: PitchProps) {
  // SVG ids are global to the whole page; useId() makes ours unique.
  const arrowId = useId()
  return (
    <figure className="pitch-figure">
      <svg
        className="pitch"
        viewBox={`-2 -2 ${PITCH_LENGTH + 4} ${PITCH_WIDTH + 4}`}
        role="img"
        aria-label="Football pitch with shot locations. Use the table below to select shots with the keyboard."
      >
        <defs>
          {/* An arrowhead that lines can use via markerEnd. */}
          <marker id={arrowId} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={4} markerHeight={4} orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" className="assist-arrowhead" />
          </marker>
        </defs>
        <PitchMarkings />
        {/* Misses first, so goals are drawn on top of them. */}
        <ShotDots shots={misses} onSelect={onSelect} />
        <ShotDots shots={goals} onSelect={onSelect} />

        {/* The selected shot is drawn on top. pointer-events="none" lets clicks pass through to the dots below. */}
        {selected && (
          <g pointerEvents="none">
            {selected.assist && (
              <circle className="assist-start" cx={selected.assist.fromX} cy={selected.assist.fromY} r={0.9} />
            )}
            <line className="shot-line" x1={selected.x} y1={selected.y} x2={GOAL_CENTER.x} y2={GOAL_CENTER.y} />
            <circle className={`shot-dot ${dotClass(selected)} selected`} cx={selected.x} cy={selected.y} r={1.6} />
            {/* Drawn after the selected dot so a tap-in's arrowhead isn't hidden under it (later = on top). */}
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
      <figcaption className="legend">{children}</figcaption>
    </figure>
  )
}

/** CSS class for a shot's colour: "goal", "saved" or "missed". */
function dotClass(shot: Shot): string {
  return outcomeGroup(shot.outcome).toLowerCase()
}

// memo() makes React skip redrawing all the dots unless `shots` or `onSelect`
// actually changed. Selecting a shot only redraws the small overlay above.
const ShotDots = memo(function ShotDots({ shots, onSelect }: { shots: Shot[]; onSelect: (shot: Shot) => void }) {
  return (
    <g>
      {shots.map((s) => (
        <circle
          key={s.id}
          className={`shot-dot ${dotClass(s)}`}
          cx={s.x}
          cy={s.y}
          r={s.outcome === 'Goal' ? 0.9 : 0.7}
          onClick={() => onSelect(s)}
        >
          <title>{`${s.player} (${s.team}) – ${outcomeLabel(s.outcome)}, ${s.distanceMeters} m`}</title>
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
