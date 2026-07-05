import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Real "players online" via Supabase Realtime Presence. Every open client joins
// a shared channel and is counted — no database table, no fake numbers. Logged-in
// users are keyed by id (multiple tabs dedupe); anonymous viewers get a per-tab key.
export function usePresence(userId) {
  const [online, setOnline] = useState(0)

  useEffect(() => {
    const key = userId || `anon-${Math.random().toString(36).slice(2)}`
    const channel = supabase.channel('playpin-presence', {
      config: { presence: { key } },
    })

    channel.on('presence', { event: 'sync' }, () => {
      setOnline(Object.keys(channel.presenceState()).length)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: Date.now() })
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return online
}
