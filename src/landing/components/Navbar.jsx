import { useState } from 'react'
import { IconMenu, IconClose } from './icons'
import ThemeToggle from '../../components/ThemeToggle'
import Brand from '../../components/Brand'

// Sticky top navigation. `scrolled` (from App's IntersectionObserver sentinel)
// toggles the blur + shadow once the user passes the hero. `onAuth('login'|
// 'signup')` opens the auth modal on the landing page.
export default function Navbar({ scrolled, onAuth }) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
        scrolled
          ? 'bg-white/80 shadow-soft backdrop-blur-md supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/80 dark:supports-[backdrop-filter]:bg-slate-900/70'
          : 'bg-transparent'
      }`}
    >
      <nav className="animate-drop mx-auto flex max-w-content items-center justify-between px-5 py-4 sm:px-8">
        <a href="/" className="brand-link" aria-label="playpin home">
          <Brand />
        </a>

        {/* Desktop actions */}
        <div className="hidden items-center gap-7 md:flex">
          <button
            type="button"
            onClick={() => onAuth('login')}
            className="link-underline text-sm font-semibold text-slate-600 transition-colors hover:text-ink dark:text-slate-300 dark:hover:text-white"
          >
            Log in
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => onAuth('signup')}
            className="btn-shine rounded-full bg-brand-grad px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-[1.03] active:scale-95"
          >
            Sign up
          </button>
        </div>

        {/* Mobile: theme toggle + menu button */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-slate-100 dark:text-white dark:hover:bg-white/10"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — absolutely positioned so open/close animates transform +
          opacity only (never layout). */}
      <div
        className={`absolute inset-x-0 top-full origin-top px-5 transition-[opacity,transform] duration-200 md:hidden ${
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-2 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-content flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-700 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => { setOpen(false); onAuth('login') }}
            className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-ink transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-white/10"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onAuth('signup') }}
            className="rounded-xl bg-brand-grad px-4 py-3 text-center text-sm font-semibold text-white transition-transform active:scale-95"
          >
            Sign up
          </button>
        </div>
      </div>
    </header>
  )
}
