import { useEffect, useState } from 'react'
import { levelFromXp } from '../lib/constants'

function Avatar({ name }) {
  return <span className="fr-avatar">{(name || '?').charAt(0).toUpperCase()}</span>
}

// Friends hub: incoming requests, your friends, and a search to add new ones.
export default function FriendsPanel({ friendsApi, onClose }) {
  const { friends, incoming, outgoing, relationByUser, sendRequest, acceptRequest, removeFriendship, searchUsers } =
    friendsApi
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  // Debounced user search.
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        setResults(await searchUsers(query))
      } catch {
        setResults([])
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query, searchUsers])

  const act = async (fn, id) => {
    setError(null)
    setBusyId(id)
    try {
      await fn()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const relationLabel = (uid) => {
    const rel = relationByUser.get(uid)
    if (!rel) return null
    if (rel.status === 'accepted') return 'Friends'
    if (rel.status === 'outgoing') return 'Requested'
    if (rel.status === 'incoming') return 'Wants to connect'
    return null
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>👥 Friends</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>

      {/* Add friends */}
      <label className="field">
        <span>Add friends</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players by name…"
        />
      </label>

      {results.length > 0 && (
        <ul className="fr-list">
          {results.map((u) => {
            const rel = relationLabel(u.id)
            return (
              <li key={u.id} className="fr-row">
                <Avatar name={u.name} />
                <span className="fr-name">
                  {u.name} <span className="fr-lv">Lv {levelFromXp(u.xp).level}</span>
                </span>
                {rel ? (
                  <span className="fr-tag">{rel}</span>
                ) : (
                  <button
                    className="btn btn-primary btn-xs"
                    disabled={busyId === u.id}
                    onClick={() => act(() => sendRequest(u.id), u.id)}
                  >
                    Add
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {error && <p className="form-error">{error}</p>}

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <section className="fr-section">
          <h3>Requests ({incoming.length})</h3>
          <ul className="fr-list">
            {incoming.map((u) => (
              <li key={u.row.id} className="fr-row">
                <Avatar name={u.name} />
                <span className="fr-name">{u.name}</span>
                <div className="fr-actions">
                  <button
                    className="btn btn-primary btn-xs"
                    disabled={busyId === u.row.id}
                    onClick={() => act(() => acceptRequest(u.row.id), u.row.id)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    disabled={busyId === u.row.id}
                    onClick={() => act(() => removeFriendship(u.row.id), u.row.id)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Friends list */}
      <section className="fr-section">
        <h3>Your friends ({friends.length})</h3>
        {friends.length === 0 ? (
          <p className="muted">No friends yet — search above to connect with players.</p>
        ) : (
          <ul className="fr-list">
            {friends.map((u) => (
              <li key={u.row.id} className="fr-row">
                <Avatar name={u.name} />
                <span className="fr-name">
                  {u.name} <span className="fr-lv">Lv {levelFromXp(u.xp).level}</span>
                </span>
                <button
                  className="btn btn-ghost btn-xs"
                  disabled={busyId === u.row.id}
                  onClick={() => act(() => removeFriendship(u.row.id), u.row.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {outgoing.length > 0 && (
        <p className="muted fr-pending">Pending sent: {outgoing.map((u) => u.name).join(', ')}</p>
      )}
    </div>
  )
}
