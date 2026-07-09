import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTournaments } from '../hooks/useTournaments'
import { sportMeta } from '../lib/constants'
import TournamentDetail from './TournamentDetail'

const STATUS_LABEL = {
  open: 'Sign-ups open',
  in_progress: 'In progress',
  completed: 'Completed',
}

// Tournaments hub: browse tournaments and drill into one for sign-ups / its
// bracket. Creating a tournament happens on the map (drop a pin), so the "New
// tournament" button routes there. Everything is real — backed by
// supabase/tournaments.sql.
export default function TournamentsPanel({ onClose }) {
  const { user } = useAuth()
  const { tournaments, loading, error, joinTournament, leaveTournament, startTournament } =
    useTournaments()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState(null)

  // Auto-open a tournament when arriving via ?t=<id> (e.g. right after creating
  // one on the map), then strip the param.
  useEffect(() => {
    const t = searchParams.get('t')
    if (t) {
      setSelectedId(t)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

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
      ) : (
        <>
          {user ? (
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate('/app?create=tournament')}
            >
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
