import Reveal from '../lib/Reveal'
import { IconPin, IconUsers, IconPlay } from './icons'

const STEPS = [
  {
    icon: IconPin,
    title: 'Drop a pin',
    body: 'Pick a spot on the map, choose your sport and time, and set how many players you need.',
  },
  {
    icon: IconUsers,
    title: 'People join',
    body: 'Players nearby see your game and tap to join. Watch your roster fill up in real time.',
  },
  {
    icon: IconPlay,
    title: 'Show up and play',
    body: 'Everyone gets the details, meets at the pin, and plays. That’s it — game on.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-content px-5 py-20 sm:px-8 md:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          How it works
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Three steps from “I want to play” to actually playing.
        </p>
      </Reveal>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <Reveal as="li" key={step.title} delay={i * 120}>
            <div className="group h-full rounded-3xl border border-slate-100 bg-white p-8 shadow-card transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
                  <step.icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-slate-500">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
