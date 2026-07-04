import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Fetches all upcoming games (with host profile + participant rows) and exposes
// join/leave helpers plus a refresh. Filtering is done client-side in useMemo.
export function useGames() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchGames = useCallback(async () => {
    setError(null)
    // Only upcoming games. We fetch the host profile and participant rows in one
    // query via PostgREST embedded resources.
    const nowIso = new Date().toISOString()
    const { data, error: err } = await supabase
      .from('games')
      .select(
        `id, sport, skill_level, date_time, latitude, longitude,
         players_needed, note, created_at, host_id,
         host:profiles!games_host_id_fkey ( id, name, reliability_score ),
         participants:game_participants (
           user_id, joined_at,
           profile:profiles!game_participants_user_id_fkey ( id, name )
         )`
      )
      .gte('date_time', nowIso)
      .order('date_time', { ascending: true })

    if (err) {
      setError(err)
      setGames([])
    } else {
      setGames(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    fetchGames().finally(() => {
      if (!active) return
    })
    return () => {
      active = false
    }
  }, [fetchGames])

  const joinGame = useCallback(async (gameId, userId) => {
    const { error: err } = await supabase
      .from('game_participants')
      .insert({ game_id: gameId, user_id: userId })
    if (err) throw err
    await fetchGames()
  }, [fetchGames])

  const leaveGame = useCallback(async (gameId, userId) => {
    const { error: err } = await supabase
      .from('game_participants')
      .delete()
      .eq('game_id', gameId)
      .eq('user_id', userId)
    if (err) throw err
    await fetchGames()
  }, [fetchGames])

  const createGame = useCallback(async (game) => {
    const { data, error: err } = await supabase
      .from('games')
      .insert(game)
      .select('id')
      .single()
    if (err) throw err
    await fetchGames()
    return data
  }, [fetchGames])

  return { games, loading, error, refresh: fetchGames, joinGame, leaveGame, createGame }
}

// Pure helper: filter a games array by sport / skill / time window.
export function filterGames(games, { sport, skill, timeWindow }) {
  const now = Date.now()
  return games.filter((g) => {
    if (sport && sport !== 'all' && g.sport !== sport) return false
    if (skill && skill !== 'all' && g.skill_level !== skill) return false

    if (timeWindow && timeWindow.value !== 'all') {
      const t = new Date(g.date_time).getTime()
      if (timeWindow.sameDay) {
        const d = new Date(g.date_time)
        const today = new Date()
        const sameDay =
          d.getFullYear() === today.getFullYear() &&
          d.getMonth() === today.getMonth() &&
          d.getDate() === today.getDate()
        if (!sameDay) return false
      } else if (timeWindow.hours != null) {
        if (t > now + timeWindow.hours * 3600 * 1000) return false
      }
    }
    return true
  })
}

// Convenience hook wrapping filterGames with memoization.
export function useFilteredGames(games, filters) {
  return useMemo(() => filterGames(games, filters), [games, filters])
}
