import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import WhyPlaypin from './components/WhyPlaypin'
import SportsStrip from './components/SportsStrip'
import SocialProof from './components/SocialProof'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const sentinelRef = useRef(null)

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar scrolled={scrolled} />
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
    </div>
  )
}
