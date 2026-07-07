import Reveal from '../lib/Reveal'
import { IconTarget, IconEye, IconShield, IconRadar } from './icons'

const FEATURES = [
  {
    icon: IconTarget,
    title: 'Skill-matched games',
    body: 'Beginner, casual, or competitive — join games that fit your level so every match feels right.',
  },
  {
    icon: IconEye,
    title: 'See who’s coming',
    body: 'Know the roster before you go. Names, spots left, and who’s hosting — no mystery lineups.',
  },
  {
    icon: IconShield,
    title: 'Reliability scores',
    body: 'Players build a reputation for showing up. No more flakes leaving you a man down.',
  },
  {
    icon: IconRadar,
    title: 'Games near you, in real time',
    body: 'A live map of pickup games happening around you — filter by sport, level, and time.',
  },
]

export default function WhyPlaypin() {
  return (
    <section className="relative overflow-hidden bg-accent-50/50 py-20 dark:bg-accent-950/25 md:py-28">
      <div
        aria-hidden="true"
        className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(80%_60%_at_50%_50%,#000,transparent)]"
      />
      <div className="relative mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Why PlayPin
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            Everything you need to turn “someday” into a game this weekend.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="group h-full rounded-3xl border border-slate-100 bg-white p-7 shadow-card transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-white dark:bg-accent-900/40 dark:text-accent-300">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink dark:text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
