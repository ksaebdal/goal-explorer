import { outcomeGroup, outcomeLabel } from '../lib/outcomes.ts'
import type { Shot } from '../lib/types.ts'

// Rendering thousands of table rows makes the page slow, so we cap the list.
const MAX_ROWS = 200

interface ShotListProps {
  shots: Shot[]
  selectedId: string | null
  onSelect: (shot: Shot) => void
}

/** The table under the pitch. It is also the keyboard way to select any shot on the pitch. */
export function ShotList({ shots, selectedId, onSelect }: ShotListProps) {
  return (
    <div className="goal-list">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Player</th>
            <th>Outcome</th>
            <th>Assist / key pass</th>
            <th>Team</th>
            <th>Match</th>
            <th>Min</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          {shots.slice(0, MAX_ROWS).map((s) => (
            <tr key={s.id} className={s.id === selectedId ? 'selected' : undefined} onClick={() => onSelect(s)}>
              <td>{s.matchDate}</td>
              <td>
                {/* A real button gives keyboard users Tab + Enter/Space for free.
                    Its click "bubbles up" to the row's onClick, so it needs no handler itself. */}
                <button type="button" className="link-button" aria-current={s.id === selectedId || undefined}>
                  {s.player}
                </button>
              </td>
              <td>
                <i className={`swatch ${outcomeGroup(s.outcome).toLowerCase()}`} aria-hidden="true" />{' '}
                {outcomeLabel(s.outcome)}
              </td>
              <td>{s.assist?.player ?? '–'}</td>
              <td>{s.team}</td>
              <td>
                {s.homeTeam} – {s.awayTeam}
              </td>
              <td>{s.minute}'</td>
              <td>{s.distanceMeters} m</td>
            </tr>
          ))}
        </tbody>
      </table>
      {shots.length > MAX_ROWS && (
        <p className="muted">
          Showing {MAX_ROWS} of {shots.length.toLocaleString()} shots. Use the filters to narrow down.
        </p>
      )}
    </div>
  )
}
