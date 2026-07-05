/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Dark mode is driven by data-theme="dark" on <html> (set by useTheme), so the
  // same attribute powers both the app's CSS-variable theme and Tailwind dark:.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // One confident accent (athletic green) + a supporting deep ink.
        accent: {
          // Emerald-700: white text on this passes WCAG AA (~5.5:1).
          DEFAULT: '#047857',
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        ink: '#0b1220',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 12px 40px -14px rgba(6, 78, 59, 0.18)',
        card: '0 1px 2px rgba(2,12,27,0.04), 0 12px 32px -16px rgba(2,12,27,0.14)',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}
