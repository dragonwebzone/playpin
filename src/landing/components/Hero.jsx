import { Link } from 'react-router-dom'
import MapVisual from './MapVisual'
import { IconArrow } from './icons'

export default function Hero() {
  const scrollToHow = (e) => {
    e.preventDefault()
    document
      .getElementById('how-it-works')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="relative overflow-hidden">
      {/* soft background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/70 to-white"
      />
      <div className="mx-auto grid max-w-content items-center gap-12 px-5 pb-16 pt-14 sm:px-8 md:grid-cols-2 md:gap-10 md:pb-24 md:pt-20">
        {/* Copy */}
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-accent-700">
            🟢 Pickup sports, organized in one tap
          </span>
          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Never play alone.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Find pickup games near you — real people, real time, one tap away.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/app?auth=signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-soft transition-transform duration-200 hover:scale-[1.03] active:scale-95"
            >
              Find a game
              <IconArrow className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              onClick={scrollToHow}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:bg-slate-50"
            >
              How it works
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Free to join · Games in your neighborhood · No flakes
          </p>
        </div>

        {/* Visual */}
        <div className="relative">
          <MapVisual />
        </div>
      </div>
    </section>
  )
}
