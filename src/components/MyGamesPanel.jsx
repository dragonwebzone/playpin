import { sportMeta, skillLabel, levelFromXp } from '../lib/constants'

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
// they've joined — plus their level/XP profile stats.
export default function MyGamesPanel({ games, userId, profile, onSelect, onClose }) {
  const hosting = games.filter((g) => g.host_id === userId)
  const joined = games.filter(
    (g) => g.host_id !== userId && (g.participants || []).some((p) => p.user_id === userId)
  )

  const empty = hosting.length === 0 && joined.length === 0
  const { level, intoLevel, forNext, progress, xp } = levelFromXp(profile?.xp)

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>My profile</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Level / XP header */}
      <div className="profile-stats">
        <div className="level-badge">
          <span className="level-num">{level}</span>
          <span className="level-word">Level</span>
        </div>
        <div className="stats-right">
          <div className="xp-row">
            <strong>{xp} XP</strong>
            <span className="muted">{intoLevel}/{forNext} to Lv {level + 1}</span>
          </div>
          <div className="xp-bar">
            <span style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="stat-pills">
            <span className="stat-pill">🎯 {profile?.games_hosted ?? 0} hosted</span>
            <span className="stat-pill">🤝 {profile?.games_joined ?? 0} joined</span>
          </div>
        </div>
      </div>

      <h3 className="mygames-heading">My games</h3>

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
