import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTournamentDetail } from '../hooks/useTournaments'
import { sportMeta } from '../lib/constants'

function initial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

// One match card in the bracket. When the viewer is the host, both players are
// present, and no winner is set yet, it exposes an inline score-reporting form.
function MatchCard({ match, isHost, onReport }) {
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const p1 = match.player1
  const p2 = match.player2
  const decided = !!match.winner_id
  const bothPresent = !!(p1 && p2)
  const canReport = isHost && bothPresent && !decided

  const save = async () => {
    const score1 = Number(s1)
    const score2 = Number(s2)
    if (!Number.isFinite(score1) || !Number.isFinite(score2)) {
      setError('Enter both scores.')
      return
    }
    if (score1 === score2) {
      setError('Scores can’t be tied in a knockout.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const winnerId = score1 > score2 ? p1.id : p2.id
      await onReport(match.id, { score1, score2, winnerId })
    } catch (err) {
      setError(err.message || 'Could not save the result.')
      setBusy(false)
    }
  }

  const row = (player, score, isWinner) => (
    <div className={`bracket-slot ${isWinner ? 'is-winner' : ''} ${!player ? 'is-empty' : ''}`}>
      <span className="bracket-player">
        {player ? (
          <>
            <span className="bracket-ava">{initial(player.name)}</span>
            <span className="bracket-name">{player.name || 'Player'}</span>
          </>
        ) : (
          <span className="bracket-name muted">{decided ? '—' : 'TBD'}</span>
        )}
      </span>
      {score != null && <span className="bracket-score">{score}</span>}
      {isWinner && <span className="bracket-check" aria-hidden="true">✓</span>}
    </div>
  )

  return (
    <div className={`bracket-match ${decided ? 'is-decided' : ''}`}>
      {row(p1, match.score1, match.winner_id && match.winner_id === p1?.id)}
      {row(p2, match.score2, match.winner_id && match.winner_id === p2?.id)}

      {canReport && (
        <div className="bracket-report">
          <input
            type="number"
            inputMode="numeric"
            className="bracket-score-input"
            value={s1}
            onChange={(e) => setS1(e.target.value)}
            aria-label={`${p1.name || 'Player 1'} score`}
            placeholder="0"
          />
          <span className="muted">–</span>
          <input
            type="number"
            inputMode="numeric"
            className="bracket-score-input"
            value={s2}
            onChange={(e) => setS2(e.target.value)}
            aria-label={`${p2.name || 'Player 2'} score`}
            placeholder="0"
          />
          <button className="btn btn-primary btn-xs" onClick={save} disabled={busy}>
            {busy ? '…' : 'Save'}
          </button>
        </div>
      )}
      {error && <p className="form-error bracket-err">{error}</p>}
    </div>
  )
}

// Detail view for one tournament: the sign-up roster while it's open, then the
// live single-elimination bracket once it's started.
export default function TournamentDetail({
  tournamentId,
  onBack,
  joinTournament,
  leaveTournament,
  startTournament,
}) {
  const { user } = useAuth()
  const { tournament, matches, participants, loading, reportScore } =
    useTournamentDetail(tournamentId)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const copyInvite = async () => {
    const link = `${window.location.origin}/app/tournaments?t=${tournamentId}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy — copy this link manually: ' + link)
    }
  }

  const isHost = user && tournament && tournament.host_id === user.id
  const joined = useMemo(
    () => !!user && participants.some((p) => p.user_id === user.id),
    [participants, user]
  )

  // Group matches into rounds for column-per-round rendering.
  const rounds = useMemo(() => {
    const byRound = new Map()
    for (const m of matches) {
      if (!byRound.has(m.round)) byRound.set(m.round, [])
      byRound.get(m.round).push(m)
    }
    return [...byRound.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([round, list]) => ({
        round,
        matches: list.sort((a, b) => a.match_number - b.match_number),
      }))
  }, [matches])

  const roundLabel = (round, total) => {
    const fromEnd = total - round
    if (fromEnd === 0) return 'Final'
    if (fromEnd === 1) return 'Semifinals'
    if (fromEnd === 2) return 'Quarterfinals'
    return `Round ${round}`
  }

  const champion = useMemo(() => {
    if (tournament?.status !== 'completed' || rounds.length === 0) return null
    const final = rounds[rounds.length - 1].matches[0]
    return final?.winner || null
  }, [tournament, rounds])

  const act = async (fn) => {
    setError(null)
    setBusy(true)
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (loading && !tournament) {
    return (
      <div className="panel">
        <div className="panel-header">
          <button className="link-btn" onClick={onBack}>← Back</button>
        </div>
        <p className="muted">Loading tournament…</p>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="panel">
        <div className="panel-header">
          <button className="link-btn" onClick={onBack}>← Back</button>
        </div>
        <p className="muted">This tournament couldn’t be found.</p>
      </div>
    )
  }

  const meta = sportMeta(tournament.sport)
  const count = participants.length
  const isOpen = tournament.status === 'open'
  const full = count >= tournament.max_players

  return (
    <div className="panel">
      <div className="panel-header">
        <button className="link-btn" onClick={onBack}>← All tournaments</button>
        <button className="icon-btn" onClick={onBack} aria-label="Close">✕</button>
      </div>

      <h2 className="tourn-title">
        <span className="sport-emoji" aria-hidden="true">{meta.emoji}</span> {tournament.name}
      </h2>
      <div className="badges">
        <span className="badge">{meta.label}</span>
        <span className={`badge status-${tournament.status}`}>
          {tournament.status === 'open'
            ? 'Sign-ups open'
            : tournament.status === 'in_progress'
            ? 'In progress'
            : 'Completed'}
        </span>
        <span className="badge">{count}/{tournament.max_players} players</span>
        {tournament.prize && <span className="badge badge-open">🏆 {tournament.prize}</span>}
        {tournament.visibility === 'invite' && <span className="badge">🔒 Invite only</span>}
      </div>

      {tournament.visibility === 'invite' && (
        <button className="btn btn-ghost btn-block" onClick={copyInvite}>
          {copied ? '✓ Link copied' : '🔗 Copy invite link'}
        </button>
      )}

      {tournament.latitude != null && tournament.longitude != null && (
        <p className="panel-sub">
          📍{' '}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${tournament.latitude},${tournament.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Directions ↗
          </a>
        </p>
      )}

      {tournament.note && <p className="game-note">“{tournament.note}”</p>}

      {error && <p className="form-error">{error}</p>}

      {champion && (
        <div className="tourn-champion">
          🏆 <strong>{champion.name || 'Player'}</strong> wins the tournament!
        </div>
      )}

      {isOpen ? (
        <>
          <div className="participants">
            <h3>Players in ({count})</h3>
            {count === 0 ? (
              <p className="muted">No one’s signed up yet — be the first!</p>
            ) : (
              <ul className="participant-list">
                {participants.map((p) => (
                  <li key={p.user_id}>
                    <span className="avatar" aria-hidden="true">{initial(p.profiles?.name)}</span>
                    {p.profiles?.name || 'Player'}
                    {p.user_id === tournament.host_id && <span className="host-tag">host</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!user ? (
            <p className="muted center">Log in to join this tournament.</p>
          ) : joined ? (
            <button
              className="btn btn-ghost btn-block"
              onClick={() => act(() => leaveTournament(tournamentId, user.id))}
              disabled={busy}
            >
              Leave tournament
            </button>
          ) : (
            <button
              className="btn btn-primary btn-block"
              onClick={() => act(() => joinTournament(tournamentId, user.id))}
              disabled={busy || full}
            >
              {full ? 'Tournament full' : 'Join tournament'}
            </button>
          )}

          {isHost && (
            <button
              className="btn btn-primary btn-block tourn-start"
              onClick={() => act(() => startTournament(tournamentId))}
              disabled={busy || count < 2}
              title={count < 2 ? 'Need at least 2 players' : 'Generate the bracket and lock sign-ups'}
            >
              {count < 2 ? 'Need 2+ players to start' : `Start tournament (${count} players)`}
            </button>
          )}
        </>
      ) : (
        <div className="bracket-scroll">
          <div className="bracket">
            {rounds.map(({ round, matches: ms }) => (
              <div className="bracket-round" key={round}>
                <h3 className="bracket-round-title">{roundLabel(round, rounds.length)}</h3>
                <div className="bracket-round-matches">
                  {ms.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      isHost={isHost && tournament.status === 'in_progress'}
                      onReport={reportScore}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
