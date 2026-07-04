export default function Spinner({ label = 'Loading…', overlay = false }) {
  return (
    <div className={overlay ? 'spinner-overlay' : 'spinner-wrap'}>
      <div className="spinner" aria-hidden="true" />
      <span className="spinner-label">{label}</span>
    </div>
  )
}
