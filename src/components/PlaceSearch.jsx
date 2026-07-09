import { useEffect, useRef, useState } from 'react'

// Custom place search: a plain <input> we fully control (so the text is black
// and the dropdown matches the app), powered by the new Places Autocomplete
// Data API. Requires "Places API (New)" enabled in Google Cloud.
export default function PlaceSearch({ maps, mapRef, createMode, onDropPin }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const libRef = useRef(null)
  const tokenRef = useRef(null)
  const debounceRef = useRef(null)
  // Latest create-mode value for use inside the async `choose` closure.
  const createModeRef = useRef(createMode)
  createModeRef.current = createMode

  // Resolve the places library and start a session token.
  useEffect(() => {
    if (!maps) return
    let active = true
    const load = maps.places?.AutocompleteSuggestion
      ? Promise.resolve(maps.places)
      : maps.importLibrary?.('places')
    Promise.resolve(load)
      .then((lib) => {
        if (!active || !lib?.AutocompleteSuggestion) return
        libRef.current = lib
        tokenRef.current = new lib.AutocompleteSessionToken()
      })
      .catch(() => {})
    return () => {
      active = false
      clearTimeout(debounceRef.current)
    }
  }, [maps])

  const onChange = (value) => {
    setQuery(value)
    clearTimeout(debounceRef.current)
    if (!value.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      const lib = libRef.current
      if (!lib) return
      try {
        const { suggestions: results } =
          await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            sessionToken: tokenRef.current,
          })
        setSuggestions((results || []).filter((r) => r.placePrediction).slice(0, 5))
        setOpen(true)
      } catch {
        setSuggestions([])
        setOpen(false)
      }
    }, 250)
  }

  const choose = async (suggestion) => {
    const pred = suggestion.placePrediction
    setQuery(pred.text?.text || '')
    setSuggestions([])
    setOpen(false)
    try {
      const place = pred.toPlace()
      await place.fetchFields({ fields: ['location', 'viewport'] })
      const map = mapRef.current
      const loc = place.location
      if (map && loc) {
        if (place.viewport) map.fitBounds(place.viewport)
        else {
          map.setCenter(loc)
          map.setZoom(15)
        }
        if (createModeRef.current) onDropPin({ lat: loc.lat(), lng: loc.lng() })
      }
    } catch {
      /* place lookup failed — ignore */
    }
    // Start a fresh session for the next search.
    tokenRef.current = libRef.current
      ? new libRef.current.AutocompleteSessionToken()
      : null
  }

  const clear = () => {
    setQuery('')
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="map-search">
      <div className="map-search-box">
        <span className="map-search-icon" aria-hidden="true">🔍</span>
        <input
          className="map-search-input"
          type="text"
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search a place or address…"
          aria-label="Search for a place"
        />
        {query && (
          <button className="map-search-clear" onClick={clear} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="map-search-list">
          {suggestions.map((s, i) => {
            const p = s.placePrediction
            const main = p.mainText?.text || p.text?.text || ''
            const sub = p.secondaryText?.text || ''
            return (
              <li key={p.placeId || i}>
                <button
                  type="button"
                  className="map-search-item"
                  // onMouseDown fires before the input blurs, so the click lands.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(s)
                  }}
                >
                  <span className="map-search-item-main">{main}</span>
                  {sub && <span className="map-search-item-sub">{sub}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
