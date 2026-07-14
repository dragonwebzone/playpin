import { useState } from 'react'
import { SPORTS, SKILL_LEVELS } from '../lib/constants'
import { useAuth } from '../context/AuthContext'

// Default start to ~tomorrow, formatted for datetime-local.
function defaultDateTime() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000)
  d.setMinutes(0, 0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Slide-up form shown after the host drops a pin for a tournament. Same shape as
// CreateGameForm plus a name, a player cap (bracket size), and optional prize.
// `pin` is { lat, lng }.
export default function CreateTournamentForm({ pin, onCancel, onCreate }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [sport, setSport] = useState('football')
  const [skill, setSkill] = useState('casual')
  const [dateTime, setDateTime] = useState(defaultDateTime())
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [visibility, setVisibility] = useState('public')
  const [prize, setPrize] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Give your tournament a name.')
      return
    }
    const when = new Date(dateTime)
    if (Number.isNaN(when.getTime())) {
      setError('Please pick a valid date and time.')
      return
    }
    if (when.getTime() < Date.now()) {
      setError('Pick a start time in the future.')
      return
    }
    const cap = Number(maxPlayers)
    if (cap < 2 || cap > 64) {
      setError('Player cap must be between 2 and 64.')
      return
    }

    setBusy(true)
    try {
      await onCreate({
        hostId: user.id,
        name: name.trim(),
        sport,
        skillLevel: skill,
        startsAt: when.toISOString(),
        maxPlayers: cap,
        latitude: pin.lat,
        longitude: pin.lng,
        prize: prize.trim() || null,
        note: note.trim() || null,
        visibility,
      })
    } catch (err) {
      setError(err.message || 'Could not create the tournament.')
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>New tournament</h2>
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">✕</button>
      </div>

      <p className="panel-sub">
        📍 Pinned at {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
      </p>

      <form onSubmit={submit} className="form">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Saturday 5-a-side cup"
            autoFocus
          />
        </label>

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
          <span>Starts</span>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Visibility</span>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="public">Public — anyone can find and join</option>
            <option value="invite">Invite only — join via share link</option>
          </select>
        </label>

        <label className="field">
          <span>Player cap <em>(bracket size)</em></span>
          <input
            type="number"
            min={2}
            max={64}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>Prize <em>(optional)</em></span>
          <input
            type="text"
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            placeholder="$100 pot, trophy, bragging rights…"
            maxLength={80}
          />
        </label>

        <label className="field">
          <span>Note <em>(optional)</em></span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Format, rules, what to bring…"
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
            {busy ? 'Creating…' : 'Create tournament'}
          </button>
        </div>
      </form>
    </div>
  )
}
