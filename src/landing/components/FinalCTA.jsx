import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../lib/Reveal'
import { IconArrow } from './icons'

export default function FinalCTA() {
  // UI-only email capture — intentionally stores nothing.
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section className="px-5 pb-24 sm:px-8">
      <Reveal className="mx-auto max-w-content">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center shadow-soft sm:px-16">
          {/* decorative wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-0 opacity-50"
            style={{
              background:
                'radial-gradient(600px circle at 18% 0%, rgba(18,168,112,0.42), transparent 42%), radial-gradient(600px circle at 92% 105%, rgba(163,230,53,0.26), transparent 46%)',
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Your next game is closer than you think.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
              Join PlayPin and never sit out because you couldn’t find a game again.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4">
              <Link
                to="/app?auth=signup"
                className="btn-shine group inline-flex items-center justify-center gap-2 rounded-full bg-brand-grad px-8 py-4 text-base font-semibold text-white shadow-soft transition-transform duration-200 hover:scale-[1.03] active:scale-95"
              >
                Sign up — it’s free
                <IconArrow className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>

              {/* Optional email capture (UI only) */}
              <form
                onSubmit={onSubmit}
                className="mt-2 flex w-full max-w-md flex-col gap-3 sm:flex-row"
                aria-label="Get early updates"
              >
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full flex-1 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-slate-400 focus:border-accent-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  {submitted ? 'You’re on the list ✓' : 'Keep me posted'}
                </button>
              </form>
              <p className="text-xs text-slate-400">No spam. Just a nudge when there’s a game near you.</p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
