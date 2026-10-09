import type { Count } from '../lib/stats.ts'

interface BarChartProps {
  title: string
  data: Count[]
  /** When given, each row becomes a button, e.g. to filter by that player. */
  onSelect?: (label: string) => void
  /** What clicking a row does, for screen readers, e.g. "Show only goals by Messi". */
  selectLabel?: (label: string) => string
}

/** Horizontal bars: label on the left, bar + value on the right. Long names fit better this way. */
export function BarChart({ title, data, onSelect, selectLabel }: BarChartProps) {
  // Bars are sized relative to the biggest value, so the top bar fills the track.
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <section className="chart-card">
      <h3>{title}</h3>
      {data.length === 0 && <p className="muted">No data for this selection.</p>}
      <ol className="bar-chart">
        {data.map((d) => {
          const row = (
            <>
              <span className="bar-label">{d.label}</span>
              <span className="bar-track">
                {/* The track minus room for the value label, so the longest bar + its value fit without squeezing. */}
                <span className="bar" style={{ width: `calc(${d.count / max} * (100% - 4em))` }} />
                <span className="bar-value">{d.count.toLocaleString()}</span>
              </span>
            </>
          )
          return (
            <li key={d.label} title={`${d.label}: ${d.count.toLocaleString()}`}>
              {onSelect ? (
                <button
                  type="button"
                  className="bar-row"
                  aria-label={selectLabel && `${selectLabel(d.label)} (${d.count.toLocaleString()} goals)`}
                  onClick={() => onSelect(d.label)}
                >
                  {row}
                </button>
              ) : (
                <div className="bar-row">{row}</div>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
