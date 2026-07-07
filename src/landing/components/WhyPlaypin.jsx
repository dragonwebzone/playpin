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

// Asymmetric bento: the real-time map feature gets a large featured tile with a
// radar motif; the other three sit around it as smaller supporting tiles.
export default function WhyPlaypin() {
  const featured = FEATURES[3]
  const rest = [FEATURES[0], FEATURES[1], FEATURES[2]]

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

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          {/* Featured tile */}
          <Reveal className="reflect relative flex flex-col justify-between overflow-hidden rounded-3xl border border-accent-100 bg-white p-8 shadow-card dark:border-accent-900/60 dark:bg-slate-800 md:col-span-2 lg:col-span-2 lg:row-span-2">
            {/* Radar motif */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-80 sm:h-56 sm:w-56"
            >
              <span className="absolute inset-0 rounded-full border border-accent-200/70 dark:border-accent-700/50" />
              <span className="absolute inset-8 rounded-full border border-accent-200/60 dark:border-accent-700/40" />
              <span className="absolute inset-16 rounded-full border border-accent-200/50 dark:border-accent-700/30" />
              <span className="absolute left-1/2 top-1/2 flex h-3 w-3 -translate-x-1/2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-energy-500/70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-energy-500" />
              </span>
            </div>

            <div className="relative flex items-center gap-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-soft">
                <IconRadar className="h-7 w-7" />
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-energy-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-energy-700 dark:bg-energy-500/15 dark:text-energy-300">
                <span className="h-1.5 w-1.5 rounded-full bg-energy-500" />
                Live
              </span>
            </div>

            <div className="relative mt-10">
              <h3 className="text-2xl font-extrabold tracking-tight text-ink dark:text-white">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-md leading-relaxed text-slate-600 dark:text-slate-300">
                {featured.body}
              </p>
            </div>
          </Reveal>

          {/* Supporting tiles */}
          {rest.map((f, i) => (
            <Reveal
              key={f.title}
              delay={(i + 1) * 90}
              className={`reflect group flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800 ${
                i === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent group-hover:text-white dark:bg-accent-900/40 dark:text-accent-300">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-ink dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {f.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
