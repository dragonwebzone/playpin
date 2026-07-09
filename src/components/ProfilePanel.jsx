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
import {
  IconUsers,
  IconTrophy,
  IconPencil,
  IconChevronRight,
  IconSun,
} from './icons'

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
        <IconChevronRight className="ic mygames-chevron" />
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
            <>
              <div className="identity-name-row">
                <span className="identity-name">{profile?.name || 'Player'}</span>
                <button
                  className="icon-edit"
                  onClick={() => setEditing(true)}
                  aria-label="Edit name"
                >
                  <IconPencil className="ic" />
                </button>
              </div>
              <span className="identity-sub">
                {user?.email}
                {user?.email && since && <span className="dot" aria-hidden="true">·</span>}
                {since && `Member since ${since}`}
              </span>
            </>
          )}
          {saveError && <span className="form-error">{saveError}</span>}
        </div>
      </div>

      {/* Level / XP — single line + slim bar */}
      <div className="xp-block">
        <div className="xp-line">
          <span className="xp-level">Level {level}</span>
          <span className="xp-progress">
            {intoLevel}/{forNext} XP to Level {level + 1}
          </span>
        </div>
        <div className="xp-bar">
          <span style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      </div>

      {/* Stats — one row, divided, no pill backgrounds */}
      <div className="stat-row">
        <div className="stat-cell">
          <span className="stat-num">{profile?.games_hosted ?? 0}</span>
          <span className="stat-key">Hosted</span>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{profile?.games_joined ?? 0}</span>
          <span className="stat-key">Joined</span>
        </div>
        <div className="stat-cell" title={rel.title}>
          <span className="stat-num">{rel.label}</span>
          <span className="stat-key">Reliability</span>
        </div>
      </div>

      {/* Navigation rows */}
      <div className="profile-list">
        <button className="list-row" onClick={onOpenFriends}>
          <IconUsers className="ic list-icon" />
          <span className="list-label">Friends</span>
          {incomingCount > 0 && <span className="notif-badge list-badge">{incomingCount}</span>}
          <IconChevronRight className="ic list-chevron" />
        </button>
        <button className="list-row" onClick={onOpenLeaderboard}>
          <IconTrophy className="ic list-icon" />
          <span className="list-label">Leaderboard</span>
          <IconChevronRight className="ic list-chevron" />
        </button>
        <div className="list-row list-row--static">
          <IconSun className="ic list-icon" />
          <span className="list-label">Appearance</span>
          <ThemeToggle />
        </div>
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

      {/* Log out — neutral text link, red only on hover */}
      <div className="profile-footer">
        <button className="logout-link" onClick={signOut}>
          Log out
        </button>
      </div>
    </div>
  )
}
