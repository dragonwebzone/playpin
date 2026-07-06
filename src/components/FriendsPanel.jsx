import { useEffect, useState } from 'react'
import { levelFromXp } from '../lib/constants'

function Avatar({ name }) {
  return <span className="fr-avatar">{(name || '?').charAt(0).toUpperCase()}</span>
}

// Friends hub with three sub-tabs: your friends, an add-friend search, and
// pending requests (incoming + sent). Backed by the useFriends hook.
export default function FriendsPanel({ friendsApi, onClose }) {
  const {
    friends,
    incoming,
    outgoing,
    relationByUser,
    sendRequest,
    acceptRequest,
    removeFriendship,
    searchUsers,
  } = friendsApi

  const [tab, setTab] = useState('friends') // 'friends' | 'add' | 'requests'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState(null)

  const pendingCount = incoming.length

  // Debounced user search (only runs while the Add tab is open).
  useEffect(() => {
    if (tab !== 'add' || !query.trim()) {
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
  }, [tab, query, searchUsers])

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

      <div className="subtabs" role="tablist" aria-label="Friends sections">
        <button
          role="tab"
          aria-selected={tab === 'friends'}
          className={`subtab ${tab === 'friends' ? 'is-active' : ''}`}
          onClick={() => setTab('friends')}
        >
          Friends {friends.length > 0 && <span className="subtab-count">{friends.length}</span>}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'add'}
          className={`subtab ${tab === 'add' ? 'is-active' : ''}`}
          onClick={() => setTab('add')}
        >
          Add friend
        </button>
        <button
          role="tab"
          aria-selected={tab === 'requests'}
          className={`subtab ${tab === 'requests' ? 'is-active' : ''}`}
          onClick={() => setTab('requests')}
        >
          Requests
          {pendingCount > 0 && <span className="subtab-count subtab-count--alert">{pendingCount}</span>}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* ------------------------------------------------------- Friends -- */}
      {tab === 'friends' && (
        <section className="fr-section">
          <div className="fr-section-head">
            <h3>Your friends ({friends.length})</h3>
            <button className="btn btn-primary btn-xs" onClick={() => setTab('add')}>
              ＋ Add friend
            </button>
          </div>
          {friends.length === 0 ? (
            <p className="muted">
              No friends yet — tap <strong>Add friend</strong> to search for players and connect.
            </p>
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
      )}

      {/* ---------------------------------------------------- Add friend -- */}
      {tab === 'add' && (
        <section className="fr-section">
          <label className="field">
            <span>Search players</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search players by name…"
              autoFocus
            />
          </label>

          {query.trim() && results.length === 0 && (
            <p className="muted">No players found matching “{query.trim()}”.</p>
          )}

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
        </section>
      )}

      {/* ----------------------------------------------------- Requests -- */}
      {tab === 'requests' && (
        <>
          <section className="fr-section">
            <h3>Incoming ({incoming.length})</h3>
            {incoming.length === 0 ? (
              <p className="muted">No incoming requests right now.</p>
            ) : (
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
            )}
          </section>

          <section className="fr-section">
            <h3>Sent ({outgoing.length})</h3>
            {outgoing.length === 0 ? (
              <p className="muted">You haven't sent any requests.</p>
            ) : (
              <ul className="fr-list">
                {outgoing.map((u) => (
                  <li key={u.row.id} className="fr-row">
                    <Avatar name={u.name} />
                    <span className="fr-name">
                      {u.name} <span className="fr-tag">Pending</span>
                    </span>
                    <button
                      className="btn btn-ghost btn-xs"
                      disabled={busyId === u.row.id}
                      onClick={() => act(() => removeFriendship(u.row.id), u.row.id)}
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
