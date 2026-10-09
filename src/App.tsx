import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { FiltersBar } from './components/FiltersBar.tsx'
import { GoalDetails } from './components/GoalDetails.tsx'
import { GoalList } from './components/GoalList.tsx'
import { Pitch } from './components/Pitch.tsx'
import { availableOptions, EMPTY_FILTERS, filterGoals, type GoalFilters } from './lib/filters.ts'
import type { Goal } from './lib/types.ts'
import { useGoals } from './lib/useGoals.ts'

export default function App() {
  const data = useGoals()

  return (
    <main>
      <header>
        <h1>⚽ Goal Explorer</h1>
        <p className="muted">
          Every goal in the StatsBomb open data, plotted where it was scored from. Own goals and penalty
          shootouts are not included.
        </p>
      </header>
      {data.status === 'loading' && <p>Loading goals…</p>}
      {data.status === 'error' && <p className="error">Could not load goals: {data.message}</p>}
      {data.status === 'ready' && <Explorer goals={data.goals} />}
    </main>
  )
}

function Explorer({ goals }: { goals: Goal[] }) {
  const [filters, setFilters] = useState<GoalFilters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // The inputs update right away; the (slower) filtering of 11k goals follows
  // a moment later, so typing in the search box stays smooth.
  const deferredFilters = useDeferredValue(filters)
  const filtered = useMemo(() => filterGoals(goals, deferredFilters), [goals, deferredFilters])

  const { competition, season } = filters
  const options = useMemo(
    () => availableOptions(goals, { ...EMPTY_FILTERS, competition, season }),
    [goals, competition, season],
  )

  // Changing filters clears the selection, so a hidden goal doesn't "come back" selected later.
  const changeFilters = (next: GoalFilters) => {
    setFilters(next)
    setSelectedId(null)
  }

  // useCallback keeps this the same function between renders, so the memoised
  // dots on the pitch don't have to redraw when only the selection changes.
  const selectGoal = useCallback((goal: Goal) => setSelectedId(goal.id), [])

  const selectedGoal = filtered.find((g) => g.id === selectedId)

  return (
    <>
      <FiltersBar filters={filters} onChange={changeFilters} {...options} />
      <p className="count">
        <strong>{filtered.length.toLocaleString()}</strong> goals
      </p>
      <div className="layout">
        <Pitch goals={filtered} selected={selectedGoal} onSelect={selectGoal} />
        <GoalDetails goal={selectedGoal} />
      </div>
      <GoalList goals={filtered} selectedId={selectedGoal?.id ?? null} onSelect={selectGoal} />
    </>
  )
}
