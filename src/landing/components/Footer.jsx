import { Link } from 'react-router-dom'
import Brand from '../../components/Brand'

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

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-content px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <a href="/" className="brand-link" aria-label="playpin home">
              <Brand />
            </a>
            <p className="mt-4 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Find pickup games near you — real people, real time, one tap away.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-bold text-ink dark:text-white">{group.heading}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="text-sm text-slate-500 transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-slate-500 transition-colors hover:text-ink dark:text-slate-400 dark:hover:text-white"
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

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} playpin. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-slate-500 dark:text-slate-400">
            <a href="#" className="transition-colors hover:text-ink dark:hover:text-white">Privacy</a>
            <a href="#" className="transition-colors hover:text-ink dark:hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
