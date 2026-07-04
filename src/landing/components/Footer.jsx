import { Link } from 'react-router-dom'
import { PinLogo } from './icons'

const LINK_GROUPS = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Open the app', to: '/app' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Log in', to: '/app?auth=login' },
      { label: 'Sign up', to: '/app?auth=signup' },
    ],
  },
]

// Minimal social glyphs as inline SVG (no images).
function Social({ label, path }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
        <path d={path} />
      </svg>
    </a>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-content px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <a href="/" className="flex items-center gap-2 text-lg font-extrabold text-ink">
              <PinLogo className="h-6 w-6 text-accent" />
              PlayPin
            </a>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              Find pickup games near you — real people, real time, one tap away.
            </p>
            <div className="mt-5 flex gap-3">
              <Social label="X" path="M18.9 2H22l-7.3 8.3L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.8-8.9L1 2h7l4.8 6.3L18.9 2Z" />
              <Social label="Instagram" path="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.06 1.8.25 2.2.42.6.22 1 .48 1.4.9.42.4.68.8.9 1.4.17.4.36 1 .42 2.2.07 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.06 1.2-.25 1.8-.42 2.2a3.9 3.9 0 0 1-.9 1.4c-.4.42-.8.68-1.4.9-.4.17-1 .36-2.2.42-1.2.07-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.06-1.8-.25-2.2-.42a3.9 3.9 0 0 1-1.4-.9 3.9 3.9 0 0 1-.9-1.4c-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.06-1.2.25-1.8.42-2.2.22-.6.48-1 .9-1.4.4-.42.8-.68 1.4-.9.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 3.2A6.6 6.6 0 1 0 18.6 12 6.6 6.6 0 0 0 12 5.4Zm0 10.9A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3Zm6.9-11.1a1.5 1.5 0 1 1-1.5-1.5 1.5 1.5 0 0 1 1.5 1.5Z" />
              <Social label="TikTok" path="M16.5 3c.3 2 1.5 3.4 3.5 3.6v2.5c-1.3.1-2.5-.3-3.5-1v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.08v2.6a3 3 0 1 0 2.1 2.9V3h2.6Z" />
            </div>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-bold text-ink">{group.heading}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-slate-500 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 transition-colors hover:text-ink"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} PlayPin. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-slate-400">
            <a href="#" className="transition-colors hover:text-ink">Privacy</a>
            <a href="#" className="transition-colors hover:text-ink">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
