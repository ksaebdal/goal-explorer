import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Attribution } from './components/Attribution.tsx'
import { FiltersBar } from './components/FiltersBar.tsx'
import { OutcomeLegend } from './components/OutcomeLegend.tsx'
import { Pitch } from './components/Pitch.tsx'
import { ShotDetails } from './components/ShotDetails.tsx'
import { ShotList } from './components/ShotList.tsx'
import { StatsPanel } from './components/StatsPanel.tsx'
import { availableOptions, EMPTY_FILTERS, filterShots, type GoalFilters } from './lib/filters.ts'
import { compareShots } from './lib/order.ts'
import { countByGroup, outcomeGroup, type OutcomeGroup } from './lib/outcomes.ts'
import { missedShotsFileName } from './lib/shotFiles.ts'
import type { Shot } from './lib/types.ts'
import { useJson } from './lib/useJson.ts'

// One shared empty list, so "no misses" is always the same array (keeps memo() effective).
const NO_SHOTS: Shot[] = []

export default function App() {
  const data = useJson<Shot[]>('goals.json')

  return (
    <main>
      <header>
        <h1>⚽ Goal Explorer</h1>
        <p className="muted">
          Every goal in the StatsBomb open data, plotted where it was scored from. Pick a league and season to
          also see the missed shots. Own goals and penalty shootouts are not included.
        </p>
      </header>
      {(data.status === 'idle' || data.status === 'loading') && <p>Loading goals…</p>}
      {data.status === 'error' && <p className="error">Could not load goals: {data.message}</p>}
      {data.status === 'ready' && <Explorer goals={data.data} />}
      <Attribution />
    </main>
  )
}

function Explorer({ goals }: { goals: Shot[] }) {
  const [filters, setFilters] = useState<GoalFilters>(EMPTY_FILTERS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMisses, setShowMisses] = useState(false)
  const [hiddenGroups, setHiddenGroups] = useState<ReadonlySet<OutcomeGroup>>(new Set())

  // The inputs update right away; the (slower) filtering of 11k goals follows
  // a moment later, so typing in the search box stays smooth.
  const deferredFilters = useDeferredValue(filters)
  const filteredGoals = useMemo(() => filterShots(goals, deferredFilters), [goals, deferredFilters])

  const { competition, season } = filters
  const options = useMemo(
    () => availableOptions(goals, { ...EMPTY_FILTERS, competition, season }),
    [goals, competition, season],
  )

  // Missed shots live in one file per league + season, so we can only load them once both are picked.
  const missesAvailable = competition !== '' && season !== ''
  const misses = useJson<Shot[]>(
    showMisses && missesAvailable ? `shots/${missedShotsFileName(competition, season)}` : null,
  )
  const loadedMisses = misses.status === 'ready' ? misses.data : NO_SHOTS
  const filteredMisses = useMemo(() => filterShots(loadedMisses, deferredFilters), [loadedMisses, deferredFilters])

  // What's actually drawn: the legend buttons can hide each outcome group.
  const visibleGoals = hiddenGroups.has('Goal') ? NO_SHOTS : filteredGoals
  const visibleMisses = useMemo(
    () => filteredMisses.filter((s) => !hiddenGroups.has(outcomeGroup(s.outcome))),
    [filteredMisses, hiddenGroups],
  )

  // How many shots per group, for the legend. Groups that aren't loaded are left out.
  const counts = useMemo(
    () => countByGroup(filteredGoals, misses.status === 'ready' ? filteredMisses : null),
    [filteredGoals, filteredMisses, misses.status],
  )

  // The table lists every visible shot (goals and misses) in match order. It is also the
  // keyboard way to reach any dot on the pitch.
  const tableShots = useMemo(
    () => (visibleMisses.length === 0 ? visibleGoals : [...visibleGoals, ...visibleMisses].sort(compareShots)),
    [visibleGoals, visibleMisses],
  )

  // Changing filters clears the selection, so a hidden shot doesn't "come back" selected later.
  const changeFilters = (next: GoalFilters) => {
    setFilters(next)
    setSelectedId(null)
  }

  // Switching misses off also clears the selection, so a hidden miss doesn't come back selected later.
  const showMissesChange = (show: boolean) => {
    setShowMisses(show)
    setSelectedId(null)
  }

  const toggleGroup = (group: OutcomeGroup) => {
    setHiddenGroups((hidden) => {
      const next = new Set(hidden) // never change state in place - make a new Set
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  // useCallback keeps this the same function between renders, so the memoised
  // dots on the pitch don't have to redraw when only the selection changes.
  const selectShot = useCallback((shot: Shot) => setSelectedId(shot.id), [])

  // Clicking a top scorer filters on exactly that player. Using the "updater" form of
  // setFilters (f => ...) means this function never changes, which keeps the memo'd panel cheap.
  const pickScorer = useCallback((player: string) => {
    setFilters((f) => ({ ...f, player, playerSearch: '' }))
    setSelectedId(null)
  }, [])

  // Looked up in all filtered shots, so hiding a group in the legend doesn't break selecting from the table.
  // (A selected shot stays highlighted even if its group is then hidden - you picked it on purpose.)
  const selectedShot =
    filteredGoals.find((s) => s.id === selectedId) ?? filteredMisses.find((s) => s.id === selectedId)

  return (
    <>
      <FiltersBar
        filters={filters}
        onChange={changeFilters}
        {...options}
        showMisses={showMisses}
        missesAvailable={missesAvailable}
        onShowMissesChange={showMissesChange}
      />
      <p className="count">
        <strong>{filteredGoals.length.toLocaleString()}</strong> goals
        {misses.status === 'ready' && (
          <>
            {' '}
            · <strong>{filteredMisses.length.toLocaleString()}</strong> missed shots
          </>
        )}
        {/* Only the status messages are announced by screen readers, not every count change. */}
        <span aria-live="polite">
          {misses.status === 'loading' && <span className="muted"> · loading missed shots…</span>}
          {misses.status === 'error' && <span className="error"> · could not load missed shots: {misses.message}</span>}
        </span>
      </p>
      <div className="layout">
        <Pitch goals={visibleGoals} misses={visibleMisses} selected={selectedShot} onSelect={selectShot}>
          <OutcomeLegend counts={counts} hidden={hiddenGroups} onToggle={toggleGroup} />
        </Pitch>
        <ShotDetails shot={selectedShot} />
      </div>
      <StatsPanel goals={filteredGoals} onPickScorer={pickScorer} />
      <ShotList shots={tableShots} selectedId={selectedShot?.id ?? null} onSelect={selectShot} />
    </>
  )
}
