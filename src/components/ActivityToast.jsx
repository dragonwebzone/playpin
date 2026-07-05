// A small stack of transient "live activity" toasts in the corner, driven by
// real Supabase Realtime events (new game created, someone joined).
export default function ActivityToast({ items }) {
  if (items.length === 0) return null
  return (
    <div className="activity" aria-live="polite">
      {items.map((item) => (
        <div key={item.id} className="activity-toast">
          <span className="activity-emoji" aria-hidden="true">{item.emoji}</span>
          <span className="activity-text">{item.text}</span>
        </div>
      ))}
    </div>
  )
}
