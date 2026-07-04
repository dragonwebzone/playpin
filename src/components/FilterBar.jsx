import { SPORTS, SKILL_LEVELS, TIME_WINDOWS } from '../lib/constants'

// Horizontal, scrollable filter controls for sport / skill / time window.
export default function FilterBar({ filters, onChange, resultCount }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="filterbar">
      <div className="filter-group">
        <select
          value={filters.sport}
          onChange={(e) => set('sport', e.target.value)}
          aria-label="Filter by sport"
        >
          <option value="all">All sports</option>
          {SPORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.emoji} {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.skill}
          onChange={(e) => set('skill', e.target.value)}
          aria-label="Filter by skill level"
        >
          <option value="all">All levels</option>
          {SKILL_LEVELS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.timeWindow.value}
          onChange={(e) =>
            set('timeWindow', TIME_WINDOWS.find((t) => t.value === e.target.value))
          }
          aria-label="Filter by time"
        >
          {TIME_WINDOWS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <span className="filter-count">
        {resultCount} {resultCount === 1 ? 'game' : 'games'}
      </span>
    </div>
  )
}
