import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { levelFromXp } from '../lib/constants'
import { useAuth } from '../context/AuthContext'

// Top players by XP. XP is awarded server-side (see supabase/gamification.sql).
export default function Leaderboard({ onClose }) {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    supabase
      .from('profiles')
      .select('id, name, xp, games_hosted, games_joined')
      .order('xp', { ascending: false })
      .limit(25)
      .then(({ data, error: err }) => {
        if (!active) return
        if (err) setError(true)
        else setRows(data || [])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>🏆 Leaderboard</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {error ? (
        <p className="muted">
          Leaderboard isn’t enabled yet. Run <code>supabase/gamification.sql</code> in the
          Supabase SQL editor to turn on XP.
        </p>
      ) : rows == null ? (
        <p className="muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="muted">No players yet — host or join a game to get on the board.</p>
      ) : (
        <ol className="lb-list">
          {rows.map((p, i) => {
            const { level } = levelFromXp(p.xp)
            const me = p.id === user?.id
            return (
              <li key={p.id} className={`lb-row ${me ? 'is-me' : ''}`}>
                <span className={`lb-rank rank-${i + 1 <= 3 ? i + 1 : 'n'}`}>{i + 1}</span>
                <span className="lb-avatar">{(p.name || '?').charAt(0).toUpperCase()}</span>
                <span className="lb-name">
                  {p.name || 'Player'}
                  {me && <span className="lb-you">you</span>}
                </span>
                <span className="lb-level">Lv {level}</span>
                <span className="lb-xp">{p.xp || 0} XP</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
