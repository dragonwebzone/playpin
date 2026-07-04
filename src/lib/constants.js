// Shared option lists and defaults used across the app.

export const SPORTS = [
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'other', label: 'Other', emoji: '🤾' },
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

// Fallback map center when geolocation is unavailable or denied.
// San Francisco — matches the coordinates used in supabase/seed.sql.
export const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 }
export const DEFAULT_ZOOM = 12

export const sportMeta = (value) =>
  SPORTS.find((s) => s.value === value) || { value, label: value, emoji: '🏅' }

export const skillLabel = (value) =>
  (SKILL_LEVELS.find((s) => s.value === value) || { label: value }).label
