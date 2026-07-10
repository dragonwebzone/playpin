import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import AmbientBackground from './components/AmbientBackground'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import WhyPlaypin from './components/WhyPlaypin'
import SportsStrip from './components/SportsStrip'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  const { user, loading } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'signup'
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef(null)

  // Open the auth modal when arriving with ?auth=login|signup — e.g. from an
  // in-app CTA or after being redirected here while signed out.
  useEffect(() => {
    const intent = searchParams.get('auth')
    if (intent === 'login' || intent === 'signup') setAuthMode(intent)
    if (intent) {
      searchParams.delete('auth')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Toggle the navbar's blur/shadow once the hero-bottom sentinel leaves the
  // viewport — done with IntersectionObserver, not a scroll listener.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: '-8px 0px 0px 0px', threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Signed-in users skip the marketing page and go straight to the app. This
  // also handles the return from Google OAuth if the provider lands them on "/".
  if (!loading && user) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-slate-900">
      {/* Ambient floodlight-dust layer, fixed behind the whole page. */}
      <AmbientBackground />
      <Navbar scrolled={scrolled} onAuth={setAuthMode} />
      <main>
        <Hero />
        {/* Sentinel just below the hero controls the sticky-nav appearance. */}
        <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />
        <HowItWorks />
        <WhyPlaypin />
        <SportsStrip />
        <SocialProof />
        <FinalCTA />
      </main>
      <Footer />

      {authMode && (
        <AuthModal initialMode={authMode} onClose={() => setAuthMode(null)} />
      )}
    </div>
  )
}
