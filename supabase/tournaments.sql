-- ============================================================================
-- playpin — tournaments (single-elimination brackets)
-- Run this in the Supabase SQL Editor AFTER migration.sql + gamification.sql.
-- Safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- A tournament, hosted by a user, for a given sport.
create table if not exists public.tournaments (
  id             uuid primary key default gen_random_uuid(),
  host_id        uuid not null references public.profiles (id) on delete cascade,
  name           text not null,
  sport          text not null,
  max_players    integer not null check (max_players >= 2 and max_players <= 64),
  status         text not null default 'open' check (status in ('open', 'in_progress', 'completed')),
  starts_at      timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists tournaments_status_idx on public.tournaments (status);
create index if not exists tournaments_host_id_idx on public.tournaments (host_id);

-- Tournaments now carry a map location and game-style details (added after the
-- original release; nullable so pre-existing rows stay valid).
alter table public.tournaments add column if not exists latitude    double precision;
alter table public.tournaments add column if not exists longitude   double precision;
alter table public.tournaments add column if not exists prize       text;
alter table public.tournaments add column if not exists skill_level text;
alter table public.tournaments add column if not exists note        text;

-- Who has joined which tournament. Composite primary key prevents double-joining.
create table if not exists public.tournament_participants (
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  seed          integer,
  joined_at     timestamptz not null default now(),
  primary key (tournament_id, user_id)
);

-- Single-elimination bracket matches. Each match optionally points at the
-- match its winner advances to (next_match_id), and a slot (1 or 2) telling
-- the trigger which side of that next match to fill.
create table if not exists public.tournament_matches (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments (id) on delete cascade,
  round            integer not null,
  match_number     integer not null,
  player1_id       uuid references public.profiles (id) on delete set null,
  player2_id       uuid references public.profiles (id) on delete set null,
  score1           integer,
  score2           integer,
  winner_id        uuid references public.profiles (id) on delete set null,
  next_match_id    uuid references public.tournament_matches (id) on delete set null,
  next_match_slot  integer check (next_match_slot in (1, 2)),
  created_at       timestamptz not null default now(),
  unique (tournament_id, round, match_number)
);

create index if not exists tournament_matches_tournament_id_idx on public.tournament_matches (tournament_id);

-- ----------------------------------------------------------------------------
-- Row-Level Security (mirrors migration.sql: everyone can read, only the
-- relevant owner can write their own rows)
-- ----------------------------------------------------------------------------

alter table public.tournaments             enable row level security;
alter table public.tournament_participants enable row level security;
alter table public.tournament_matches      enable row level security;

-- --- tournaments -------------------------------------------------------------
drop policy if exists "Tournaments are viewable by everyone" on public.tournaments;
create policy "Tournaments are viewable by everyone"
  on public.tournaments for select
  using (true);

drop policy if exists "Authenticated users can create tournaments" on public.tournaments;
create policy "Authenticated users can create tournaments"
  on public.tournaments for insert
  to authenticated
  with check (auth.uid() = host_id);

drop policy if exists "Hosts can update own tournaments" on public.tournaments;
create policy "Hosts can update own tournaments"
  on public.tournaments for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

drop policy if exists "Hosts can delete own tournaments" on public.tournaments;
create policy "Hosts can delete own tournaments"
  on public.tournaments for delete
  to authenticated
  using (auth.uid() = host_id);

-- --- tournament_participants -------------------------------------------------
drop policy if exists "Tournament participants are viewable by everyone" on public.tournament_participants;
create policy "Tournament participants are viewable by everyone"
  on public.tournament_participants for select
  using (true);

drop policy if exists "Users can join tournaments" on public.tournament_participants;
create policy "Users can join tournaments"
  on public.tournament_participants for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave tournaments" on public.tournament_participants;
create policy "Users can leave tournaments"
  on public.tournament_participants for delete
  to authenticated
  using (auth.uid() = user_id);

-- --- tournament_matches ------------------------------------------------------
drop policy if exists "Tournament matches are viewable by everyone" on public.tournament_matches;
create policy "Tournament matches are viewable by everyone"
  on public.tournament_matches for select
  using (true);

-- Only the tournament host can create/update matches. Scores get reported
-- through the host (matches the host-controls-the-game pattern elsewhere).
drop policy if exists "Hosts manage own tournament matches" on public.tournament_matches;
create policy "Hosts manage own tournament matches"
  on public.tournament_matches for all
  to authenticated
  using (exists (
    select 1 from public.tournaments t
    where t.id = tournament_matches.tournament_id and t.host_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.tournaments t
    where t.id = tournament_matches.tournament_id and t.host_id = auth.uid()
  ));

-- ----------------------------------------------------------------------------
-- Bracket advancement: when a match's winner_id is set, push that player into
-- the correct slot of next_match_id. Mirrors the trigger-driven, can't-be-
-- faked-by-the-client style used for XP in gamification.sql.
-- ----------------------------------------------------------------------------

create or replace function public.on_match_result()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.winner_id is not null and new.winner_id is distinct from old.winner_id then
    if new.next_match_id is not null then
      if new.next_match_slot = 1 then
        update public.tournament_matches set player1_id = new.winner_id where id = new.next_match_id;
      else
        update public.tournament_matches set player2_id = new.winner_id where id = new.next_match_id;
      end if;
    else
      -- No next match means this was the final — mark the tournament complete.
      update public.tournaments set status = 'completed' where id = new.tournament_id;
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_match_result on public.tournament_matches;
create trigger trg_match_result
  after update on public.tournament_matches
  for each row execute function public.on_match_result();

-- ----------------------------------------------------------------------------
-- Realtime: broadcast changes so brackets live-update for everyone watching.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tournaments'
  ) then
    alter publication supabase_realtime add table public.tournaments;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tournament_participants'
  ) then
    alter publication supabase_realtime add table public.tournament_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'tournament_matches'
  ) then
    alter publication supabase_realtime add table public.tournament_matches;
  end if;
end $$;
