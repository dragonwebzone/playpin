import { useState } from 'react'
import { SPORTS, SKILL_LEVELS } from '../lib/constants'
import { useAuth } from '../context/AuthContext'

// Default the date input to ~1 hour from now, formatted for datetime-local.
function defaultDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Slide-up form shown after the host drops a pin. `pin` is { lat, lng }.
export default function CreateGameForm({ pin, onCancel, onCreate }) {
  const { user } = useAuth()
  const [sport, setSport] = useState('football')
  const [skill, setSkill] = useState('casual')
  const [dateTime, setDateTime] = useState(defaultDateTime())
  const [playersNeeded, setPlayersNeeded] = useState(6)
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    const when = new Date(dateTime)
    if (Number.isNaN(when.getTime())) {
      setError('Please pick a valid date and time.')
      return
    }
    if (when.getTime() < Date.now()) {
      setError('Pick a time in the future.')
      return
    }
    if (playersNeeded < 1) {
      setError('You need at least 1 player.')
      return
    }

    setBusy(true)
    try {
      await onCreate({
        host_id: user.id,
        sport,
        skill_level: skill,
        date_time: when.toISOString(),
        latitude: pin.lat,
        longitude: pin.lng,
        players_needed: Number(playersNeeded),
        note: note.trim() || null,
      })
    } catch (err) {
      setError(err.message || 'Could not create the game.')
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>New game</h2>
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">✕</button>
      </div>

      <p className="panel-sub">
        📍 Pinned at {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
      </p>

      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Sport</span>
          <select value={sport} onChange={(e) => setSport(e.target.value)}>
            {SPORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Skill level</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value)}>
            {SKILL_LEVELS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Date &amp; time</span>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Players needed</span>
          <input
            type="number"
            min={1}
            max={100}
            value={playersNeeded}
            onChange={(e) => setPlayersNeeded(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Note <em>(optional)</em></span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything players should know — bring cleats, meet at the gate…"
            rows={3}
            maxLength={280}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="panel-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Creating…' : 'Create game'}
          </button>
        </div>
      </form>
    </div>
  )
}
