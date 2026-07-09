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
export default function Topbar({ incomingCount = 0, onOpenProfile }) {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const openProfile = onOpenProfile || (() => navigate('/app?profile=1'))

  const close = () => setMenuOpen(false)

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

      <button
        className="avatar-corner"
        onClick={openProfile}
        aria-label="My profile"
        title="My profile"
      >
        {(profile?.name || 'P').charAt(0).toUpperCase()}
      </button>

      {menuOpen && (
        <>
          <div className="drawer-backdrop" onClick={close} />
          <nav className="drawer" aria-label="Sections">
            <Link to="/app/friends" className="drawer-item" onClick={close}>
              <IconUsers /> Friends
              {incomingCount > 0 && <span className="notif-badge">{incomingCount}</span>}
            </Link>
            <Link to="/app/leaderboard" className="drawer-item" onClick={close}>
              <IconTrophy /> Leaderboard
            </Link>
            <Link to="/app/tournaments" className="drawer-item" onClick={close}>
              <IconBracket /> Tournaments
            </Link>
          </nav>
        </>
      )}
    </header>
  )
}
