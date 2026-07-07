// Lightweight inline SVG icons. All use currentColor and stroke-based drawing
// so they stay crisp at any size with zero image payload.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function PinLogo({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        {...base}
        fill="currentColor"
        stroke="none"
        d="M12 2c-3.87 0-7 3.02-7 6.75 0 4.79 5.34 11.06 6.42 12.28a.78.78 0 0 0 1.16 0C13.66 19.81 19 13.54 19 8.75 19 5.02 15.87 2 12 2Z"
      />
      <circle cx="12" cy="8.6" r="2.4" fill="#fff" />
    </svg>
  )
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

/* --- Sport icons ---------------------------------------------------------- */
export function SportFootball({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M12 7.5l3.2 2.3-1.2 3.8h-4l-1.2-3.8L12 7.5Z" />
      <path {...base} d="M12 3v2m6.4 2.3-1.7 1.2M21 12l-2 .3M18.4 16.7l-1.5-1.2M12 21v-2m-6.4 1.7 1.5-1.2M3 12l2 .3M5.6 7.3l1.7 1.2" />
    </svg>
  )
}

export function SportBasketball({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M12 3v18M3 12h18" />
      <path {...base} d="M5.6 5.6C8 8 8 16 5.6 18.4M18.4 5.6C16 8 16 16 18.4 18.4" />
    </svg>
  )
}

export function SportTennis({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="9" />
      <path {...base} d="M4.6 6.2C8 8.5 8.6 15 6 19M19.4 6.2C16 8.5 15.4 15 18 19" />
    </svg>
  )
}

export function SportCricket({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M14.5 4.5l5 5-8.5 8.5-5-5 8.5-8.5Z" />
      <path {...base} d="M9.5 9.5l5 5" />
      <circle {...base} cx="6" cy="18" r="2.4" />
    </svg>
  )
}

export function SportBadminton({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M14 4a3 3 0 0 1 3 3l-2.5 8.5-6-6L14 4Z" />
      <path {...base} d="M8.5 9.5l6 6" />
      <circle {...base} cx="6.5" cy="17.5" r="2.6" />
      <path {...base} d="M11.5 6.5l3 3M13 5l3.5 3.5M10 8l3 3" />
    </svg>
  )
}

export function SportPickleball({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect {...base} x="3.5" y="3" width="9" height="11" rx="4.2" />
      <path {...base} d="M8 14v4.5" />
      <path {...base} d="M6.4 18.6h3.2" />
      <circle {...base} cx="17.5" cy="10" r="3" />
      <path {...base} d="M17.5 8.7h0M16.3 10.6h0M18.7 10.6h0" />
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
