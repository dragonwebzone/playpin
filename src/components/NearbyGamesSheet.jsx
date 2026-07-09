import { useMemo, useState } from 'react'
import { sportMeta, skillLabel, distanceKm, distanceLabel, relativeWhen } from '../lib/constants'
import { SportIcon } from './icons'

// Collapsible bottom "home feed" of nearby games, sorted by distance then time.
// Turns the map from a bare canvas into a living list you can scan and tap.
export default function NearbyGamesSheet({ games, userLocation, selectedGameId, onSelect }) {
  const [expanded, setExpanded] = useState(false)

  const ranked = useMemo(() => {
    return games
      .map((g) => ({
        game: g,
        km: userLocation ? distanceKm(userLocation, { lat: g.latitude, lng: g.longitude }) : null,
      }))
      .sort((a, b) => {
        if (a.km != null && b.km != null && a.km !== b.km) return a.km - b.km
        return new Date(a.game.date_time) - new Date(b.game.date_time)
      })
  }, [games, userLocation])

  if (ranked.length === 0) return null

  return (
    <div className={`nearby ${expanded ? 'nearby--open' : ''}`}>
      <button
        className="nearby-handle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="nearby-grip" aria-hidden="true" />
        <span className="nearby-title">
          <span className="nearby-dot" aria-hidden="true" />
          {ranked.length} game{ranked.length === 1 ? '' : 's'} nearby
        </span>
        <span className="nearby-chevron" aria-hidden="true">{expanded ? '▾' : '▴'}</span>
      </button>

      <ul className="nearby-list">
        {ranked.map(({ game, km }) => {
          const meta = sportMeta(game.sport)
          const joined = game.participants?.length || 0
          const spots = Math.max(game.players_needed - joined, 0)
          return (
            <li key={game.id}>
              <button
                className={`nearby-row ${game.id === selectedGameId ? 'is-active' : ''}`}
                onClick={() => onSelect(game.id)}
              >
                <span
                  className="nearby-emoji"
                  aria-hidden="true"
                  style={{ color: meta.color }}
                >
                  <SportIcon sport={game.sport} />
                </span>
                <span className="nearby-info">
                  <span className="nearby-row-title">
                    {meta.label} <span className="nearby-skill">· {skillLabel(game.skill_level)}</span>
                  </span>
                  <span className="nearby-meta">
                    {km != null && <>{distanceLabel(km)} · </>}
                    {relativeWhen(game.date_time)}
                  </span>
                </span>
                <span className={`nearby-spots ${spots === 0 ? 'is-full' : ''}`}>
                  {spots === 0 ? 'Full' : `${spots} left`}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
