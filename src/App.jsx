import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useGames, useFilteredGames } from './hooks/useGames'
import { useFriends } from './hooks/useFriends'
import { useSaved } from './hooks/useSaved'
import { usePresence } from './hooks/usePresence'
import { TIME_WINDOWS, RADIUS_OPTIONS, sportMeta, levelFromXp } from './lib/constants'
import MapView from './components/MapView'
import FilterBar from './components/FilterBar'
import PlaceSearch from './components/PlaceSearch'
import CreateGameForm from './components/CreateGameForm'
import EditGameForm from './components/EditGameForm'
import GameDetailPanel from './components/GameDetailPanel'
import ProfilePanel from './components/ProfilePanel'
import Brand from './components/Brand'
import NearbyGamesSheet from './components/NearbyGamesSheet'
import ActivityToast from './components/ActivityToast'
import Leaderboard from './components/Leaderboard'
import FriendsPanel from './components/FriendsPanel'
import TournamentsPanel from './components/TournamentsPanel'
import Spinner from './components/Spinner'
import { IconUsers, IconTrophy, IconBracket, IconPlus, IconPinSpark } from './components/icons'

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
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showFriends, setShowFriends] = useState(false)
  const [showTournaments, setShowTournaments] = useState(false)
  const [editingGameId, setEditingGameId] = useState(null)

  // The map instance and loaded Maps API live here now so the place-search and
  // recenter controls can sit in the control bar / map-control group (outside
  // the map canvas) rather than floating on the map.
  const mapRef = useRef(null)
  const [mapsApi, setMapsApi] = useState(null)
  const handleMapsReady = useCallback((maps) => setMapsApi(maps), [])

  // Recenter the map on the user (or re-request their position if we don't have
  // it yet).
  const recenterOnMe = () => {
    const map = mapRef.current
    if (!map) return
    if (userLocation) {
      map.panTo(userLocation)
      map.setZoom(14)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          map.panTo(here)
          map.setZoom(14)
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }

  // Auth now lives on the landing page. Logged-out visitors are redirected
  // there by the guard below; requireAuth is a fallback for the brief window
  // before auth resolves (e.g. tapping a button during initial load).
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const requireAuth = () => navigate('/?auth=login')

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
      <header className="topbar">
        <Link to="/" className="brand-link" aria-label="playpin home">
          <Brand />
        </Link>
        <div className="topbar-actions">
          {authLoading ? null : user ? (
            <>
              <button
                className="profile-chip"
                onClick={() => setShowProfile(true)}
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
                <IconUsers />
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
                <IconTrophy />
              </button>
              <button
                className="icon-btn topbar-icon"
                onClick={() => setShowTournaments(true)}
                aria-label="Tournaments"
                title="Tournaments"
              >
                <IconBracket />
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={requireAuth}>
              Log in
            </button>
          )}
        </div>
      </header>

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

        {/* Empty state when there are games loaded but none match / none exist */}
        {showEmptyState && (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <IconPinSpark />
            </span>
            <p className="empty-title">Your move, {firstName}</p>
            <p className="muted">No games nearby yet — start one and players will find you.</p>
            <button className="btn btn-primary empty-cta" onClick={handleStartCreate}>
              <IconPlus className="ic btn-ic" /> Create a game
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
          !showProfile &&
          !showLeaderboard &&
          !showFriends &&
          !showTournaments && (
          <NearbyGamesSheet
            games={filtered}
            userLocation={userLocation}
            selectedGameId={selectedGameId}
            onSelect={(id) => setSelectedGameId(id)}
            firstName={firstName}
          />
        )}

        {/* Grouped bottom-right map controls: recenter + create, aligned as a
            pair. The empty-state card already offers a create CTA, so the FAB is
            hidden while it shows — leaving recenter as the lone control there. */}
        <div className="map-controls">
          {mapsApi && (
            <button
              className="locate-btn"
              onClick={recenterOnMe}
              aria-label="Center map on my location"
              title="Center on my location"
            >
              <span aria-hidden="true">◎</span>
            </button>
          )}
          {!createMode && !selectedGame && !showEmptyState && (
            <button className="fab" onClick={handleStartCreate} aria-label="Create a game">
              <IconPlus className="ic fab-ic" /> Create game
            </button>
          )}
        </div>
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
            onOpenFriends={() => {
              setShowProfile(false)
              setShowFriends(true)
            }}
            onOpenLeaderboard={() => {
              setShowProfile(false)
              setShowLeaderboard(true)
            }}
            incomingCount={friendsApi.incoming.length}
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

      {showTournaments && (
        <div className="sheet">
          <TournamentsPanel onClose={() => setShowTournaments(false)} />
        </div>
      )}
    </div>
  )
}
