import type { Goal } from '../lib/types.ts'

// Rendering thousands of table rows makes the page slow, so we cap the list.
const MAX_ROWS = 200

interface GoalListProps {
  goals: Goal[]
  selectedId: string | null
  onSelect: (goal: Goal) => void
}

export function GoalList({ goals, selectedId, onSelect }: GoalListProps) {
  return (
    <div className="goal-list">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Scorer</th>
            <th>Team</th>
            <th>Match</th>
            <th>Min</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          {goals.slice(0, MAX_ROWS).map((g) => (
            <tr
              key={g.id}
              className={g.id === selectedId ? 'selected' : undefined}
              onClick={() => onSelect(g)}
            >
              <td>{g.matchDate}</td>
              <td>
                {/* A real button gives keyboard users Tab + Enter/Space for free.
                    Its click "bubbles up" to the row's onClick, so it needs no handler itself. */}
                <button type="button" className="link-button" aria-current={g.id === selectedId || undefined}>
                  {g.player}
                </button>
              </td>
              <td>{g.team}</td>
              <td>
                {g.homeTeam} – {g.awayTeam}
              </td>
              <td>{g.minute}'</td>
              <td>{g.distanceMeters} m</td>
            </tr>
          ))}
        </tbody>
      </table>
      {goals.length > MAX_ROWS && (
        <p className="muted">
          Showing {MAX_ROWS} of {goals.length} goals. Use the filters to narrow down.
        </p>
      )}
    </div>
  )
}
