import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { distanceKm } from '../lib/constants'

// Fetches all upcoming games (with host profile + participant rows) and exposes
// join/leave helpers plus a refresh. Filtering is done client-side in useMemo.
// `onActivity(event)` (optional) fires on live inserts for the activity feed.
export function useGames({ onActivity } = {}) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const onActivityRef = useRef(onActivity)
  onActivityRef.current = onActivity

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

  // Live updates: re-fetch whenever any game or participant row changes, so new
  // games, joins, and leaves appear for everyone without a manual refresh.
  // Requires Realtime to be enabled for these tables in Supabase (see README).
  useEffect(() => {
    // Debounce bursts of changes into a single refetch.
    let timer = null
    const scheduleRefetch = () => {
      clearTimeout(timer)
      timer = setTimeout(() => fetchGames(), 250)
    }

    const channel = supabase
      .channel('playpin-games')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          onActivityRef.current?.({ type: 'new_game', sport: payload.new.sport, hostId: payload.new.host_id })
        }
        scheduleRefetch()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_participants' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new) {
          onActivityRef.current?.({ type: 'join', gameId: payload.new.game_id, userId: payload.new.user_id })
        }
        scheduleRefetch()
      })
      .subscribe()

    // Also drop games that have passed their start time, once a minute.
    const interval = setInterval(() => fetchGames(), 60 * 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
      supabase.removeChannel(channel)
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

  // Host-only edit. RLS ensures only the host can update their own game.
  const updateGame = useCallback(async (gameId, fields) => {
    const { error: err } = await supabase
      .from('games')
      .update(fields)
      .eq('id', gameId)
    if (err) throw err
    await fetchGames()
  }, [fetchGames])

  // Host-only cancel. RLS ensures only the host can delete their own game;
  // participant rows are removed automatically via ON DELETE CASCADE.
  const deleteGame = useCallback(async (gameId) => {
    const { error: err } = await supabase.from('games').delete().eq('id', gameId)
    if (err) throw err
    await fetchGames()
  }, [fetchGames])

  return {
    games,
    loading,
    error,
    refresh: fetchGames,
    joinGame,
    leaveGame,
    createGame,
    updateGame,
    deleteGame,
  }
}

// Games are never surfaced more than this far from the user, regardless of the
// selected radius — "games near me" is capped at 50 km around the user.
export const MAX_RADIUS_KM = 50

// Pure helper: filter a games array by sport / skill / time window / friends /
// distance from the user ("near me").
export function filterGames(
  games,
  { sport, skill, timeWindow, friendsOnly, friendIds, radiusKm, userLocation }
) {
  const now = Date.now()
  return games.filter((g) => {
    if (sport && sport !== 'all' && g.sport !== sport) return false
    if (skill && skill !== 'all' && g.skill_level !== skill) return false

    // "Near me": once we know where the user is, never show games more than
    // 50 km away (or a tighter chosen radius). Skipped until geolocation
    // resolves, since we can't measure distance without the user's location.
    if (userLocation) {
      const cap = Math.min(radiusKm ?? MAX_RADIUS_KM, MAX_RADIUS_KM)
      const d = distanceKm(userLocation, { lat: g.latitude, lng: g.longitude })
      if (d != null && d > cap) return false
    }

    if (friendsOnly && friendIds) {
      const byFriend =
        friendIds.has(g.host_id) ||
        (g.participants || []).some((p) => friendIds.has(p.user_id))
      if (!byFriend) return false
    }

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
