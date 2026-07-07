import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTournaments } from '../hooks/useTournaments'
import { SPORTS, sportMeta } from '../lib/constants'
import TournamentDetail from './TournamentDetail'

const MAX_PLAYER_OPTIONS = [4, 8, 16, 32]

const STATUS_LABEL = {
  open: 'Sign-ups open',
  in_progress: 'In progress',
  completed: 'Completed',
}

function CreateTournamentForm({ onCancel, onCreate }) {
  const [name, setName] = useState('')
  const [sport, setSport] = useState(SPORTS[0].value)
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [startsAt, setStartsAt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give your tournament a name.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      await onCreate({
        name: name.trim(),
        sport,
        maxPlayers: Number(maxPlayers),
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      })
    } catch (err) {
      setError(err.message || 'Could not create the tournament.')
      setBusy(false)
    }
  }

  return (
    <form className="form tourn-form" onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Saturday 5-a-side cup"
          autoFocus
        />
      </label>
      <label className="field">
        <span>Sport</span>
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          {SPORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Max players</span>
        <select value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)}>
          {MAX_PLAYER_OPTIONS.map((n) => (
            <option key={n} value={n}>{n} players</option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Starts <em>(optional)</em></span>
        <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="panel-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create'}
        </button>
      </div>
    </form>
  )
}

// Tournaments hub: browse/create tournaments, then drill into one for its
// bracket. Everything is real — backed by supabase/tournaments.sql.
export default function TournamentsPanel({ onClose }) {
  const { user } = useAuth()
  const { tournaments, loading, error, createTournament, joinTournament, leaveTournament, startTournament } =
    useTournaments()
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)

  if (selectedId) {
    return (
      <TournamentDetail
        tournamentId={selectedId}
        onBack={() => setSelectedId(null)}
        joinTournament={joinTournament}
        leaveTournament={leaveTournament}
        startTournament={startTournament}
      />
    )
  }

  const handleCreate = async (fields) => {
    if (!user) return
    const created = await createTournament({ ...fields, hostId: user.id })
    setCreating(false)
    if (created?.id) setSelectedId(created.id)
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>⚔️ Tournaments</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {error ? (
        <p className="muted">
          Tournaments aren’t enabled yet. Run <code>supabase/tournaments.sql</code> in the
          Supabase SQL editor to turn them on.
        </p>
      ) : creating ? (
        <CreateTournamentForm onCancel={() => setCreating(false)} onCreate={handleCreate} />
      ) : (
        <>
          {user ? (
            <button className="btn btn-primary btn-block" onClick={() => setCreating(true)}>
              ＋ New tournament
            </button>
          ) : (
            <p className="muted center">Log in to create or join a tournament.</p>
          )}

          {loading ? (
            <p className="muted">Loading…</p>
          ) : tournaments.length === 0 ? (
            <p className="muted tourn-empty">
              No tournaments yet. {user ? 'Start one and invite your crew.' : ''}
            </p>
          ) : (
            <ul className="tourn-list">
              {tournaments.map((t) => {
                const meta = sportMeta(t.sport)
                const count = t.tournament_participants?.length ?? 0
                return (
                  <li key={t.id}>
                    <button className="tourn-row" onClick={() => setSelectedId(t.id)}>
                      <span className="tourn-emoji" aria-hidden="true">{meta.emoji}</span>
                      <span className="tourn-info">
                        <span className="tourn-name">{t.name}</span>
                        <span className="tourn-meta">
                          {meta.label} · {count}/{t.max_players} players
                        </span>
                      </span>
                      <span className={`tourn-status status-${t.status}`}>
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
