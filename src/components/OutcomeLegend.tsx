import { OUTCOME_GROUPS, type OutcomeGroup } from '../lib/outcomes.ts'

interface OutcomeLegendProps {
  /** How many shots of each group match the filters. Groups that aren't loaded are left out. */
  counts: Partial<Record<OutcomeGroup, number>>
  hidden: ReadonlySet<OutcomeGroup>
  onToggle: (group: OutcomeGroup) => void
}

const GROUP_HINTS: Record<OutcomeGroup, string> = {
  Goal: 'Goal',
  Saved: 'Saved by the keeper',
  Missed: 'Off target, blocked or hit the post',
}

/** The legend under the pitch. Each outcome is also a button that shows or hides those dots. */
export function OutcomeLegend({ counts, hidden, onToggle }: OutcomeLegendProps) {
  return (
    <>
      {OUTCOME_GROUPS.filter((group) => counts[group] !== undefined).map((group) => (
        <button
          key={group}
          type="button"
          className="legend-toggle"
          aria-pressed={!hidden.has(group)}
          title={`${GROUP_HINTS[group]} – click to ${hidden.has(group) ? 'show' : 'hide'}`}
          onClick={() => onToggle(group)}
        >
          <i className={`swatch ${group.toLowerCase()}`} /> {group}{' '}
          <span className="muted">{counts[group]!.toLocaleString()}</span>
        </button>
      ))}
      <span>
        <i className="line-key dashed" /> Shot
      </span>
      <span>
        <i className="line-key solid" /> Assist / key pass
      </span>
    </>
  )
}
