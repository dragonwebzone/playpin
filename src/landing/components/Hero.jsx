import { Link } from 'react-router-dom'
import MapVisual from './MapVisual'
import { IconArrow } from './icons'

const AVATARS = [
  { initial: 'J', tint: 'bg-accent-500' },
  { initial: 'P', tint: 'bg-energy-500' },
  { initial: 'M', tint: 'bg-accent-700' },
  { initial: 'A', tint: 'bg-energy-600' },
]

export default function Hero() {
  const scrollToHow = (e) => {
    e.preventDefault()
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative overflow-hidden">
      {/* Layered brand wash + dotted map grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent-50/80 via-white to-white dark:from-accent-950/40 dark:via-slate-900 dark:to-slate-900"
      />
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
      />
      {/* Slow-drifting ambient brand blobs */}
      <div
        aria-hidden="true"
        className="blob-a pointer-events-none absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl dark:bg-accent-500/20"
      />
      <div
        aria-hidden="true"
        className="blob-b pointer-events-none absolute -right-16 top-24 -z-10 h-72 w-72 rounded-full bg-energy-300/25 blur-3xl dark:bg-energy-500/10"
      />

      <div className="mx-auto grid max-w-content items-center gap-12 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-2 md:gap-10 md:pb-24 md:pt-20">
        {/* Copy */}
        <div className="max-w-xl">
          <span
            className="animate-enter inline-flex items-center gap-2 rounded-full border border-accent-100 bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700 dark:border-accent-800/60 dark:bg-accent-900/30 dark:text-accent-300"
            style={{ animationDelay: '0.05s' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-energy-500/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-energy-500" />
            </span>
            Pickup sports, organized in one tap
          </span>

          <h1
            className="animate-enter mt-5 text-balance text-5xl font-extrabold leading-[1.03] tracking-tight text-ink dark:text-white sm:text-6xl"
            style={{ animationDelay: '0.13s' }}
          >
            Never play <span className="mark-energy">alone</span> again.
          </h1>

          <p
            className="animate-enter mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            style={{ animationDelay: '0.23s' }}
          >
            Drop a pin, pick your sport, and fill the roster with real people
            nearby — <span className="font-semibold text-accent-700 dark:text-accent-300">in real time, one tap away.</span>
          </p>

          <div
            className="animate-enter mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '0.33s' }}
          >
            <Link
              to="/app"
              className="btn-shine group inline-flex items-center justify-center gap-2 rounded-full bg-brand-grad px-7 py-3.5 text-base font-semibold text-white shadow-soft transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Find a game
              <IconArrow className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              onClick={scrollToHow}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-accent-300 hover:bg-accent-50/60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-accent-700 dark:hover:bg-slate-700"
            >
              How it works
            </a>
          </div>

          {/* Trust bar */}
          <div
            className="animate-enter mt-8 flex flex-wrap items-center gap-4"
            style={{ animationDelay: '0.43s' }}
          >
            <div className="flex -space-x-2">
              {AVATARS.map((a) => (
                <span
                  key={a.initial}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900 ${a.tint}`}
                >
                  {a.initial}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-bold text-ink dark:text-white">10k+ players</span> · free to
              join · no flakes
            </p>
          </div>
        </div>

        {/* Visual */}
        <div className="animate-pop relative" style={{ animationDelay: '0.3s' }}>
          <MapVisual />
        </div>
      </div>
    </section>
  )
}
