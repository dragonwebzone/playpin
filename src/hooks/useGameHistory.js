import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GAME_COLS = `id, sport, skill_level, date_time, latitude, longitude,
  players_needed, note, host_id,
  participants:game_participants ( user_id )`

// Fetches the current user's PAST games — both the ones they hosted and the
// ones they joined — since the live `useGames` hook only loads upcoming games.
// Returns each game tagged with `role` ('hosted' | 'joined'), newest first.
export function useGameHistory(userId) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!userId) {
      setHistory([])
      return
    }
    setLoading(true)
    setError(null)
    const nowIso = new Date().toISOString()
    try {
      // Games I hosted that have already passed.
      const hostedP = supabase
        .from('games')
        .select(GAME_COLS)
        .eq('host_id', userId)
        .lt('date_time', nowIso)

      // Game ids I joined, then the past ones among them.
      const partP = supabase
        .from('game_participants')
        .select('game_id')
        .eq('user_id', userId)

      const [{ data: hosted, error: hErr }, { data: partRows, error: pErr }] =
        await Promise.all([hostedP, partP])
      if (hErr) throw hErr
      if (pErr) throw pErr

      let joined = []
      const ids = (partRows || []).map((r) => r.game_id)
      if (ids.length) {
        const { data: joinedGames, error: jErr } = await supabase
          .from('games')
          .select(GAME_COLS)
          .in('id', ids)
          .lt('date_time', nowIso)
        if (jErr) throw jErr
        joined = joinedGames || []
      }

      // Merge + dedupe by id (host takes precedence), tag role, sort newest first.
      const byId = new Map()
      for (const g of joined) byId.set(g.id, { ...g, role: 'joined' })
      for (const g of hosted || []) byId.set(g.id, { ...g, role: 'hosted' })
      const merged = [...byId.values()].sort(
        (a, b) => new Date(b.date_time) - new Date(a.date_time)
      )
      setHistory(merged)
    } catch (err) {
      setError(err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  return { history, loading, error, refresh: load }
}
