import { useState } from 'react'
import { sportMeta, skillLabel, reliabilityDisplay } from '../lib/constants'
import { useAuth } from '../context/AuthContext'

function formatWhen(iso) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Detail panel for a single game with a Join / Leave action, plus host-only
// Edit and Cancel actions.
export default function GameDetailPanel({
  game,
  onClose,
  onJoin,
  onLeave,
  onRequireAuth,
  onEdit,
  onDelete,
}) {
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const meta = sportMeta(game.sport)
  const participants = game.participants || []
  const joinedCount = participants.length
  const capacity = game.players_needed
  const spotsLeft = Math.max(capacity - joinedCount, 0)
  const isFull = spotsLeft <= 0
  const isHost = user && user.id === game.host_id
  const hasJoined = user && participants.some((p) => p.user_id === user.id)

  const handleJoinLeave = async () => {
    if (!user) {
      onRequireAuth()
      return
    }
    setError(null)
    setBusy(true)
    try {
      if (hasJoined) await onLeave(game.id, user.id)
      else await onJoin(game.id, user.id)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setBusy(true)
    try {
      await onDelete(game.id)
      // Panel is closed by the parent after a successful delete.
    } catch (err) {
      setError(err.message || 'Could not cancel the game.')
      setBusy(false)
      setConfirmingDelete(false)
    }
  }

  const reliability = reliabilityDisplay(game.host?.reliability_score)
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${game.latitude},${game.longitude}`

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="sport-emoji" aria-hidden="true">{meta.emoji}</span> {meta.label}
        </h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div className="badges">
        <span className="badge">{skillLabel(game.skill_level)}</span>
        <span className={`badge ${isFull ? 'badge-full' : 'badge-open'}`}>
          {isFull ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left`}
        </span>
      </div>

      <dl className="detail-list">
        <div>
          <dt>When</dt>
          <dd>{formatWhen(game.date_time)}</dd>
        </div>
        <div>
          <dt>Where</dt>
          <dd>
            <a href={mapsLink} target="_blank" rel="noreferrer">
              {game.latitude.toFixed(4)}, {game.longitude.toFixed(4)} ↗
            </a>
          </dd>
        </div>
        <div>
          <dt>Host</dt>
          <dd>
            {game.host?.name || 'Unknown'}{' '}
            {reliability.isNew ? (
              <span className="host-badge" title={reliability.title}>
                {reliability.label}
              </span>
            ) : (
              <span className="reliability" title={reliability.title}>
                ⭐ {reliability.label}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Players</dt>
          <dd>
            {joinedCount} / {capacity} joined
          </dd>
        </div>
      </dl>

      {game.note && <p className="game-note">“{game.note}”</p>}

      <div className="participants">
        <h3>Who's in</h3>
        {joinedCount === 0 ? (
          <p className="muted">No one's joined yet — be the first!</p>
        ) : (
          <ul className="participant-list">
            {participants.map((p) => (
              <li key={p.user_id}>
                <span className="avatar" aria-hidden="true">
                  {(p.profile?.name || '?').charAt(0).toUpperCase()}
                </span>
                {p.profile?.name || 'Player'}
                {p.user_id === game.host_id && <span className="host-tag">host</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}

      {isHost ? (
        <div className="host-actions">
          <p className="muted center">You're hosting this game.</p>
          {confirmingDelete ? (
            <div className="confirm-row">
              <span className="muted">Cancel this game for everyone?</span>
              <div className="panel-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={busy}
                >
                  Keep it
                </button>
                <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
                  {busy ? 'Cancelling…' : 'Yes, cancel'}
                </button>
              </div>
            </div>
          ) : (
            <div className="panel-actions">
              <button className="btn btn-ghost" onClick={() => onEdit(game)} disabled={busy}>
                Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setConfirmingDelete(true)}
                disabled={busy}
              >
                Cancel game
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          className={`btn btn-block ${hasJoined ? 'btn-ghost' : 'btn-primary'}`}
          onClick={handleJoinLeave}
          disabled={busy || (isFull && !hasJoined)}
        >
          {busy
            ? 'Please wait…'
            : hasJoined
            ? 'Leave game'
            : isFull
            ? 'Full'
            : 'Join game'}
        </button>
      )}
    </div>
  )
}
