import { sportMeta, skillLabel } from '../lib/constants'

function formatWhen(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function GameRow({ game, onSelect }) {
  const meta = sportMeta(game.sport)
  const joined = game.participants?.length || 0
  return (
    <li>
      <button className="mygames-row" onClick={() => onSelect(game.id)}>
        <span className="mygames-emoji" aria-hidden="true">{meta.emoji}</span>
        <span className="mygames-info">
          <span className="mygames-title">
            {meta.label} · {skillLabel(game.skill_level)}
          </span>
          <span className="mygames-meta">
            {formatWhen(game.date_time)} · {joined}/{game.players_needed} in
          </span>
        </span>
        <span className="mygames-chevron" aria-hidden="true">›</span>
      </button>
    </li>
  )
}

// Lists the current user's upcoming games — the ones they host and the ones
// they've joined. Derived from the already-loaded games list (no extra query).
export default function MyGamesPanel({ games, userId, onSelect, onClose }) {
  const hosting = games.filter((g) => g.host_id === userId)
  const joined = games.filter(
    (g) => g.host_id !== userId && (g.participants || []).some((p) => p.user_id === userId)
  )

  const empty = hosting.length === 0 && joined.length === 0

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>My games</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {empty ? (
        <p className="muted">
          You’re not in any upcoming games yet. Drop a pin to host one, or tap a marker to join.
        </p>
      ) : (
        <>
          {hosting.length > 0 && (
            <section className="mygames-section">
              <h3>Hosting ({hosting.length})</h3>
              <ul className="mygames-list">
                {hosting.map((g) => (
                  <GameRow key={g.id} game={g} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}

          {joined.length > 0 && (
            <section className="mygames-section">
              <h3>Joined ({joined.length})</h3>
              <ul className="mygames-list">
                {joined.map((g) => (
                  <GameRow key={g.id} game={g} onSelect={onSelect} />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
