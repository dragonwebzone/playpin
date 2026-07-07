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

// Narrative timeline: a single connector rail with steps zig-zagging left/right
// of it on desktop, collapsing to a left-aligned rail on mobile. The step number
// is a large low-opacity watermark rather than a badge.
export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-content px-5 py-20 sm:px-8 md:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
          Three steps from “I want to play” to playing.
        </h2>
      </Reveal>

      <ol className="relative mt-16 md:mt-20">
        {/* Continuous connector rail: left on mobile, centered on desktop. */}
        <div
          aria-hidden="true"
          className="absolute bottom-8 left-[26px] top-2 w-px bg-gradient-to-b from-accent-300 via-accent-300 to-transparent dark:from-accent-700 dark:via-accent-700 md:left-1/2 md:-translate-x-1/2"
        />

        {STEPS.map((step, i) => {
          const flip = i % 2 === 1
          return (
            <Reveal
              as="li"
              key={step.title}
              delay={i * 120}
              className="relative py-9 first:pt-0 last:pb-0 md:grid md:grid-cols-2 md:gap-x-20 md:py-12"
            >
              {/* Node on the rail */}
              <span
                aria-hidden="true"
                className="absolute left-[26px] top-8 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-accent ring-4 ring-accent-100 dark:border-slate-900 dark:ring-accent-900/50 md:left-1/2 md:top-14"
              />

              <div
                className={`relative pl-16 md:pl-0 ${
                  flip
                    ? 'md:col-start-2 md:pl-20'
                    : 'md:col-start-1 md:pr-20 md:text-right'
                }`}
              >
                {/* Watermark numeral — sits in the empty outer margin (opposite
                    the rail-side icon) so nothing overlaps. */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute right-0 top-0 select-none text-5xl font-black leading-none tracking-tighter text-accent-600/10 dark:text-accent-400/10 sm:text-6xl md:top-4 md:text-8xl ${
                    flip ? 'md:left-auto md:right-0' : 'md:left-0 md:right-auto'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>

                <span
                  className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-900/40 dark:text-accent-300 ${
                    flip ? '' : 'md:ml-auto'
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="relative mt-5 text-xl font-bold text-ink dark:text-white">
                  {step.title}
                </h3>
                <p
                  className={`relative mt-2 max-w-sm leading-relaxed text-slate-600 dark:text-slate-300 ${
                    flip ? '' : 'md:ml-auto'
                  }`}
                >
                  {step.body}
                </p>
              </div>
            </Reveal>
          )
        })}
      </ol>
    </section>
  )
}
