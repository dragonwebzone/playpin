import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'
import { IconUsers, IconTrophy, IconBracket } from './icons'

// Shared app topbar: a burger that opens a nav drawer (Friends / Leaderboard /
// Tournaments — each its own page), the brand, and a profile avatar in the
// corner. Used by the map page and every section page so navigation is
// identical everywhere. `onOpenProfile` lets the map page open its in-place
// profile sheet; elsewhere the avatar deep-links to the map with ?profile=1.
// Guests browse freely: the drawer sections and profile all prompt sign-up
// (via `onRequireAuth`), and the avatar is replaced by Log in / Sign up.
export default function Topbar({ incomingCount = 0, onOpenProfile, onRequireAuth }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const openProfile = onOpenProfile || (() => navigate('/app?profile=1'))
  const promptAuth = onRequireAuth || ((mode) => navigate(`/app?auth=${mode}`))

  const close = () => setMenuOpen(false)

  // A drawer row navigates to its page when signed in, or prompts sign-up for
  // guests (keeping them on the map, with the modal over it).
  const navItem = (to, icon, label, badge = 0) =>
    user ? (
      <Link to={to} className="drawer-item" onClick={close}>
        {icon} {label}
        {badge > 0 && <span className="notif-badge">{badge}</span>}
      </Link>
    ) : (
      <button
        type="button"
        className="drawer-item"
        onClick={() => { close(); promptAuth('signup') }}
      >
        {icon} {label}
      </button>
    )

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="brand-link" aria-label="playpin home">
          <Brand />
        </Link>
      </div>

      {user ? (
        <button
          className="avatar-corner"
          onClick={openProfile}
          aria-label="My profile"
          title="My profile"
        >
          {(profile?.name || 'P').charAt(0).toUpperCase()}
        </button>
      ) : (
        <div className="topbar-auth">
          <button className="btn btn-ghost btn-sm" onClick={() => promptAuth('login')}>
            Log in
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => promptAuth('signup')}>
            Sign up
          </button>
        </div>
      )}

      {menuOpen && (
        <>
          <div className="drawer-backdrop" onClick={close} />
          <nav className="drawer" aria-label="Sections">
            {navItem('/app/friends', <IconUsers />, 'Friends', incomingCount)}
            {navItem('/app/leaderboard', <IconTrophy />, 'Leaderboard')}
            {navItem('/app/tournaments', <IconBracket />, 'Tournaments')}
          </nav>
        </>
      )}
    </header>
  )
}
