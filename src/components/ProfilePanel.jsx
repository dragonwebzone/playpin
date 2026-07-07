import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useGameHistory } from '../hooks/useGameHistory'
import {
  sportMeta,
  skillLabel,
  levelFromXp,
  reliabilityDisplay,
} from '../lib/constants'
import ThemeToggle from './ThemeToggle'
import Spinner from './Spinner'

function formatWhen(iso) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function memberSince(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

function GameRow({ game, onSelect, past }) {
  const meta = sportMeta(game.sport)
  const joined = game.participants?.length || 0
  return (
    <li>
      <button className="mygames-row" onClick={() => onSelect(game.id)}>
        <span className="mygames-emoji" aria-hidden="true">{meta.emoji}</span>
        <span className="mygames-info">
          <span className="mygames-title">
            {meta.label} · {skillLabel(game.skill_level)}
            {past && game.role && (
              <span className={`role-tag role-${game.role}`}>{game.role}</span>
            )}
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

// Full profile section: identity, editable name, stats, quick links, theme
// switch, upcoming + past games, and log out.
export default function ProfilePanel({
  games,
  savedIds,
  onSelect,
  onClose,
  onOpenFriends,
  onOpenLeaderboard,
  incomingCount = 0,
}) {
  const { user, profile, signOut, updateProfile } = useAuth()
  const userId = user?.id
  const { history, loading: historyLoading } = useGameHistory(userId)

  const [tab, setTab] = useState('upcoming')
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const hosting = games.filter((g) => g.host_id === userId)
  const joined = games.filter(
    (g) => g.host_id !== userId && (g.participants || []).some((p) => p.user_id === userId)
  )
  const saved = games.filter(
    (g) => savedIds?.has(g.id) && g.host_id !== userId && !joined.some((j) => j.id === g.id)
  )
  const noUpcoming = hosting.length === 0 && joined.length === 0 && saved.length === 0

  const { level, intoLevel, forNext, progress, xp } = levelFromXp(profile?.xp)
  const rel = reliabilityDisplay(profile?.reliability_score)
  const initial = (profile?.name || 'P').charAt(0).toUpperCase()
  const since = memberSince(profile?.created_at)

  const saveName = async (e) => {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    setSaving(true)
    setSaveError(null)
    try {
      await updateProfile({ name })
      setEditing(false)
    } catch (err) {
      setSaveError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Profile</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Identity */}
      <div className="profile-identity">
        <span className="avatar-lg" aria-hidden="true">{initial}</span>
        <div className="identity-main">
          {editing ? (
            <form className="name-edit" onSubmit={saveName}>
              <input
                className="name-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={40}
                autoFocus
                aria-label="Your name"
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? '…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditing(false)
                  setNameInput(profile?.name || '')
                  setSaveError(null)
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="identity-name-row">
              <span className="identity-name">{profile?.name || 'Player'}</span>
              <button
                className="link-btn"
                onClick={() => setEditing(true)}
                aria-label="Edit name"
              >
                ✏️ Edit
              </button>
            </div>
          )}
          {user?.email && <span className="identity-email">{user.email}</span>}
          {since && <span className="identity-since">Member since {since}</span>}
          {saveError && <span className="form-error">{saveError}</span>}
        </div>
      </div>

      {/* Level / XP + reliability */}
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
            <span className="stat-pill" title={rel.title}>⭐ {rel.label}</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="profile-quick">
        <button className="quick-tile" onClick={onOpenFriends}>
          <span className="quick-emoji" aria-hidden="true">👥</span>
          Friends
          {incomingCount > 0 && <span className="notif-badge">{incomingCount}</span>}
        </button>
        <button className="quick-tile" onClick={onOpenLeaderboard}>
          <span className="quick-emoji" aria-hidden="true">🏆</span>
          Leaderboard
        </button>
      </div>

      {/* Appearance */}
      <div className="profile-row">
        <div className="profile-row-label">
          <span className="quick-emoji" aria-hidden="true">🎨</span>
          Appearance
        </div>
        <ThemeToggle />
      </div>

      {/* Games */}
      <div className="profile-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'upcoming'}
          className={`profile-tab ${tab === 'upcoming' ? 'is-active' : ''}`}
          onClick={() => setTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          role="tab"
          aria-selected={tab === 'history'}
          className={`profile-tab ${tab === 'history' ? 'is-active' : ''}`}
          onClick={() => setTab('history')}
        >
          History
        </button>
      </div>

      {tab === 'upcoming' &&
        (noUpcoming ? (
          <p className="muted">
            You’re not in any upcoming games yet. Drop a pin to host one, or tap a
            marker to join.
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
            {saved.length > 0 && (
              <section className="mygames-section">
                <h3>★ Saved ({saved.length})</h3>
                <ul className="mygames-list">
                  {saved.map((g) => (
                    <GameRow key={g.id} game={g} onSelect={onSelect} />
                  ))}
                </ul>
              </section>
            )}
          </>
        ))}

      {tab === 'history' &&
        (historyLoading ? (
          <div className="corner-loader" style={{ position: 'static', padding: '12px 0' }}>
            <Spinner label="Loading history…" />
          </div>
        ) : history.length === 0 ? (
          <p className="muted">No past games yet. Once a game’s time passes, it shows up here.</p>
        ) : (
          <section className="mygames-section">
            <ul className="mygames-list">
              {history.map((g) => (
                <GameRow key={g.id} game={g} onSelect={onSelect} past />
              ))}
            </ul>
          </section>
        ))}

      {/* Log out */}
      <div className="profile-footer">
        <button className="btn btn-danger btn-block" onClick={signOut}>
          Log out
        </button>
      </div>
    </div>
  )
}
