import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGames, useFilteredGames } from './hooks/useGames'
import { TIME_WINDOWS, reliabilityDisplay } from './lib/constants'
import MapView from './components/MapView'
import FilterBar from './components/FilterBar'
import AuthModal from './components/AuthModal'
import CreateGameForm from './components/CreateGameForm'
import EditGameForm from './components/EditGameForm'
import GameDetailPanel from './components/GameDetailPanel'
import MyGamesPanel from './components/MyGamesPanel'
import Spinner from './components/Spinner'

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { games, loading, error, joinGame, leaveGame, createGame, updateGame, deleteGame } =
    useGames()

  const [filters, setFilters] = useState({
    sport: 'all',
    skill: 'all',
    timeWindow: TIME_WINDOWS[0],
  })
  const filtered = useFilteredGames(games, filters)

  const [selectedGameId, setSelectedGameId] = useState(null)
  const [createMode, setCreateMode] = useState(false)
  const [pin, setPin] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [showMyGames, setShowMyGames] = useState(false)
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
              <span className="who">
                Hi, {profile?.name || 'Player'}
                {profile && !reliabilityDisplay(profile.reliability_score).isNew && (
                  <span className="who-score" title="Your reliability score">
                    {' '}⭐ {reliabilityDisplay(profile.reliability_score).label}
                  </span>
                )}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowMyGames(true)}>
                My games
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

      <FilterBar filters={filters} onChange={setFilters} resultCount={filtered.length} />

      <main className="map-area">
        <MapView
          games={filtered}
          selectedGameId={selectedGameId}
          createMode={createMode}
          pin={pin}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
        />

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
            <p className="empty-emoji">🥅</p>
            <p className="empty-title">No games near you yet</p>
            <p className="muted">Be the first — drop a pin and start one.</p>
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

        {/* Floating create button */}
        {!createMode && !selectedGame && (
          <button className="fab" onClick={handleStartCreate} aria-label="Create a game">
            <span aria-hidden="true">＋</span> New game
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
            onSelect={handleSelectFromMyGames}
            onClose={() => setShowMyGames(false)}
          />
        </div>
      )}

      {showAuth && <AuthModal initialMode={authMode} onClose={() => setShowAuth(false)} />}
    </div>
  )
}
