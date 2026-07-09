import { IconPin } from './icons'

// Stylized, lightweight SVG "map" with a few PlayPin game pins that drop in and
// gently float, plus pulsing rings. All motion is transform/opacity via CSS.
// Pins stay on-brand (emerald) with a single energy pin to draw the eye.
const PINS = [
  { left: '22%', top: '30%', delay: 0.2, sport: 'Basketball', energy: false },
  { left: '58%', top: '22%', delay: 0.5, sport: 'Football', energy: true },
  { left: '72%', top: '58%', delay: 0.8, sport: 'Tennis', energy: false },
  { left: '38%', top: '66%', delay: 1.1, sport: 'Badminton', energy: false },
]

export default function MapVisual() {
  return (
    <div className="float-card relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-accent-50 via-white to-slate-50 shadow-glow dark:border-slate-700 dark:from-accent-950/50 dark:via-slate-800 dark:to-slate-900">
      {/* Abstract map: parks, water, streets, and a suggested route. Fills are
          theme-aware (Tailwind fill/stroke utilities) so nothing reads as a flat
          bright blob in dark mode. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* water + shoreline */}
        <path d="M0 248 Q90 220 180 252 T400 246 L400 300 L0 300Z" className="fill-sky-200/70 dark:fill-sky-900/40" />
        <path d="M0 248 Q90 220 180 252 T400 246" fill="none" strokeWidth="2" className="stroke-sky-300/70 dark:stroke-sky-700/50" />
        {/* parks: layered organic shapes for a bit of depth */}
        <path d="M14 34 Q70 8 126 40 Q188 66 150 116 Q96 150 40 118 Q0 82 14 34Z" className="fill-accent-200/80 dark:fill-accent-900/45" />
        <path d="M42 54 Q82 36 116 58 Q140 86 108 104 Q70 118 48 96 Q30 74 42 54Z" className="fill-accent-300/50 dark:fill-accent-800/45" />
        <path d="M286 168 Q340 150 384 196 Q400 248 336 262 Q286 268 276 214 Q272 182 286 168Z" className="fill-accent-200/80 dark:fill-accent-900/45" />
        {/* streets */}
        <g strokeWidth="6" strokeLinecap="round" fill="none" className="stroke-slate-200 dark:stroke-slate-700">
          <path d="M-10 110 H410" />
          <path d="M-10 190 H410" />
          <path d="M120 -10 V310" />
          <path d="M250 -10 V310" />
        </g>
        <g strokeWidth="3" strokeLinecap="round" fill="none" className="stroke-slate-100 dark:stroke-slate-700/60">
          <path d="M-10 70 H410" />
          <path d="M-10 150 H410" />
          <path d="M60 -10 V310" />
          <path d="M330 -10 V310" />
        </g>
        {/* dotted route toward the highlighted game — echoes the in-app directions */}
        <path d="M70 236 Q120 150 250 66" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 9" className="stroke-accent-500/70 dark:stroke-accent-400/70" />
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
                className={`pin__ring absolute -bottom-1 h-8 w-8 rounded-full ${
                  p.energy ? 'bg-energy-500/30' : 'bg-accent-500/30'
                }`}
                style={{ animationDelay: `${p.delay}s` }}
              />
              <span
                className={`relative flex h-11 w-11 items-center justify-center rounded-full text-white shadow-soft ring-4 ring-white dark:ring-slate-800 ${
                  p.energy ? 'bg-energy-500' : 'bg-accent'
                }`}
              >
                <IconPin className="h-6 w-6" />
              </span>
            </div>
          </div>
          <span className="sr-only">{p.sport} game</span>
        </div>
      ))}

      {/* "live" chip */}
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur dark:bg-slate-800/90 dark:text-slate-200">
        <span className="relative flex h-2 w-2">
          <span className="pin__ring absolute inline-flex h-full w-full rounded-full bg-energy-500/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-energy-500" />
        </span>
        4 games nearby
      </div>
    </div>
  )
}
