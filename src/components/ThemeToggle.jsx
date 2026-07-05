import { useTheme } from '../hooks/useTheme'

// Light/dark toggle. Styled by the global `.theme-toggle` class (index.css), so
// it looks consistent in both the app topbar and the landing navbar. Extra
// classes can be passed for per-context tweaks.
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      className={`theme-toggle ${className}`.trim()}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
    </button>
  )
}
