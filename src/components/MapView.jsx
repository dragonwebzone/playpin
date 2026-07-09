import { useEffect, useRef } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import { useTheme } from '../hooks/useTheme'
import { DEFAULT_CENTER, DEFAULT_ZOOM, sportMeta } from '../lib/constants'
import Spinner from './Spinner'

// Declutter the base map to focus on places where pickup games happen: hide all
// POI labels, then re-enable parks and sports complexes. (Applies only without a
// cloud mapId; this map uses default styling, so JSON styles take effect.)
const DECLUTTER = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.sports_complex', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi.attraction', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
]

// Light map = default base tiles + declutter.
const LIGHT_MAP_STYLES = DECLUTTER

// Dark map = Google's "night mode" palette + the same declutter rules, so the
// map matches the app's dark theme.
const DARK_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1d2739' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2739' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b98ad' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#b4c0d4' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1f3d33' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3648' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#161f2e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a4a63' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#121a27' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#d5deeb' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a2b' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4b5a70' }] },
  { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#0e1a2b' }] },
  ...DECLUTTER,
]

// Full-screen Google Map. Renders a marker per game, an optional "drop pin"
// marker in create mode, and reports clicks upward.
export default function MapView({
  games,
  selectedGameId,
  createMode,
  pin,
  userLocation,
  onMapClick,
  onMarkerClick,
  mapRef,
  onMapsReady,
}) {
  const { maps, loading, error } = useGoogleMaps()
  const { isDark } = useTheme()
  const containerRef = useRef(null)
  const markersRef = useRef(new Map()) // gameId -> google.maps.Marker
  const pinMarkerRef = useRef(null)
  const meMarkerRef = useRef(null)
  const clickHandlerRef = useRef(onMapClick)
  clickHandlerRef.current = onMapClick

  // Hand the loaded Maps API up to the parent, which hosts the place-search
  // and recenter controls in the control bar / map-control group.
  useEffect(() => {
    if (maps) onMapsReady?.(maps)
  }, [maps, onMapsReady])

  // Initialize the map once Google Maps is ready.
  useEffect(() => {
    if (!maps || mapRef.current || !containerRef.current) return

    const map = new maps.Map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: true,
      zoomControl: false,
      clickableIcons: false,
      gestureHandling: 'greedy',
      styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES,
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

  // Repaint the map palette when the light/dark theme changes.
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setOptions({ styles: isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES })
    }
  }, [isDark])

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

    const iconFor = (game, meta) => {
      const selected = game.id === selectedGameId
      return {
        path: maps.SymbolPath.CIRCLE,
        scale: selected ? 20 : 16,
        fillColor: meta.color,
        fillOpacity: 1,
        strokeColor: selected ? '#f97316' : '#ffffff',
        strokeWeight: selected ? 4 : 2.5,
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
          icon: iconFor(game, meta),
          zIndex: game.id === selectedGameId ? 999 : 1,
        })
        marker.addListener('click', () => onMarkerClick(game))
        existing.set(game.id, marker)
      } else {
        marker.setPosition(position)
        marker.setIcon(iconFor(game, meta))
        marker.setZIndex(game.id === selectedGameId ? 999 : 1)
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

  // Render a "you are here" dot at the user's location so nearby games have a
  // clear point of reference.
  useEffect(() => {
    if (!maps || !mapRef.current) return
    if (!userLocation) {
      if (meMarkerRef.current) {
        meMarkerRef.current.setMap(null)
        meMarkerRef.current = null
      }
      return
    }
    const icon = {
      path: maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: '#2563eb',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3,
    }
    if (!meMarkerRef.current) {
      meMarkerRef.current = new maps.Marker({
        map: mapRef.current,
        position: userLocation,
        title: 'You are here',
        icon,
        zIndex: 500,
      })
    } else {
      meMarkerRef.current.setPosition(userLocation)
    }
  }, [maps, userLocation])

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
      {loading && <Spinner label="Loading map…" overlay />}
    </div>
  )
}
