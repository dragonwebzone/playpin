import { useMemo, useState } from 'react'
import { useAuth } from './context/AuthContext'
import { useGames, useFilteredGames } from './hooks/useGames'
import { TIME_WINDOWS } from './lib/constants'
import MapView from './components/MapView'
import FilterBar from './components/FilterBar'
import AuthModal from './components/AuthModal'
import CreateGameForm from './components/CreateGameForm'
import GameDetailPanel from './components/GameDetailPanel'
import Spinner from './components/Spinner'

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const { games, loading, error, joinGame, leaveGame, createGame } = useGames()

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

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )

  const closePanels = () => {
    setSelectedGameId(null)
    setCreateMode(false)
    setPin(null)
  }

  const handleStartCreate = () => {
    if (!user) {
      setShowAuth(true)
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
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">📍</span>
          <span className="brand-name">playpin</span>
        </div>
        <div className="topbar-actions">
          {authLoading ? null : user ? (
            <>
              <span className="who">
                Hi, {profile?.name || 'Player'}
                {profile && (
                  <span className="who-score" title="Your reliability score">
                    {' '}⭐ {profile.reliability_score}
                  </span>
                )}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={signOut}>
                Log out
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => setShowAuth(true)}>
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

      {selectedGame && (
        <div className="sheet">
          <GameDetailPanel
            game={selectedGame}
            onClose={closePanels}
            onJoin={joinGame}
            onLeave={leaveGame}
            onRequireAuth={() => setShowAuth(true)}
          />
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
