import { useEffect, useRef, useState } from 'react'

// Counts from 0 up to `target` once the element scrolls into view, driven by
// requestAnimationFrame (not scroll events). Returns [ref, value]. Attach the
// ref to the element whose visibility should trigger the count.
export function useCountUp(target, { duration = 1600 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const start = () => {
      if (reduce) {
        setValue(target)
        return
      }
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min((now - t0) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
        setValue(Math.round(eased * target))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (typeof IntersectionObserver === 'undefined') {
      start()
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            io.unobserve(entry.target)
            start()
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return [ref, value]
}
