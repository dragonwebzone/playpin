import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// ----------------------------------------------------------------------------
// Bracket generation (client-side, single-elimination, seeded with byes).
// Only the host calls this (via startTournament), and only host-owned rows
// can be written per RLS, so a client can't forge someone else's bracket.
// ----------------------------------------------------------------------------
function nextPowerOfTwo(n) {
  let p = 1
  while (p < n) p *= 2
  return p
}

// Standard bracket seeding order (1 vs 8, 4 vs 5, 2 vs 7, 3 vs 6, ...) so top
// seeds are spread apart instead of meeting early.
function seedOrder(size) {
  let order = [1, 2]
  while (order.length < size) {
    const next = []
    const sum = order.length * 2 + 1
    for (const seed of order) {
      next.push(seed, sum - seed)
    }
    order = next
  }
  return order
}

function buildBracketRows(tournamentId, participants) {
  const size = nextPowerOfTwo(participants.length)
  const slots = seedOrder(size).map((seed) => participants[seed - 1]?.user_id || null)
  const totalRounds = Math.log2(size)

  // Build every round's matches up front (empty for rounds > 1), keyed by
  // "round-matchNumber" so we can wire up next_match_id/slot afterwards.
  const rows = []
  const keyOf = (round, matchNumber) => `${round}-${matchNumber}`
  const rowByKey = {}

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round)
    for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber++) {
      const row = {
        tournament_id: tournamentId,
        round,
        match_number: matchNumber,
        player1_id: round === 1 ? slots[(matchNumber - 1) * 2] : null,
        player2_id: round === 1 ? slots[(matchNumber - 1) * 2 + 1] : null,
      }
      rows.push(row)
      rowByKey[keyOf(round, matchNumber)] = row
    }
  }

  // Wire next_match_id / next_match_slot: match `n` in round `r` feeds into
  // match ceil(n/2) in round r+1, slot 1 if n is odd, slot 2 if even.
  // (next_match_id gets filled in after insert, once real ids exist — see
  // startTournament, which does this in a second pass.)
  for (let round = 1; round < totalRounds; round++) {
    const matchesInRound = size / Math.pow(2, round)
    for (let matchNumber = 1; matchNumber <= matchesInRound; matchNumber++) {
      const row = rowByKey[keyOf(round, matchNumber)]
      row._nextKey = keyOf(round + 1, Math.ceil(matchNumber / 2))
      row._nextSlot = matchNumber % 2 === 1 ? 1 : 2
    }
  }

  // A round-1 match where one slot is a bye (null) auto-resolves: the real
  // player is the winner immediately so the bracket doesn't stall.
  for (const row of rows) {
    if (row.round === 1) {
      if (row.player1_id && !row.player2_id) row.winner_id = row.player1_id
      if (row.player2_id && !row.player1_id) row.winner_id = row.player2_id
    }
  }

  return rows
}

// Standalone insert so the create flow (which lives on the map page) doesn't
// need to spin up the whole list hook + its realtime subscriptions.
export async function insertTournament({
  name,
  sport,
  maxPlayers,
  startsAt,
  hostId,
  latitude,
  longitude,
  prize,
  skillLevel,
  note,
  visibility = 'public',
}) {
  const { data, error: err } = await supabase
    .from('tournaments')
    .insert({
      name,
      sport,
      max_players: maxPlayers,
      starts_at: startsAt,
      host_id: hostId,
      latitude,
      longitude,
      prize,
      skill_level: skillLevel,
      note,
      visibility,
    })
    .select()
    .single()
  if (err) throw err
  return data
}

