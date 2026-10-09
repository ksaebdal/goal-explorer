import type { Count } from '../lib/stats.ts'

// The tallest column is exactly this many pixels. A fixed pixel height (not a %)
// keeps every column in true proportion - the labels above and below can't squeeze it.
const PLOT_HEIGHT = 180

interface ColumnChartProps {
  title: string
  data: Count[]
  /** Used in the text read out by screen readers, e.g. "0–5 m: 1,104 goals". */
  unit: string
}

/** Vertical columns in a fixed order (e.g. distance bands), value on each column's cap. */
export function ColumnChart({ title, data, unit }: ColumnChartProps) {
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <section className="chart-card">
      <h3>{title}</h3>
      <ol className="column-chart">
        {data.map((d) => (
          <li key={d.label} className="column-slot" title={`${d.label} ${unit}: ${d.count.toLocaleString()}`}>
            {/* Screen readers get one clear sentence; the visual parts are hidden from them. */}
            <span className="sr-only">
              {d.label} {unit}: {d.count.toLocaleString()} goals
            </span>
            <span className="column-value" aria-hidden="true">
              {d.count.toLocaleString()}
            </span>
            <span className="column" aria-hidden="true" style={{ height: (d.count / max) * PLOT_HEIGHT }} />
            <span className="column-label" aria-hidden="true">
              {d.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
