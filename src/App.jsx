import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGames, useFilteredGames } from './hooks/useGames'
import { useFriends } from './hooks/useFriends'
import { useSaved } from './hooks/useSaved'
import { usePresence } from './hooks/usePresence'
import { TIME_WINDOWS, sportMeta, levelFromXp } from './lib/constants'
import MapView from './components/MapView'
import FilterBar from './components/FilterBar'
import AuthModal from './components/AuthModal'
import CreateGameForm from './components/CreateGameForm'
import EditGameForm from './components/EditGameForm'
import GameDetailPanel from './components/GameDetailPanel'
import MyGamesPanel from './components/MyGamesPanel'
import NearbyGamesSheet from './components/NearbyGamesSheet'
import ActivityToast from './components/ActivityToast'
import Leaderboard from './components/Leaderboard'
import FriendsPanel from './components/FriendsPanel'
import Spinner from './components/Spinner'

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth()

  // Live-activity toasts, driven by real Realtime inserts (see useGames).
  const [activity, setActivity] = useState([])
  const pushActivity = (evt) => {
    let item
    if (evt.type === 'new_game') {
      if (user && evt.hostId === user.id) return // skip your own actions
      const meta = sportMeta(evt.sport)
      item = { id: crypto.randomUUID(), emoji: meta.emoji, text: `New ${meta.label} game created nearby` }
    } else if (evt.type === 'join') {
      if (user && evt.userId === user.id) return
      item = { id: crypto.randomUUID(), emoji: '🙌', text: 'Someone just joined a game' }
    }
    if (!item) return
    setActivity((cur) => [item, ...cur].slice(0, 3))
    setTimeout(() => setActivity((cur) => cur.filter((i) => i.id !== item.id)), 5000)
  }

  const { games, loading, error, joinGame, leaveGame, createGame, updateGame, deleteGame } =
    useGames({ onActivity: pushActivity })
  const friendsApi = useFriends(user?.id)
  const { savedIds, toggleSave } = useSaved(user?.id)
  const online = usePresence(user?.id)

  const [filters, setFilters] = useState({
    sport: 'all',
    skill: 'all',
    timeWindow: TIME_WINDOWS[0],
    friendsOnly: false,
  })
  const effectiveFilters = useMemo(
    () => ({ ...filters, friendIds: friendsApi.friendIds }),
    [filters, friendsApi.friendIds]
  )
  const filtered = useFilteredGames(games, effectiveFilters)

  // The user's location (for distance sorting in the nearby sheet). The map
  // component handles its own centering.
  const [userLocation, setUserLocation] = useState(null)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const [selectedGameId, setSelectedGameId] = useState(null)
  const [createMode, setCreateMode] = useState(false)
  const [pin, setPin] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showMyGames, setShowMyGames] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [editingGameId, setEditingGameId] = useState(null)

  // If we arrived from the landing page via /app?auth=signup|login, open the
  // auth modal in the requested mode (unless already signed in).
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    const intent = searchParams.get('auth')
    if ((intent === 'signup' || intent === 'login') && !user) {
      openAuth(intent)
    }
    if (intent) {
      // Clean the URL so a refresh doesn't reopen the modal.
      searchParams.delete('auth')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAuth = (mode = 'login') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )
  const editingGame = useMemo(
    () => games.find((g) => g.id === editingGameId) || null,
    [games, editingGameId]
  )

  const closePanels = () => {
    setSelectedGameId(null)
    setCreateMode(false)
    setPin(null)
    setEditingGameId(null)
  }

  const handleEditGame = (game) => {
    setSelectedGameId(null)
    setEditingGameId(game.id)
  }

  const handleDeleteGame = async (gameId) => {
    await deleteGame(gameId)
    closePanels()
  }

  const handleSelectFromMyGames = (gameId) => {
    setShowMyGames(false)
    setSelectedGameId(gameId)
  }

  const handleStartCreate = () => {
    if (!user) {
      openAuth('login')
      return
    }
    setSelectedGameId(null)
    setPin(null)
    setCreateMode(true)
  }

  const handleMapClick = (coords) => {
    if (createMode) setPin(coords)
    else setSelectedGameId(null)
  }

  const handleMarkerClick = (game) => {
    if (createMode) return
    setSelectedGameId(game.id)
  }

  const handleCreated = () => {
    closePanels()
  }

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">📍</span>
          <span className="brand-name">playpin</span>
        </Link>
        <div className="topbar-actions">
          {authLoading ? null : user ? (
            <>
              <button
                className="profile-chip"
                onClick={() => setShowMyGames(true)}
                title="My profile & games"
              >
                <span className="avatar-sm" aria-hidden="true">
                  {(profile?.name || 'P').charAt(0).toUpperCase()}
                </span>
                <span className="profile-meta">
                  <span className="profile-name">{profile?.name || 'Player'}</span>
                  <span className="profile-level">Lv {levelFromXp(profile?.xp).level}</span>
                </span>
              </button>
              <button
                className="icon-btn topbar-icon friends-btn"
                onClick={() => setShowFriends(true)}
                aria-label="Friends"
                title="Friends"
              >
                👥
                {friendsApi.incoming.length > 0 && (
                  <span className="notif-badge">{friendsApi.incoming.length}</span>
                )}
              </button>
              <button
                className="icon-btn topbar-icon"
                onClick={() => setShowLeaderboard(true)}
                aria-label="Leaderboard"
                title="Leaderboard"
              >
                🏆
              </button>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>
                Log out
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => openAuth('login')}>
              Log in
            </button>
          )}
        </div>
      </header>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        hasFriends={friendsApi.friendIds.size > 0}
      />

      <main className="map-area">
        <MapView
          games={filtered}
          selectedGameId={selectedGameId}
          createMode={createMode}
          pin={pin}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />

        {/* Real-time "players online" (Realtime Presence) */}
        {online > 0 && (
          <div className="presence-pill" title="Players online right now">
            <span className="presence-dot" aria-hidden="true" />
            {online} online
          </div>
        )}

        {/* Create-mode hint banner */}
        {createMode && !pin && (
          <div className="hint-banner">
            <span>Tap the map to drop your pin</span>
            <button className="link-btn" onClick={closePanels}>Cancel</button>
          </div>
        )}

        {/* Empty state when there are games loaded but none match / none exist */}
        {!loading && !error && filtered.length === 0 && !createMode && (
          <div className="empty-state">
            <p className="empty-emoji">⚽</p>
            <p className="empty-title">Nobody's playing nearby yet</p>
            <p className="muted">Be the first to start a game in your area.</p>
            <button className="btn btn-primary empty-cta" onClick={handleStartCreate}>
              ＋ Create a game
            </button>
          </div>
        )}

        {loading && (
          <div className="corner-loader">
            <Spinner label="Loading games…" />
          </div>
        )}

        {error && (
          <div className="empty-state">
            <p className="empty-title">Couldn't load games</p>
            <p className="muted">{error.message}</p>
          </div>
        )}

        {/* Live activity toasts */}
        <ActivityToast items={activity} />

        {/* Nearby games discovery sheet (hidden while a full panel is open) */}
        {!createMode &&
          !selectedGame &&
          !editingGame &&
          !showMyGames &&
          !showLeaderboard &&
          !showFriends && (
          <NearbyGamesSheet
            games={filtered}
            userLocation={userLocation}
            selectedGameId={selectedGameId}
            onSelect={(id) => setSelectedGameId(id)}
          />
        )}

        {/* Floating create button */}
        {!createMode && !selectedGame && (
          <button className="fab" onClick={handleStartCreate} aria-label="Create a game">
            <span aria-hidden="true">＋</span> Create game
          </button>
        )}
      </main>

      {/* Sliding bottom sheet / side panel */}
      {createMode && pin && (
        <div className="sheet">
          <CreateGameForm pin={pin} onCancel={closePanels} onCreate={async (g) => {
            await createGame(g)
            handleCreated()
          }} />
        </div>
      )}

      {selectedGame && !editingGame && (
        <div className="sheet">
          <GameDetailPanel
            game={selectedGame}
            onClose={closePanels}
            onJoin={joinGame}
            onLeave={leaveGame}
            onRequireAuth={() => openAuth('login')}
            onEdit={handleEditGame}
            onDelete={handleDeleteGame}
            isSaved={savedIds.has(selectedGame.id)}
            onToggleSave={toggleSave}
          />
        </div>
      )}

      {editingGame && (
        <div className="sheet">
          <EditGameForm
            game={editingGame}
            onCancel={closePanels}
            onSave={async (id, fields) => {
              await updateGame(id, fields)
              setEditingGameId(null)
              setSelectedGameId(id)
            }}
          />
        </div>
      )}

      {showMyGames && (
        <div className="sheet">
          <MyGamesPanel
            games={games}
            userId={user?.id}
            profile={profile}
            savedIds={savedIds}
            onSelect={handleSelectFromMyGames}
            onClose={() => setShowMyGames(false)}
          />
        </div>
      )}

      {showLeaderboard && (
        <div className="sheet">
          <Leaderboard onClose={() => setShowLeaderboard(false)} />
        </div>
      )}

      {showFriends && (
        <div className="sheet">
          <FriendsPanel friendsApi={friendsApi} onClose={() => setShowFriends(false)} />
        </div>
      )}

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}
    </div>
  )
}
