import { useTheme } from '../hooks/useTheme'

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
)

// Sliding light/dark switch. A pill track shows a faint sun and moon at each end;
// the knob (carrying the active icon) slides to the selected side. Styled by the
// global `.theme-toggle` classes (index.css) so it matches the app topbar and the
// landing navbar. Extra classes can be passed for per-context tweaks.
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      className={`theme-toggle ${isDark ? 'is-dark' : ''} ${className}`.trim()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-icon theme-toggle-sun"><SunIcon /></span>
        <span className="theme-toggle-icon theme-toggle-moon"><MoonIcon /></span>
        <span className="theme-toggle-knob">{isDark ? <MoonIcon /> : <SunIcon />}</span>
      </span>
    </button>
  )
}
