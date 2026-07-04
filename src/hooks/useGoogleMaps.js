import { useEffect, useState } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Module-level promise so the Maps script is only ever injected once, even if
// several components mount the hook.
let loaderPromise = null

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve(window.google.maps)
  if (loaderPromise) return loaderPromise

  loaderPromise = new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))
      return
    }
    const script = document.createElement('script')
    // Classic (synchronous) load: google.maps.Map/Marker are available as soon
    // as onload fires. Do NOT add &loading=async — that returns a stub that
    // requires importLibrary() before the constructors exist.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&v=weekly`
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.maps?.Map) resolve(window.google.maps)
      else reject(new Error('Google Maps failed to initialize'))
    }
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
  return loaderPromise
}

// Returns { maps, loading, error } once the Google Maps JS API is ready.
export function useGoogleMaps() {
  const [state, setState] = useState({
    maps: window.google?.maps ?? null,
    loading: !window.google?.maps,
    error: null,
  })

  useEffect(() => {
    if (state.maps) return
    let active = true
    loadGoogleMaps()
      .then((maps) => active && setState({ maps, loading: false, error: null }))
      .catch((error) => active && setState({ maps: null, loading: false, error }))
    return () => {
      active = false
    }
  }, [])

  return state
}
