import { useEffect, useState } from 'react'
import { SPORTS, SKILL_LEVELS, TIME_WINDOWS, RADIUS_OPTIONS } from '../lib/constants'
import { IconSliders, IconUsers, SportIcon } from './icons'

// A single "Filters" button that opens a popover with the sport / skill / time
// (and optional friends & distance) chip groups. A badge shows how many
// non-default filters are active. Collapses what used to be several stacked
// pill rows into one control-bar affordance.
export default function FilterBar({ filters, onChange, resultCount, hasFriends, hasLocation }) {
  const [open, setOpen] = useState(false)
  const set = (key, value) => onChange({ ...filters, [key]: value })

  const activeCount =
    (filters.sport !== 'all' ? 1 : 0) +
    (filters.skill !== 'all' ? 1 : 0) +
    (filters.timeWindow.value !== TIME_WINDOWS[0].value ? 1 : 0) +
    (hasLocation && filters.radius.value !== RADIUS_OPTIONS[0].value ? 1 : 0) +
    (filters.friendsOnly ? 1 : 0)

  // Close the popover on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const reset = () =>
    onChange({
      ...filters,
      sport: 'all',
      skill: 'all',
      timeWindow: TIME_WINDOWS[0],
      radius: RADIUS_OPTIONS[0],
      friendsOnly: false,
    })

  return (
    <div className="filters-menu">
      <button
        className={`filters-btn ${activeCount > 0 ? 'filters-btn--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Filters"
      >
        <IconSliders className="ic" /> Filters
        {activeCount > 0 && <span className="filters-badge">{activeCount}</span>}
      </button>

      {open && (
        <>
          <div className="filters-backdrop" onClick={() => setOpen(false)} />
          <div className="filters-pop" role="dialog" aria-label="Filters">
            <div className="filters-group">
              <span className="filters-group-label">Sport</span>
              <div className="filters-chips">
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
                    <SportIcon sport={s.value} className="ic" /> {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filters-group">
              <span className="filters-group-label">Skill level</span>
              <div className="filters-chips">
                <button
                  className={`chip ${filters.skill === 'all' ? 'chip--on' : ''}`}
                  onClick={() => set('skill', 'all')}
                >
                  All levels
                </button>
                {SKILL_LEVELS.map((s) => (
                  <button
                    key={s.value}
                    className={`chip ${filters.skill === s.value ? 'chip--on' : ''}`}
                    onClick={() => set('skill', filters.skill === s.value ? 'all' : s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filters-group">
              <span className="filters-group-label">When</span>
              <div className="filters-chips">
                {TIME_WINDOWS.map((t) => (
                  <button
                    key={t.value}
                    className={`chip ${filters.timeWindow.value === t.value ? 'chip--on' : ''}`}
                    onClick={() => set('timeWindow', t)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {hasLocation && (
              <div className="filters-group">
                <span className="filters-group-label">Distance</span>
                <div className="filters-chips">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      className={`chip ${filters.radius.value === r.value ? 'chip--on' : ''}`}
                      onClick={() => set('radius', r)}
                    >
                      {r.label.replace('Within ', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFriends && (
              <div className="filters-group">
                <span className="filters-group-label">People</span>
                <div className="filters-chips">
                  <button
                    className={`chip ${filters.friendsOnly ? 'chip--on' : ''}`}
                    onClick={() => set('friendsOnly', !filters.friendsOnly)}
                  >
                    <IconUsers className="ic" /> Friends only
                  </button>
                </div>
              </div>
            )}

            <div className="filters-foot">
              <span className="filter-count">
                {resultCount} {resultCount === 1 ? 'game' : 'games'}
              </span>
              {activeCount > 0 && (
                <button className="link-btn" onClick={reset}>
                  Clear all
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
