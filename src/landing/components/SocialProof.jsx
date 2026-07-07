import Reveal from '../lib/Reveal'
import { useCountUp } from '../lib/useCountUp'

// Aspirational, clearly-rounded placeholder numbers — not fake precise metrics.
const STATS = [
  { value: 10, suffix: 'k+', label: 'players ready to run it back' },
  { value: 500, suffix: '+', label: 'games organized every week' },
  { value: 30, suffix: '+', label: 'cities and growing' },
  { value: 95, suffix: '%', label: 'of players show up on time' },
]

const TESTIMONIALS = [
  {
    quote:
      'I moved to a new city and found a weekly basketball run in two days. PlayPin basically handed me a friend group.',
    name: 'Jordan M.',
    role: 'Basketball · casual',
    initial: 'J',
  },
  {
    quote:
      'No more group-chat chaos trying to get ten people to a football pitch. Drop a pin, they show up.',
    name: 'Priya S.',
    role: 'Football · competitive',
    initial: 'P',
  },
  {
    quote:
      'The reliability score is genius. You actually know who’s going to turn up before you commit your evening.',
    name: 'Marcus T.',
    role: 'Tennis · beginner',
    initial: 'M',
  },
]

function Stat({ value, suffix, label }) {
  const [ref, current] = useCountUp(value)
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-extrabold tracking-tight text-ink dark:text-white sm:text-5xl">
        {current}
        <span className="text-accent-600 dark:text-energy-400">{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

export default function SocialProof() {
  return (
    <section className="mx-auto max-w-content px-5 py-20 sm:px-8 md:py-28">
      {/* Stats */}
      <Reveal>
        <div className="grid grid-cols-2 gap-8 rounded-3xl border border-slate-100 bg-white p-10 shadow-card dark:border-slate-700 dark:bg-slate-800 md:grid-cols-4">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </Reveal>

      {/* Testimonials */}
      <Reveal className="mx-auto mt-16 max-w-2xl text-center" delay={80}>
        <h2 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
          Loved by people who’d rather be playing
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i * 120}>
            <figure className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-card dark:border-slate-700 dark:bg-slate-800">
              <blockquote className="flex-1 text-slate-700 dark:text-slate-200">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 font-bold text-accent-700 dark:bg-accent-900/40 dark:text-accent-300">
                  {t.initial}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink dark:text-white">{t.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Illustrative stories and early, growing numbers — shown to give a feel for PlayPin.
      </p>
    </section>
  )
}
