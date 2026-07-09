// App-chrome icons — same stroke-based language as the landing icons so the
// product and marketing surfaces feel like one brand. All use currentColor and
// scale cleanly with font-size (width/height:1em via .ic in CSS).

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function IconUsers({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="9" cy="8" r="3.2" />
      <path {...base} d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path {...base} d="M16 5.2a3.2 3.2 0 0 1 0 6" />
      <path {...base} d="M17 14.4a5.5 5.5 0 0 1 3.5 5.1" />
    </svg>
  )
}

export function IconTrophy({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path {...base} d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5C3 10 5 11 7 11" />
      <path {...base} d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5C21 10 19 11 17 11" />
      <path {...base} d="M12 13v3.5M9 20h6M9.5 20a2.5 2.5 0 0 1 2.5-2.5 2.5 2.5 0 0 1 2.5 2.5" />
    </svg>
  )
}

// Tournament bracket — reads as competition without the aggressive crossed-swords.
export function IconBracket({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M4 5h4v5h4M4 15h4v-5" />
      <path {...base} d="M12 10h4V6M12 10h4v8h-4" />
      <path {...base} d="M16 14h4" />
    </svg>
  )
}

export function IconPlus({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} strokeWidth="2" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconPencil({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M13.5 6.5l4 4" />
      <path {...base} d="M4 20l1-4L16 5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
    </svg>
  )
}

export function IconChevronRight({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path {...base} d="M9 6l6 6-6 6" />
    </svg>
  )
}

// Appearance / theme row label.
export function IconSun({ className = 'ic' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle {...base} cx="12" cy="12" r="4" />
      <path {...base} d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19" />
    </svg>
  )
}

// Sport glyphs — reuse the landing's stroke sport icons so a game reads the same
// on the map as it does in marketing. Falls back to a generic target for
// unknown / "other" sports.
import {
  SportFootball,
  SportBasketball,
  SportTennis,
  SportCricket,
  SportBadminton,
  SportPickleball,
  IconTarget,
} from '../landing/components/icons'

const SPORT_ICONS = {
  football: SportFootball,
  basketball: SportBasketball,
  tennis: SportTennis,
  cricket: SportCricket,
  badminton: SportBadminton,
  pickleball: SportPickleball,
}

export function SportIcon({ sport, className = '' }) {
  const Glyph = SPORT_ICONS[sport] || IconTarget
  return <Glyph className={className} />
}

// Friendly, on-brand empty state — a location pin with a spark, not a soccer ball.
export function IconPinSpark({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M24 43s13-11.5 13-21a13 13 0 1 0-26 0c0 9.5 13 21 13 21Z"
      />
      <circle cx="24" cy="21" r="4.6" fill="none" stroke="currentColor" strokeWidth="2.25" />
    </svg>
  )
}
