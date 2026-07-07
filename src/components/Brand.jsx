// The single source of truth for the PlayPin brand lockup — used in the app
// topbar, landing navbar, and footer so the logo, wordmark, and font are always
// identical. Green pin badge (matches the favicon/app icon) + a bold, minimal
// white wordmark.
export default function Brand({ className = '' }) {
  return (
    <span className={`brand-lockup ${className}`.trim()}>
      <span className="brand-badge" aria-hidden="true">
        <svg className="brand-badge-pin" viewBox="0 0 24 24">
          <path
            fill="#fff"
            d="M12 2c-3.87 0-7 3.02-7 6.75 0 4.79 5.34 11.06 6.42 12.28a.78.78 0 0 0 1.16 0C13.66 19.81 19 13.54 19 8.75 19 5.02 15.87 2 12 2Z"
          />
          <circle className="brand-badge-hole" cx="12" cy="8.6" r="2.4" />
        </svg>
      </span>
      <span className="brand-word">playpin</span>
    </span>
  )
}
