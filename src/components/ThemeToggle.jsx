import { useTheme } from '../hooks/useTheme'

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
        <span className="theme-toggle-icon theme-toggle-sun">☀️</span>
        <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
        <span className="theme-toggle-knob">{isDark ? '🌙' : '☀️'}</span>
      </span>
    </button>
  )
}
