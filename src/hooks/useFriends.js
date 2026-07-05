import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

// Manages the current user's friendships: accepted friends, incoming/outgoing
// requests, and actions to send/accept/remove. Also exposes a user search.
export function useFriends(userId) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchFriends = useCallback(async () => {
    if (!userId) {
      setRows([])
      return
    }
    setLoading(true)
    const { data } = await supabase
      .from('friendships')
      .select(
        `id, status, requester_id, addressee_id,
         requester:profiles!friendships_requester_id_fkey ( id, name, xp ),
         addressee:profiles!friendships_addressee_id_fkey ( id, name, xp )`
      )
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    setRows(data ?? [])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const { friends, incoming, outgoing, friendIds, relationByUser } = useMemo(() => {
    const friends = []
    const incoming = []
    const outgoing = []
    const friendIds = new Set()
    const relationByUser = new Map() // otherUserId -> { status, direction, row }

    for (const r of rows) {
      const iAmRequester = r.requester_id === userId
      const other = iAmRequester ? r.addressee : r.requester
      if (!other) continue
      if (r.status === 'accepted') {
        friends.push({ ...other, row: r })
        friendIds.add(other.id)
        relationByUser.set(other.id, { status: 'accepted', row: r })
      } else if (iAmRequester) {
        outgoing.push({ ...other, row: r })
        relationByUser.set(other.id, { status: 'outgoing', row: r })
      } else {
        incoming.push({ ...other, row: r })
        relationByUser.set(other.id, { status: 'incoming', row: r })
      }
    }
    return { friends, incoming, outgoing, friendIds, relationByUser }
  }, [rows, userId])

  const sendRequest = useCallback(
    async (addresseeId) => {
      const { error } = await supabase
        .from('friendships')
        .insert({ requester_id: userId, addressee_id: addresseeId })
      if (error) throw error
      await fetchFriends()
    },
    [userId, fetchFriends]
  )

  const acceptRequest = useCallback(
    async (rowId) => {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', rowId)
      if (error) throw error
      await fetchFriends()
    },
    [fetchFriends]
  )

  const removeFriendship = useCallback(
    async (rowId) => {
      const { error } = await supabase.from('friendships').delete().eq('id', rowId)
      if (error) throw error
      await fetchFriends()
    },
    [fetchFriends]
  )

  const searchUsers = useCallback(
    async (query) => {
      const q = query.trim()
      if (!q) return []
      const { data } = await supabase
        .from('profiles')
        .select('id, name, xp')
        .ilike('name', `%${q}%`)
        .neq('id', userId)
        .limit(8)
      return data ?? []
    },
    [userId]
  )

  return {
    friends,
    incoming,
    outgoing,
    friendIds,
    relationByUser,
    loading,
    refresh: fetchFriends,
    sendRequest,
    acceptRequest,
    removeFriendship,
    searchUsers,
  }
}
