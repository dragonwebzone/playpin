import './AmbientBackground.css'

// 18 dust motes drifting up the full page. Hand-tuned (not random) so the
// horizontal spread stays even and the render is deterministic. All one brand
// green via --dust. Sizes 2–4px, durations 13–22s, delays 0–10s.
const DOTS = [
  { left: 4, size: 3, dur: 18, delay: 0 },
  { left: 11, size: 2, dur: 15, delay: 3.5 },
  { left: 17, size: 4, dur: 21, delay: 7 },
  { left: 23, size: 2, dur: 14, delay: 1.5 },
  { left: 29, size: 3, dur: 19, delay: 9 },
  { left: 34, size: 3, dur: 16, delay: 4.5 },
  { left: 40, size: 2, dur: 22, delay: 2 },
  { left: 46, size: 4, dur: 17, delay: 8 },
  { left: 51, size: 3, dur: 13, delay: 6 },
  { left: 57, size: 2, dur: 20, delay: 0.5 },
  { left: 63, size: 3, dur: 15, delay: 5.5 },
  { left: 68, size: 4, dur: 18, delay: 10 },
  { left: 74, size: 2, dur: 21, delay: 3 },
  { left: 79, size: 3, dur: 14, delay: 7.5 },
  { left: 85, size: 3, dur: 19, delay: 1 },
  { left: 90, size: 2, dur: 16, delay: 8.5 },
  { left: 95, size: 4, dur: 22, delay: 4 },
  { left: 99, size: 2, dur: 17, delay: 6.5 },
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
            background: 'var(--dust)',
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
