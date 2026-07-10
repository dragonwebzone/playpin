import './Constellation.css'

// "Constellation" — an ambient dark canvas of breathing aurora glows and a
// handful of game "pips" that light up in sequence (each surfacing a sport chip
// as it activates), with faint lines linking nearby pips into a network. All
// motion is CSS transform/opacity and pauses under prefers-reduced-motion.
// Purely decorative: the sample games are illustrative, so the whole thing is
// aria-hidden and the honest "live" pill uses a static number.
const PIPS = [
  { label: '⚽ Football · 6 PM', size: 20, left: '24%', top: '30%', delay: 0, side: 'right' },
  { label: '🏸 Badminton · Now', size: 22, left: '60%', top: '24%', delay: 0.7, side: 'left' },
  { label: '🏏 Cricket · Tomorrow', size: 14, left: '76%', top: '56%', delay: 1.4, side: 'left' },
  { label: '🎾 Tennis · 7 PM', size: 16, left: '42%', top: '66%', delay: 2.1, side: 'right' },
  { label: '🏀 Basketball · 8 PM', size: 12, left: '20%', top: '70%', delay: 2.8, side: 'right' },
]

// Lines bridge nearby pip pairs; each pulses timed to the average of its two
// pips' delays so it lights up as they activate.
const LINES = [
  { left: '24%', top: '30%', width: '37%', rotate: -8, delay: 0.35 }, // football ↔ badminton
  { left: '20%', top: '70%', width: '23%', rotate: -8, delay: 2.45 }, // basketball ↔ tennis
]

export default function MapVisual() {
  return (
    <div className="constellation float-card" aria-hidden="true">
      <span className="cst-blob cst-blob--1" />
      <span className="cst-blob cst-blob--2" />

      {LINES.map((l, i) => (
        <span
          key={i}
          className="cst-line"
          style={{
            left: l.left,
            top: l.top,
            width: l.width,
            transform: `rotate(${l.rotate}deg)`,
            animationDelay: `${l.delay}s`,
          }}
        />
      ))}

      {PIPS.map((p, i) => (
        <div
          key={i}
          className="cst-marker"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
        >
          <span className="cst-pip" style={{ animationDelay: `${p.delay}s` }} />
          <span
            className={`cst-chip cst-chip--${p.side}`}
            style={{ animationDelay: `${p.delay}s` }}
          >
            {p.label}
          </span>
        </div>
      ))}

      <div className="cst-live">
        <span className="cst-live-dot" />
        120+ games this week
      </div>
    </div>
  )
}
