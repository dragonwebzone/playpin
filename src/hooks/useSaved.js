import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Tracks the set of game IDs the current user has bookmarked, with a toggle.
export function useSaved(userId) {
  const [savedIds, setSavedIds] = useState(new Set())

  const fetchSaved = useCallback(async () => {
    if (!userId) {
      setSavedIds(new Set())
      return
    }
    const { data } = await supabase
      .from('saved_games')
      .select('game_id')
      .eq('user_id', userId)
    setSavedIds(new Set((data ?? []).map((r) => r.game_id)))
  }, [userId])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  const toggleSave = useCallback(
    async (gameId) => {
      if (!userId) return
      const isSaved = savedIds.has(gameId)
      // Optimistic update.
      setSavedIds((cur) => {
        const next = new Set(cur)
        if (isSaved) next.delete(gameId)
        else next.add(gameId)
        return next
      })
      if (isSaved) {
        await supabase.from('saved_games').delete().eq('user_id', userId).eq('game_id', gameId)
      } else {
        await supabase.from('saved_games').insert({ user_id: userId, game_id: gameId })
      }
    },
    [userId, savedIds]
  )

  return { savedIds, toggleSave, refresh: fetchSaved }
}
