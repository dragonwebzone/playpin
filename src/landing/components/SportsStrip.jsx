import Reveal from '../lib/Reveal'
import {
  SportFootball,
  SportCricket,
  SportBadminton,
  SportBasketball,
  SportTennis,
  SportPickleball,
} from './icons'

const SPORTS = [
  { icon: SportFootball, label: 'Football' },
  { icon: SportCricket, label: 'Cricket' },
  { icon: SportBadminton, label: 'Badminton' },
  { icon: SportBasketball, label: 'Basketball' },
  { icon: SportTennis, label: 'Tennis' },
  { icon: SportPickleball, label: 'Pickleball' },
]

export default function SportsStrip() {
  return (
    <section className="mx-auto max-w-content px-5 py-16 sm:px-8">
      <Reveal className="text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Play what you love
        </p>
      </Reveal>
      <Reveal delay={80}>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {SPORTS.map((s, i) => (
            <li key={s.label} className="group flex flex-col items-center gap-3">
              <span
                className="reflect bob flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-100 bg-white text-accent-600 shadow-card transition-colors duration-300 group-hover:border-accent-200 group-hover:text-accent-700 dark:border-slate-700 dark:bg-slate-800 dark:text-accent-300 dark:group-hover:border-accent-700 sm:h-20 sm:w-20"
                style={{ animationDelay: `${i * 0.25}s` }}
              >
                <s.icon className="h-8 w-8 sm:h-9 sm:w-9" />
              </span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{s.label}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
