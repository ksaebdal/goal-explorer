import type { GoalFilters } from '../lib/filters.ts'

interface FiltersBarProps {
  filters: GoalFilters
  onChange: (filters: GoalFilters) => void
  competitions: string[]
  seasons: string[]
  teams: string[]
}

export function FiltersBar({ filters, onChange, competitions, seasons, teams }: FiltersBarProps) {
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
