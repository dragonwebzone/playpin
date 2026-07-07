// Shared option lists and defaults used across the app.

export const SPORTS = [
  { value: 'football', label: 'Football', emoji: '⚽', color: '#16a34a' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏', color: '#d97706' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸', color: '#7c3aed' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀', color: '#ea580c' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾', color: '#65a30d' },
  { value: 'pickleball', label: 'Pickleball', emoji: '🏓', color: '#2563eb' },
  { value: 'other', label: 'Other', emoji: '🤾', color: '#0f766e' },
]

export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'casual', label: 'Casual' },
  { value: 'competitive', label: 'Competitive' },
]

// Time-window filter options. `hours` is used to compute the upper bound;
// null means "no upper bound" (all upcoming games).
export const TIME_WINDOWS = [
  { value: 'all', label: 'Any time', hours: null },
  { value: '2h', label: 'Next 2 hours', hours: 2 },
  { value: 'today', label: 'Today', hours: null, sameDay: true },
  { value: 'week', label: 'This week', hours: 24 * 7 },
]

// "Near me" radius options. `km` is the max distance from the user's location.
// 50 km is the widest option and the default — games are always limited to
// within 50 km of the user (see MAX_RADIUS_KM in useGames). Only usable once we
// have the user's location, so the picker is hidden until geolocation resolves.
export const RADIUS_OPTIONS = [
  { value: '50', label: 'Within 50 km', km: 50 },
  { value: '25', label: 'Within 25 km', km: 25 },
  { value: '10', label: 'Within 10 km', km: 10 },
  { value: '5', label: 'Within 5 km', km: 5 },
  { value: '2', label: 'Within 2 km', km: 2 },
]

// Fallback map center when geolocation is unavailable or denied.
// San Francisco — matches the coordinates used in supabase/seed.sql.
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }
export const DEFAULT_ZOOM = 12

export const sportMeta = (value) =>
  SPORTS.find((s) => s.value === value) || { value, label: value, emoji: '🏅', color: '#0f766e' }

// Haversine distance in km between two {lat, lng} points.
export function distanceKm(a, b) {
  if (!a || !b) return null
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Human-friendly distance label.
export function distanceLabel(km) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

// Short relative time like "in 2h", "in 3d", "started".
export function relativeWhen(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'now'
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `in ${hrs}h`
  const days = Math.round(hrs / 24)
  return `in ${days}d`
}

export const skillLabel = (value) =>
  (SKILL_LEVELS.find((s) => s.value === value) || { label: value }).label

// XP → level. XP is earned server-side (host a game +20, join +10). 100 XP/level.
export function levelFromXp(xp = 0) {
  const x = Math.max(0, Math.floor(xp || 0))
  const perLevel = 100
  const level = Math.floor(x / perLevel) + 1
  const intoLevel = x % perLevel
  return { level, xp: x, intoLevel, forNext: perLevel, progress: intoLevel / perLevel }
}

// Reliability is 100 by default and (for now) only ever decreases with no-shows.
// Until a player has an actual track record, showing "⭐ 100" reads as fake
// precision — so a clean/default 100 is presented as a neutral "New" badge and
// a real percentage only appears once it has moved.
export function reliabilityDisplay(score) {
  const n = typeof score === 'number' ? score : 100
  if (n >= 100) return { isNew: true, label: 'New', title: 'No track record yet' }
  return { isNew: false, label: `${n}% reliable`, title: `${n}% of games attended` }
}
