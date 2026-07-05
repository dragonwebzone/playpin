import { useSyncExternalStore } from 'react'

// Single source of truth for the light/dark theme: the data-theme attribute on
// <html> (set pre-paint by the inline script in index.html). A tiny external
// store keeps every mounted toggle in sync and persists the choice.
const KEY = 'playpin-theme'
const listeners = new Set()

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(KEY, theme)
  } catch (e) {
    /* storage may be unavailable (private mode) — theme still applies for the session */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light')
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return { theme, toggle, isDark: theme === 'dark' }
}
