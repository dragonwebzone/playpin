import { SPORTS, SKILL_LEVELS, TIME_WINDOWS } from '../lib/constants'

// Sport is a scrollable row of one-tap chips; level and time stay as compact
// selects. Keeps the map's discovery controls fast and thumb-friendly.
export default function FilterBar({ filters, onChange, resultCount }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="filterbar">
      <div className="sport-chips">
        <button
          className={`chip ${filters.sport === 'all' ? 'chip--on' : ''}`}
          onClick={() => set('sport', 'all')}
        >
          All
        </button>
        {SPORTS.map((s) => (
          <button
            key={s.value}
            className={`chip ${filters.sport === s.value ? 'chip--on' : ''}`}
            onClick={() => set('sport', filters.sport === s.value ? 'all' : s.value)}
          >
            <span aria-hidden="true">{s.emoji}</span> {s.label}
          </button>
        ))}
      </div>

      <div className="filter-selects">
        <select
          value={filters.skill}
          onChange={(e) => set('skill', e.target.value)}
          aria-label="Filter by skill level"
        >
          <option value="all">⭐ All levels</option>
          {SKILL_LEVELS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={filters.timeWindow.value}
          onChange={(e) => set('timeWindow', TIME_WINDOWS.find((t) => t.value === e.target.value))}
          aria-label="Filter by time"
        >
          {TIME_WINDOWS.map((t) => (
            <option key={t.value} value={t.value}>🕒 {t.label}</option>
          ))}
        </select>

        <span className="filter-count">{resultCount} {resultCount === 1 ? 'game' : 'games'}</span>
      </div>
    </div>
  )
}
