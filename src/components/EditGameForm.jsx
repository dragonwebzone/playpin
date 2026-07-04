import { useState } from 'react'
import { SPORTS, SKILL_LEVELS } from '../lib/constants'

// Convert an ISO timestamp to the value a <input type="datetime-local"> expects.
function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Host-only edit form for an existing game. `game` is the full game row.
export default function EditGameForm({ game, onCancel, onSave }) {
  const [sport, setSport] = useState(game.sport)
  const [skill, setSkill] = useState(game.skill_level)
  const [dateTime, setDateTime] = useState(toLocalInput(game.date_time))
  const [playersNeeded, setPlayersNeeded] = useState(game.players_needed)
  const [note, setNote] = useState(game.note || '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const joinedCount = game.participants?.length || 0

  const submit = async (e) => {
    e.preventDefault()
    setError(null)

    const when = new Date(dateTime)
    if (Number.isNaN(when.getTime())) {
      setError('Please pick a valid date and time.')
      return
    }
    if (Number(playersNeeded) < 1) {
      setError('You need at least 1 player.')
      return
    }
    if (Number(playersNeeded) < joinedCount) {
      setError(`${joinedCount} already joined — players needed can’t be lower than that.`)
      return
    }

    setBusy(true)
    try {
      await onSave(game.id, {
        sport,
        skill_level: skill,
        date_time: when.toISOString(),
        players_needed: Number(playersNeeded),
        note: note.trim() || null,
      })
    } catch (err) {
      setError(err.message || 'Could not save changes.')
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>Edit game</h2>
        <button className="icon-btn" onClick={onCancel} aria-label="Cancel">✕</button>
      </div>

      <p className="panel-sub">Location stays the same — create a new game to move the pin.</p>

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
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
