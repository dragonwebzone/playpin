import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGames, useFilteredGames } from './hooks/useGames'
import { useFriends } from './hooks/useFriends'
import { useSaved } from './hooks/useSaved'
import { usePresence } from './hooks/usePresence'
import { TIME_WINDOWS, RADIUS_OPTIONS, sportMeta } from './lib/constants'
import MapView from './components/MapView'
import FilterBar from './components/FilterBar'
import PlaceSearch from './components/PlaceSearch'
import CreateGameForm from './components/CreateGameForm'
import EditGameForm from './components/EditGameForm'
import GameDetailPanel from './components/GameDetailPanel'
import ProfilePanel from './components/ProfilePanel'
import Topbar from './components/Topbar'
import NearbyGamesSheet from './components/NearbyGamesSheet'
import ActivityToast from './components/ActivityToast'
import Spinner from './components/Spinner'
import { IconPlus, IconPinSpark } from './components/icons'

export default function App() {
  const { user, profile, loading: authLoading } = useAuth()

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

  // The user's location — drives distance sorting in the nearby sheet and the
  // "near me" radius filter. The map component handles its own centering.
  const [userLocation, setUserLocation] = useState(null)
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  const [filters, setFilters] = useState({
    sport: 'all',
    skill: 'all',
    timeWindow: TIME_WINDOWS[0],
    radius: RADIUS_OPTIONS[0],
    friendsOnly: false,
  })
  const effectiveFilters = useMemo(
    () => ({
      ...filters,
      friendIds: friendsApi.friendIds,
      radiusKm: filters.radius?.km,
      userLocation,
    }),
    [filters, friendsApi.friendIds, userLocation]
  )
  const filtered = useFilteredGames(games, effectiveFilters)

  const [selectedGameId, setSelectedGameId] = useState(null)
  const [createMode, setCreateMode] = useState(false)
  const [pin, setPin] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [editingGameId, setEditingGameId] = useState(null)

  // The map instance and loaded Maps API live here now so the place-search and
  // recenter controls can sit in the control bar / map-control group (outside
  // the map canvas) rather than floating on the map.
  const mapRef = useRef(null)
  const [mapsApi, setMapsApi] = useState(null)
  const handleMapsReady = useCallback((maps) => setMapsApi(maps), [])

  // Auth now lives on the landing page. Logged-out visitors are redirected
  // there by the guard below; requireAuth is a fallback for the brief window
  // before auth resolves (e.g. tapping a button during initial load).
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const requireAuth = () => navigate('/?auth=login')

  // Open the profile sheet when arriving via ?profile=1 (the corner avatar on
  // the section pages deep-links here), then strip the param.
  useEffect(() => {
    if (searchParams.get('profile') === '1') {
      setShowProfile(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const firstName = (profile?.name || '').trim().split(/\s+/)[0] || 'there'

  const selectedGame = useMemo(
    () => games.find((g) => g.id === selectedGameId) || null,
    [games, selectedGameId]
  )
  const editingGame = useMemo(
    () => games.find((g) => g.id === editingGameId) || null,
    [games, editingGameId]
  )

  // The empty-state card carries its own "Create a game" CTA, so we suppress the
  // floating FAB while it's showing — only ever one create affordance on screen.
  const showEmptyState = !loading && !error && filtered.length === 0 && !createMode

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

  const handleSelectFromProfile = (gameId) => {
    setShowProfile(false)
    setSelectedGameId(gameId)
  }

  const handleStartCreate = () => {
    if (!user) {
      requireAuth()
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

  // The app is for signed-in users. Once auth resolves, a missing user (e.g.
  // right after logging out) is sent to the landing page — carrying any ?auth
  // intent so a login/signup deep-link opens there.
  if (!authLoading && !user) {
    const intent = searchParams.get('auth')
    return <Navigate to={intent ? `/?auth=${intent}` : '/'} replace />
  }

  return (
    <div className="app">
      <Topbar
        incomingCount={friendsApi.incoming.length}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* Single control-bar row: place search + presence, with the Filters
          button on the right. The only chrome between the navbar and the map. */}
      <div className="controlbar">
        {mapsApi ? (
          <PlaceSearch
            maps={mapsApi}
            mapRef={mapRef}
            createMode={createMode}
            onDropPin={(coords) => handleMapClick(coords)}
          />
        ) : (
          <div className="map-search">
            <div className="map-search-box">
              <span className="map-search-icon" aria-hidden="true">🔍</span>
              <input
                className="map-search-input"
                type="text"
                disabled
                placeholder="Search a place or address…"
                aria-label="Search for a place"
              />
            </div>
          </div>
        )}
        {online > 0 && (
          <div className="online-chip" title="Players online right now">
            <span className="presence-dot" aria-hidden="true" />
            {online} <span className="online-word">online</span>
          </div>
        )}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
          hasFriends={friendsApi.friendIds.size > 0}
          hasLocation={!!userLocation}
        />
      </div>

      <main className="map-area">
        <MapView
          games={filtered}
          selectedGameId={selectedGameId}
          createMode={createMode}
          pin={pin}
          userLocation={userLocation}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          mapRef={mapRef}
          onMapsReady={handleMapsReady}
        />

        {/* Create-mode hint banner */}
        {createMode && !pin && (
          <div className="hint-banner">
            <span>Tap the map to drop your pin</span>
            <button className="link-btn" onClick={closePanels}>Cancel</button>
          </div>
        )}

        {/* Empty state when there are games loaded but none match / none exist.
            The create affordance is the corner FAB below, so this card stays
            informational and points to it. */}
        {showEmptyState && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <IconPinSpark />
            </span>
            <p className="empty-title">Your move, {firstName}</p>
            <p className="muted">
              No games nearby yet — tap <strong>Create game</strong> and players will find you.
            </p>
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
          !showProfile && (
          <NearbyGamesSheet
            games={filtered}
            userLocation={userLocation}
            selectedGameId={selectedGameId}
            onSelect={(id) => setSelectedGameId(id)}
            firstName={firstName}
          />
        )}

        {/* The single create affordance: a FAB anchored in the bottom-right
            corner. It drops lower when there's no bottom sheet (no nearby
            games) so it sits snug in the corner. */}
        {!createMode && !selectedGame && (
          <button
            className={`fab ${filtered.length === 0 ? 'fab--corner' : ''}`}
            onClick={handleStartCreate}
            aria-label="Create a game"
          >
            <IconPlus className="ic fab-ic" /> Create game
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
            onRequireAuth={requireAuth}
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

      {showProfile && (
        <div className="sheet">
          <ProfilePanel
            games={games}
            savedIds={savedIds}
            onSelect={handleSelectFromProfile}
            onClose={() => setShowProfile(false)}
            onOpenFriends={() => navigate('/app/friends')}
            onOpenLeaderboard={() => navigate('/app/leaderboard')}
            incomingCount={friendsApi.incoming.length}
          />
        </div>
      )}
    </div>
  )
}
