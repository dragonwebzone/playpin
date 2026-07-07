/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Dark mode is driven by data-theme="dark" on <html> (set by useTheme), so the
  // same attribute powers both the app's CSS-variable theme and Tailwind dark:.
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // ── Brand system: "Pitch & Volt" ──────────────────────────────────
        // A deep pitch-emerald voice ("turf under stadium lights") + one
        // electric volt-lime spark (tennis ball / high-vis), used with
        // restraint (~60% neutral / 30% pitch / 10% volt). `accent` is the
        // single source of truth — no raw `emerald-*`/`lime-*` in components.
        accent: {
          // Deep pitch emerald. White text on 700 passes WCAG AA (~5.5:1).
          DEFAULT: '#0a6e4a',
          50: '#edfcf4',
          100: '#d2f7e3',
          200: '#a7efc9',
          300: '#6fe0a9',
          400: '#33c98a',
          500: '#12a870',
          600: '#0b8a5c',
          700: '#0a6e4a',
          800: '#085539',
          900: '#06402c',
          950: '#022c1e',
        },
        // Volt — the electric athletic spark. Reads best as a FILL or pulse;
        // for text use 600/700 on light, 400 on dark.
        energy: {
          DEFAULT: '#65a30d',
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
        },
        // Green-black ink — richer than a neutral slate-black.
        ink: '#0a1512',
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
        soft: '0 14px 44px -16px rgba(10, 110, 74, 0.34)',
        card: '0 1px 2px rgba(2,12,27,0.05), 0 14px 34px -18px rgba(2,12,27,0.18)',
        glow: '0 0 0 1px rgba(10,110,74,0.08), 0 24px 64px -20px rgba(10,110,74,0.52)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg, #0b8a5c 0%, #0a6e4a 52%, #063f2c 100%)',
        'brand-sheen': 'radial-gradient(1200px circle at 50% -10%, rgba(18,168,112,0.16), transparent 45%)',
      },
      maxWidth: {
        content: '72rem',
      },
    },
  },
  plugins: [],
}
