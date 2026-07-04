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
    <section className="bg-slate-50/70 py-20 md:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Why PlayPin
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to turn “someday” into a game this weekend.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="h-full rounded-3xl border border-slate-100 bg-white p-7 shadow-card transition-transform duration-300 hover:-translate-y-1">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
