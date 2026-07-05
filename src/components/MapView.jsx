import { useEffect, useRef } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import { DEFAULT_CENTER, DEFAULT_ZOOM, sportMeta } from '../lib/constants'
import Spinner from './Spinner'
import PlaceSearch from './PlaceSearch'

// Declutter the base map to focus on places where pickup games happen: hide all
// POI labels, then re-enable parks and sports complexes. (Applies only without a
// cloud mapId; this map uses default styling, so JSON styles take effect.)
const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.attraction', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

// Full-screen Google Map. Renders a marker per game, an optional "drop pin"
// marker in create mode, and reports clicks upward.
export default function MapView({
  games,
  selectedGameId,
  createMode,
  pin,
  onMapClick,
  onMarkerClick,
}) {
  const { maps, loading, error } = useGoogleMaps()
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map()) // gameId -> google.maps.Marker
  const pinMarkerRef = useRef(null)
  const clickHandlerRef = useRef(onMapClick)
  clickHandlerRef.current = onMapClick
  // Latest create-mode value for use inside the Places listener closure.
  const createModeRef = useRef(createMode)
  createModeRef.current = createMode

  // Initialize the map once Google Maps is ready.
  useEffect(() => {
    if (!maps || mapRef.current || !containerRef.current) return

    const map = new maps.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: true,
      zoomControl: true,
      clickableIcons: false,
      gestureHandling: 'greedy',
      styles: MAP_STYLES,
    })
    mapRef.current = map

    map.addListener('click', (e) => {
      clickHandlerRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() })
    })

    // Center on the user's location if permitted; otherwise keep the default.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          map.setZoom(13)
        },
        () => {
          /* denied or unavailable — default center is fine */
        },
        { enableHighAccuracy: true, timeout: 8000 }
      )
    }
  }, [maps])

  // Swap the cursor in create mode so it's obvious you should click the map.
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({
        draggableCursor: createMode ? 'crosshair' : null,
      })
    }
  }, [createMode])

  // Sync game markers with the filtered games list.
  useEffect(() => {
    if (!maps || !mapRef.current) return
    const map = mapRef.current
    const existing = markersRef.current
    const nextIds = new Set(games.map((g) => g.id))

    // Remove markers for games no longer present.
    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        marker.setMap(null)
        existing.delete(id)
      }
    }

    // Add / update markers.
    for (const game of games) {
      const meta = sportMeta(game.sport)
      const position = { lat: game.latitude, lng: game.longitude }
      let marker = existing.get(game.id)
      if (!marker) {
        marker = new maps.Marker({
          position,
          map,
          title: `${meta.label} · ${new Date(game.date_time).toLocaleString()}`,
          label: { text: meta.emoji, fontSize: '18px' },
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 16,
            fillColor: game.id === selectedGameId ? '#f97316' : '#0f766e',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        })
        marker.addListener('click', () => onMarkerClick(game))
        existing.set(game.id, marker)
      } else {
        marker.setPosition(position)
        marker.setIcon({
          path: maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: game.id === selectedGameId ? '#f97316' : '#0f766e',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        })
      }
    }
  }, [maps, games, selectedGameId, onMarkerClick])

  // Render / move the temporary "drop pin" marker in create mode.
  useEffect(() => {
    if (!maps || !mapRef.current) return
    if (pin) {
      if (!pinMarkerRef.current) {
        pinMarkerRef.current = new maps.Marker({
          map: mapRef.current,
          position: pin,
          animation: maps.Animation.DROP,
          label: { text: '📍', fontSize: '22px' },
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 0,
            fillOpacity: 0,
            strokeOpacity: 0,
          },
        })
      } else {
        pinMarkerRef.current.setPosition(pin)
      }
    } else if (pinMarkerRef.current) {
      pinMarkerRef.current.setMap(null)
      pinMarkerRef.current = null
    }
  }, [maps, pin])

  if (error) {
    return (
      <div className="map-error">
        <p>🗺️ Couldn't load the map.</p>
        <p className="muted">
          Check that <code>VITE_GOOGLE_MAPS_API_KEY</code> is set and the Maps
          JavaScript API is enabled.
        </p>
      </div>
    )
  }

  return (
    <div className="map-root">
      <div ref={containerRef} className="map-canvas" />
      {!loading && maps && (
        <PlaceSearch
          maps={maps}
          mapRef={mapRef}
          createModeRef={createModeRef}
          onDropPin={(coords) => clickHandlerRef.current?.(coords)}
        />
      )}
      {loading && <Spinner label="Loading map…" overlay />}
    </div>
  )
}