export function useTournaments(sport) {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    // Hide tournaments 24h past their start immediately; pg_cron deletes them
    // server-side on the next hourly tick (see tournaments.sql). Unscheduled
    // (starts_at null) tournaments always show.
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    let query = supabase
      .from('tournaments')
      .select('*, tournament_participants(user_id)')
      .eq('visibility', 'public')
      .or(`starts_at.is.null,starts_at.gte.${cutoff}`)
      .order('created_at', { ascending: false })
    if (sport && sport !== 'all') query = query.eq('sport', sport)
    const { data, error: err } = await query
    if (err) setError(err)
    else setTournaments(data || [])
    setLoading(false)
  }, [sport])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('tournaments-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournament_participants' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [load])

  const joinTournament = async (tournamentId, userId) => {
    const { error: err } = await supabase
      .from('tournament_participants')
      .insert({ tournament_id: tournamentId, user_id: userId })
    if (err) throw err
  }

  const leaveTournament = async (tournamentId, userId) => {
    const { error: err } = await supabase
      .from('tournament_participants')
      .delete()
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
    if (err) throw err
  }

  // Host-only: locks the field and generates the full bracket.
  const startTournament = async (tournamentId) => {
    const { data: participants, error: pErr } = await supabase
      .from('tournament_participants')
      .select('user_id, joined_at')
      .eq('tournament_id', tournamentId)
      .order('joined_at', { ascending: true })
    if (pErr) throw pErr
    if (!participants || participants.length < 2) {
      throw new Error('Need at least 2 players to start.')
    }

    const rows = buildBracketRows(tournamentId, participants)

    // Insert WITHOUT next_match_id (no real ids yet) and WITHOUT winner_id.
    // Byes are applied as a separate update below so the advancement trigger —
    // which only fires when winner_id actually changes — resolves them into
    // round 2. (Inserting winner_id directly would leave old == new, so the
    // AFTER UPDATE trigger would never fire and the bye player would stall.)
    const toInsert = rows.map(({ _nextKey, _nextSlot, winner_id, ...row }) => row)
    const { data: inserted, error: insertErr } = await supabase
      .from('tournament_matches')
      .insert(toInsert)
      .select()
    if (insertErr) throw insertErr

    // Second pass: map round-matchNumber -> real id, then patch next_match_id.
    const idByKey = {}
    for (const row of inserted) idByKey[`${row.round}-${row.match_number}`] = row.id

    const updates = rows
      .filter((r) => r._nextKey && idByKey[r._nextKey])
      .map((r) => ({
        id: idByKey[`${r.round}-${r.match_number}`],
        next_match_id: idByKey[r._nextKey],
        next_match_slot: r._nextSlot,
      }))

    for (const u of updates) {
      const { error: updErr } = await supabase
        .from('tournament_matches')
        .update({ next_match_id: u.next_match_id, next_match_slot: u.next_match_slot })
        .eq('id', u.id)
      if (updErr) throw updErr
    }

    // Now apply bye winners (next_match_id is set, so the trigger advances them).
    const byeWinners = rows
      .filter((r) => r.winner_id)
      .map((r) => ({ id: idByKey[`${r.round}-${r.match_number}`], winner_id: r.winner_id }))
    for (const b of byeWinners) {
      const { error: byeErr } = await supabase
        .from('tournament_matches')
        .update({ winner_id: b.winner_id })
        .eq('id', b.id)
      if (byeErr) throw byeErr
    }

    const { error: statusErr } = await supabase
      .from('tournaments')
      .update({ status: 'in_progress' })
      .eq('id', tournamentId)
    if (statusErr) throw statusErr
  }

  return { tournaments, loading, error, joinTournament, leaveTournament, startTournament }
}

// Single tournament with its live bracket — used inside the detail view.
export function useTournamentDetail(tournamentId) {
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!tournamentId) return
    setLoading(true)
    const [{ data: t }, { data: m }, { data: p }] = await Promise.all([
      supabase.from('tournaments').select('*').eq('id', tournamentId).single(),
      supabase
        .from('tournament_matches')
        .select('*, player1:player1_id(id, name), player2:player2_id(id, name), winner:winner_id(id, name)')
        .eq('tournament_id', tournamentId)
        .order('round', { ascending: true })
        .order('match_number', { ascending: true }),
      supabase
        .from('tournament_participants')
        .select('user_id, profiles(id, name)')
        .eq('tournament_id', tournamentId),
    ])
    setTournament(t || null)
    setMatches(m || [])
    setParticipants(p || [])
    setLoading(false)
  }, [tournamentId])

  useEffect(() => {
    load()
    if (!tournamentId) return
    const channel = supabase
      .channel(`tournament-${tournamentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_matches', filter: `tournament_id=eq.${tournamentId}` },
        load
      )  
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_participants', filter: `tournament_id=eq.${tournamentId}` },
        load
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [tournamentId, load])

  // Host reports a result: sets both scores and declares the winner. The
  // on_match_result trigger handles pushing the winner into the next round.
  const reportScore = async (matchId, { score1, score2, winnerId }) => {
    const { error: err } = await supabase
      .from('tournament_matches')
      .update({ score1, score2, winner_id: winnerId })
      .eq('id', matchId)
    if (err) throw err
  }

  return { tournament, matches, participants, loading, reportScore, reload: load }
}
