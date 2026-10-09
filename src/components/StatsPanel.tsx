import { memo, useMemo } from 'react'
import { assistsOf, distanceBands, summarize, topCounts } from '../lib/stats.ts'
import type { Shot } from '../lib/types.ts'
import { BarChart } from './BarChart.tsx'
import { ColumnChart } from './ColumnChart.tsx'

const TOP_N = 10

interface StatsPanelProps {
  goals: Shot[]
  onPickScorer: (player: string) => void
}

// memo: the stats only change when the filtered goals change, not when a goal is selected.
export const StatsPanel = memo(function StatsPanel({ goals, onPickScorer }: StatsPanelProps) {
  const stats = useMemo(() => {
    const assists = assistsOf(goals)
    return {
      summary: summarize(goals),
      scorers: topCounts(
        goals.map((g) => g.player),
        TOP_N,
      ),
      assisters: topCounts(
        assists.map((a) => a.player),
        TOP_N,
      ),
      setUp: topCounts(
        assists.map((a) => a.kind),
        TOP_N,
      ),
      distances: distanceBands(goals),
    }
  }, [goals])
  const { summary } = stats

  return (
    <section className="stats" aria-labelledby="stats-heading">
      <h2 id="stats-heading">Statistics</h2>
      <div className="stat-tiles">
        <StatTile label="Different scorers" value={summary.scorers.toLocaleString()} />
        <StatTile
          label="Average distance"
          value={summary.averageDistanceMeters === null ? '–' : `${summary.averageDistanceMeters} m`}
        />
        <StatTile label="Assisted" value={percent(summary.assistedShare)} />
        <StatTile label="Headers" value={percent(summary.headerShare)} />
      </div>
      <div className="chart-grid">
        <BarChart
          title="Top scorers"
          data={stats.scorers}
          onSelect={onPickScorer}
          selectLabel={(player) => `Show only goals by ${player}`}
        />
        <BarChart title="Top assisters" data={stats.assisters} />
        <ColumnChart title="Distance of goals (metres)" data={stats.distances} unit="m" />
        <BarChart title="How assisted goals were set up" data={stats.setUp} />
      </div>
    </section>
  )
})

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function percent(share: number | null): string {
  return share === null ? '–' : `${Math.round(share * 100)}%`
}
