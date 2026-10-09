import type { GoalFilters } from '../lib/filters.ts'

interface FiltersBarProps {
  filters: GoalFilters
  onChange: (filters: GoalFilters) => void
  competitions: string[]
  seasons: string[]
  teams: string[]
  showMisses: boolean
  /** Missed shots can only be loaded once a league and a season are picked. */
  missesAvailable: boolean
  onShowMissesChange: (show: boolean) => void
}

export function FiltersBar(props: FiltersBarProps) {
  const { filters, onChange, competitions, seasons, teams, showMisses, missesAvailable, onShowMissesChange } = props
  return (
    <div className="filters">
      <Select
        label="League"
        value={filters.competition}
        options={competitions}
        // Changing league resets season and team, since they may not exist in the new league.
        onChange={(competition) => onChange({ ...filters, competition, season: '', team: '' })}
      />
      <Select
        label="Season"
        value={filters.season}
        options={seasons}
        onChange={(season) => onChange({ ...filters, season, team: '' })}
      />
      <Select label="Team" value={filters.team} options={teams} onChange={(team) => onChange({ ...filters, team })} />
      <label>
        Scorer
        <input
          type="search"
          placeholder="e.g. Messi"
          // Shows the exact player when one was picked from "Top scorers";
          // typing switches back to free-text search.
          value={filters.player || filters.playerSearch}
          onChange={(e) => onChange({ ...filters, playerSearch: e.target.value, player: '' })}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={showMisses}
          aria-describedby="misses-hint"
          onChange={(e) => onShowMissesChange(e.target.checked)}
        />
        Show missed shots
      </label>
      {/* Outside the label, so screen readers read it once - as the checkbox's description. */}
      <span id="misses-hint" className="muted misses-hint">
        {missesAvailable ? '' : 'Pick a league and a season to see missed shots'}
      </span>
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
