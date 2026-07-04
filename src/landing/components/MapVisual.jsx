import { IconPin } from './icons'

// Stylized, lightweight SVG "map" with a few PlayPin game pins that drop in and
// gently float, plus pulsing rings. All motion is transform/opacity via CSS.
const PINS = [
  { left: '22%', top: '30%', delay: 0.2, sport: 'Basketball' },
  { left: '58%', top: '22%', delay: 0.5, sport: 'Football' },
  { left: '72%', top: '58%', delay: 0.8, sport: 'Tennis' },
  { left: '38%', top: '66%', delay: 1.1, sport: 'Badminton' },
]

export default function MapVisual() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50 shadow-card">
      {/* Abstract map: parks, water, and streets as simple SVG shapes */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* park blobs */}
        <path d="M20 40 Q70 10 120 45 T210 60 Q180 120 120 110 T20 40Z" fill="#d1fae5" />
        <path d="M280 180 Q340 160 380 210 Q360 270 300 260 T280 180Z" fill="#d1fae5" />
        {/* water */}
        <path d="M0 250 Q90 220 180 255 T400 250 L400 300 L0 300 Z" fill="#bae6fd" opacity="0.7" />
        {/* streets */}
        <g stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round">
          <path d="M-10 110 H410" />
          <path d="M-10 190 H410" />
          <path d="M120 -10 V310" />
          <path d="M250 -10 V310" />
        </g>
        <g stroke="#eef2f7" strokeWidth="3" strokeLinecap="round">
          <path d="M-10 70 H410" />
          <path d="M-10 150 H410" />
          <path d="M60 -10 V310" />
          <path d="M330 -10 V310" />
        </g>
      </svg>

      {/* Pins */}
      {PINS.map((p, i) => (
        <div
          key={i}
          className="pin absolute -translate-x-1/2 -translate-y-full"
          style={{ left: p.left, top: p.top, animationDelay: `${p.delay}s` }}
        >
          <div className="pin__float" style={{ animationDelay: `${p.delay}s` }}>
            <div className="relative flex flex-col items-center">
              {/* pulse ring anchored at the pin tip */}
              <span
                className="pin__ring absolute -bottom-1 h-8 w-8 rounded-full bg-accent/30"
                style={{ animationDelay: `${p.delay}s` }}
              />
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-soft ring-4 ring-white">
                <IconPin className="h-6 w-6" />
              </span>
            </div>
          </div>
          <span className="sr-only">{p.sport} game</span>
        </div>
      ))}

      {/* "live" chip */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
        <span className="relative flex h-2 w-2">
          <span className="pin__ring absolute inline-flex h-full w-full rounded-full bg-accent/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        4 games nearby
      </div>
    </div>
  )
}
