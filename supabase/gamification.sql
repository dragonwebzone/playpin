-- ============================================================================
-- playpin — gamification (real XP, levels, counts)
-- Run this in the Supabase SQL Editor AFTER migration.sql. Safe to re-run.
--
-- XP is awarded by database triggers (not the client), so it can't be faked:
--   host a game  → +20 XP, games_hosted +1
--   join a game  → +10 XP, games_joined +1
-- Cancelling a game / leaving reverses the award, so churn nets to zero
-- (no farming). Level is derived from XP in the app (100 XP per level).
-- ============================================================================

alter table public.profiles
  add column if not exists xp           integer not null default 0,
  add column if not exists games_hosted integer not null default 0,
  add column if not exists games_joined integer not null default 0;

-- --- Hosting: award on game insert, reverse on delete -----------------------
create or replace function public.on_game_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
      set xp = xp + 20, games_hosted = games_hosted + 1
      where id = new.host_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles
      set xp = greatest(xp - 20, 0), games_hosted = greatest(games_hosted - 1, 0)
      where id = old.host_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_game_xp on public.games;
create trigger trg_game_xp
  after insert or delete on public.games
  for each row execute function public.on_game_change();

-- --- Joining: award on participant insert, reverse on delete ----------------
create or replace function public.on_participant_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.profiles
      set xp = xp + 10, games_joined = games_joined + 1
      where id = new.user_id;
  elsif TG_OP = 'DELETE' then
    update public.profiles
      set xp = greatest(xp - 10, 0), games_joined = greatest(games_joined - 1, 0)
      where id = old.user_id;
  end if;
  return null;
end; $$;

drop trigger if exists trg_participant_xp on public.game_participants;
create trigger trg_participant_xp
  after insert or delete on public.game_participants
  for each row execute function public.on_participant_change();

-- --- Backfill standings from any games/participants that already exist ------
update public.profiles p set
  games_hosted = (select count(*) from public.games g where g.host_id = p.id),
  games_joined = (select count(*) from public.game_participants gp where gp.user_id = p.id),
  xp = (select count(*) from public.games g where g.host_id = p.id) * 20
     + (select count(*) from public.game_participants gp where gp.user_id = p.id) * 10;
