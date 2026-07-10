// Lightweight inline SVG icons. All use currentColor and stroke-based drawing
// so they stay crisp at any size with zero image payload.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

/* --- How it works steps --------------------------------------------------- */
export function IconPin({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
      <circle {...base} cx="12" cy="10" r="2.5" />
    </svg>
  )
}

export function IconUsers({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="9" cy="8" r="3.2" />
      <path {...base} d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path {...base} d="M16 5.2a3.2 3.2 0 0 1 0 6" />
      <path {...base} d="M17 14.4a5.5 5.5 0 0 1 3.5 5.1" />
    </svg>
  )
}

export function IconPlay({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} fill="currentColor" d="M10 8.5v7l6-3.5-6-3.5Z" />
    </svg>
  )
}

/* --- Why PlayPin feature icons ------------------------------------------- */
export function IconTarget({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="8.5" />
      <circle {...base} cx="12" cy="12" r="4.5" />
      <circle {...base} cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  )
}

export function IconEye({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle {...base} cx="12" cy="12" r="2.75" />
    </svg>
  )
}

export function IconShield({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M12 3l7 2.5v5.5c0 4.7-3.1 8-7 10-3.9-2-7-5.3-7-10V5.5L12 3Z" />
      <path {...base} d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function IconRadar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M12 3a9 9 0 1 0 9 9" />
      <path {...base} d="M12 8a4 4 0 1 0 4 4" />
      <path {...base} d="M12 12 19 5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    </svg>
  )
}

/* --- Sport icons ----------------------------------------------------------
   Minimal single-stroke glyphs, each the clearest signifier of its sport:
   ball-primary sports use the ball (distinguished by seam pattern); racket/bat
   sports use their equipment. Shared by the landing strip and the app's map
   markers, so they read at small sizes too. */
export function SportFootball({ className = '' }) {
  // Soccer ball: central pentagon with seams running inward from the edge.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M12 8.7 15.14 10.98 13.94 14.67 10.06 14.67 8.86 10.98Z" />
      <path {...base} d="M12 8.7V4M15.14 10.98 19.6 9.5M13.94 14.67 16.7 18.5M10.06 14.67 7.3 18.5M8.86 10.98 4.4 9.5" />
    </svg>
  )
}

export function SportBasketball({ className = '' }) {
  // Basketball: cross seams plus the two curved side seams.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M12 3v18M3 12h18" />
      <path {...base} d="M5.2 6C8.5 9 8.5 15 5.2 18M18.8 6C15.5 9 15.5 15 18.8 18" />
    </svg>
  )
}

export function SportTennis({ className = '' }) {
  // Tennis ball: the twin curved seam only (no cross — reads apart from a
  // basketball).
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M4.8 6.5C8.6 9.4 8.6 14.6 4.8 17.5M19.2 6.5C15.4 9.4 15.4 14.6 19.2 17.5" />
    </svg>
  )
}

export function SportCricket({ className = '' }) {
  // Cricket: the wicket — three stumps with the bail, and the ball.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M7 5.5V17M11 5.5V17M15 5.5V17" />
      <path {...base} d="M6.2 5.5H15.8" />
      <circle {...base} cx="19.2" cy="16.2" r="1.9" />
    </svg>
  )
}

export function SportBadminton({ className = '' }) {
  // Badminton: the shuttlecock — cork base under a flared feather crown.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="16.8" r="2" />
      <path {...base} d="M10.3 15.6 8.4 8M13.7 15.6 15.6 8M12 15.4V7.4" />
      <path {...base} d="M8.4 8Q12 6 15.6 8" />
    </svg>
  )
}

export function SportPickleball({ className = '' }) {
  // Pickleball: rounded rectangular paddle with a short handle and the
  // perforated (wiffle) ball.
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect {...base} x="3.6" y="3.4" width="9" height="9.8" rx="3" />
      <path {...base} d="M8.1 13.2v4.4M6.3 17.6h3.6" />
      <circle {...base} cx="18" cy="9.6" r="2.9" />
      <path {...base} d="M16.8 8.5h0M19.2 8.5h0M18 10.8h0" />
    </svg>
  )
}

export function IconMenu({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function IconClose({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconArrow({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}
