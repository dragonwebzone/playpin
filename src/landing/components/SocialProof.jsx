import Reveal from '../lib/Reveal'

// Honest, non-numeric value props — no fabricated metrics while the product is
// still in its prototype stage.
const FEATURES = [
  { title: 'Free to join', label: 'no fees, no catch — just show up and play' },
  { title: 'Every sport', label: 'football, cricket, tennis, pickleball and more' },
  { title: 'Real time', label: 'see games happening near you right now' },
  { title: 'Show-up scores', label: 'reliability ratings so you know who turns up' },
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
  {
    quote:
      'Found a Sunday cricket side the same week I moved. It’s easily the best part of my weekend now.',
    name: 'Aisha K.',
    role: 'Cricket · casual',
    initial: 'A',
  },
  {
    quote:
      'Booked a badminton doubles game on a random Tuesday and made three new mates. No group-chat wrangling at all.',
    name: 'Samuel O.',
    role: 'Badminton · casual',
    initial: 'S',
  },
]

function Feature({ title, label }) {
  return (
    <div className="px-4 py-4 text-center sm:px-6">
      <div className="text-xl font-extrabold tracking-tight text-accent-700 dark:text-accent-300 sm:text-2xl">
        {title}
      </div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// Value bar (borderless, divider-separated) above a horizontal scroll-snap strip
// of testimonials that bleeds off the right edge to advertise more content.
export default function SocialProof() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-content px-5 sm:px-8">
        {/* Value bar */}
        <Reveal>
          <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 dark:divide-slate-700 md:grid-cols-4 md:divide-y-0">
            {FEATURES.map((f) => (
              <Feature key={f.title} {...f} />
            ))}
          </div>
        </Reveal>

        {/* Heading + scroll affordance */}
        <Reveal className="mt-16 max-w-2xl" delay={80}>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink dark:text-white sm:text-4xl">
            Loved by people who’d rather be playing
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span aria-hidden="true">←</span> Drag or scroll to read more{' '}
            <span aria-hidden="true">→</span>
          </p>
        </Reveal>
      </div>

      {/* Scroll-snap strip — full-bleed so cards spill past the right edge. */}
      <Reveal className="relative mt-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent dark:from-slate-900"
        />
        <div
          role="region"
          aria-label="Player testimonials — scrollable"
          tabIndex={0}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-pl-5 pb-4 pl-5 pr-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 sm:scroll-pl-8 sm:pl-8"
        >
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="reflect flex w-[300px] shrink-0 snap-start flex-col rounded-3xl border border-slate-100 bg-white p-7 shadow-card dark:border-slate-700 dark:bg-slate-800 sm:w-[380px]"
            >
              <blockquote className="flex-1 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
                “{t.quote}”
              </blockquote>
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
          ))}
          {/* Trailing spacer so the last card can snap clear of the edge fade. */}
          <div aria-hidden="true" className="shrink-0 basis-4 sm:basis-8" />
        </div>
      </Reveal>

      <div className="mx-auto max-w-content px-5 sm:px-8">
        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Illustrative stories — shown to give a feel for PlayPin.
        </p>
      </div>
    </section>
  )
}
