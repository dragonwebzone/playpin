import './AmbientBackground.css'

// 18 dust motes drifting up the full page. Hand-tuned (not random) so the
// horizontal spread stays even, colors split ~half volt / half pitch-light, and
// the render is deterministic. Sizes 2–4px, durations 13–22s, delays 0–10s.
const V = 'var(--volt)'
const P = 'var(--pitch-light)'
const DOTS = [
  { left: 4, size: 3, color: V, dur: 18, delay: 0 },
  { left: 11, size: 2, color: P, dur: 15, delay: 3.5 },
  { left: 17, size: 4, color: V, dur: 21, delay: 7 },
  { left: 23, size: 2, color: P, dur: 14, delay: 1.5 },
  { left: 29, size: 3, color: V, dur: 19, delay: 9 },
  { left: 34, size: 3, color: P, dur: 16, delay: 4.5 },
  { left: 40, size: 2, color: V, dur: 22, delay: 2 },
  { left: 46, size: 4, color: P, dur: 17, delay: 8 },
  { left: 51, size: 3, color: V, dur: 13, delay: 6 },
  { left: 57, size: 2, color: P, dur: 20, delay: 0.5 },
  { left: 63, size: 3, color: V, dur: 15, delay: 5.5 },
  { left: 68, size: 4, color: P, dur: 18, delay: 10 },
  { left: 74, size: 2, color: V, dur: 21, delay: 3 },
  { left: 79, size: 3, color: P, dur: 14, delay: 7.5 },
  { left: 85, size: 3, color: V, dur: 19, delay: 1 },
  { left: 90, size: 2, color: P, dur: 16, delay: 8.5 },
  { left: 95, size: 4, color: V, dur: 22, delay: 4 },
  { left: 99, size: 2, color: P, dur: 17, delay: 6.5 },
]

export default function AmbientBackground() {
  return (
    <div className="floodlight-dust" aria-hidden="true">
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="fd-dot"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: d.color,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
