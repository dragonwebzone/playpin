import Reveal from '../lib/Reveal'
import './SportsStrip.css'

// Flat sport glyphs, local to this section (the shared Sport* icons power the
// app's map markers, so they're intentionally left untouched). Color comes from
// CSS `color` (currentColor) — never hardcoded per icon.
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Football() {
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <circle cx="16" cy="16" r="11.5" />
      <path d="M16 11.2 20 14.2 18.4 19.2 13.6 19.2 12 14.2 Z" />
      <path d="M16 11.2 16 5.2 M20 14.2 25.3 12.3 M18.4 19.2 21.5 24.2 M13.6 19.2 10.5 24.2 M12 14.2 6.7 12.3" />
    </svg>
  )
}

function Cricket() {
  // Wicket style: three stumps with the bails, plus the ball.
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <path d="M9.5 9.2V24M14 9.2V24M18.5 9.2V24" />
      <path d="M8.8 8.8H13.8M14.2 8.8H19.2" />
      <circle cx="24.3" cy="21.4" r="3" />
    </svg>
  )
}

function Badminton() {
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <circle cx="16" cy="25" r="2.4" />
      <path d="M13.9 23 10 9.5c-.2-.8.5-1.5 1.3-1.2l4.7 1.7 4.7-1.7c.8-.3 1.5.4 1.3 1.2L18.1 23" />
      <path d="M13.4 21.3 12.3 9.6M16 20.8 16 8.9M18.6 21.3 19.7 9.6" />
    </svg>
  )
}

function Basketball() {
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <circle cx="16" cy="16" r="11.5" />
      <path d="M4.5 16h23" />
      <path d="M16 4.5v23" />
      <path d="M7.2 8.2c3 2.4 5 5 5 7.8s-2 5.4-5 7.8" />
      <path d="M24.8 8.2c-3 2.4-5 5-5 7.8s2 5.4 5 7.8" />
    </svg>
  )
}

function Tennis() {
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <path d="M4.5 16a11.5 11.5 1 0 0 23 0a11.5 11.5 1 0 0 -23 0" />
      <path d="M7.67 6.77a11.5 11.5 0 0 1 0 17.12" />
      <path d="M24.33 6.77a11.5 11.5 0 0 0 0 17.12" />
    </svg>
  )
}

function Pickleball() {
  return (
    <svg viewBox="0 0 32 32" {...S}>
      <rect x="4.8" y="2" width="9.2" height="15.4" rx="4.6" />
      <rect x="7.9" y="17.4" width="3" height="6" rx="1.3" />
      <path d="M7.7 23.7h3.4" />
      <circle cx="8" cy="7" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.2" cy="7" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="10" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.2" cy="10" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="8" cy="13" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="11.2" cy="13" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="23.5" cy="22" r="5.4" />
      <circle cx="23.5" cy="17.6" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="27.1" cy="19.9" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="27.1" cy="24.1" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="23.5" cy="26.4" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="19.9" cy="24.1" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="19.9" cy="19.9" r="0.65" fill="currentColor" stroke="none" />
      <circle cx="23.5" cy="22" r="0.65" fill="currentColor" stroke="none" />
    </svg>
  )
}

const SPORTS = [
  { label: 'Football', Icon: Football },
  { label: 'Cricket', Icon: Cricket },
  { label: 'Badminton', Icon: Badminton },
  { label: 'Basketball', Icon: Basketball },
  { label: 'Tennis', Icon: Tennis },
  { label: 'Pickleball', Icon: Pickleball },
]

export default function SportsStrip() {
  return (
    <section className="sports-strip mx-auto max-w-content px-5 py-16 sm:px-8">
      <Reveal className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Play what you love
        </p>
      </Reveal>
      <Reveal delay={80}>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {SPORTS.map(({ label, Icon }) => (
            <li key={label} className="ss-item group flex flex-col items-center gap-2.5">
              <Icon />
              <span className="ss-label text-sm font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
