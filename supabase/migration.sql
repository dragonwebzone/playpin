-- ============================================================================
-- playpin — database schema, Row-Level Security, and signup trigger
-- Paste this whole file into the Supabase SQL Editor and run it once.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- One profile per auth user. Created automatically by a trigger on signup.
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  name              text not null default 'Player',
  reliability_score integer not null default 100,
  created_at        timestamptz not null default now()
);

-- A pickup game pinned to a location.
create table if not exists public.games (
  id             uuid primary key default gen_random_uuid(),
  host_id        uuid not null references public.profiles (id) on delete cascade,
  sport          text not null,
  skill_level    text not null,
  date_time      timestamptz not null,
  latitude       double precision not null,
  longitude      double precision not null,
  players_needed integer not null check (players_needed > 0),
  note           text,
  created_at     timestamptz not null default now()
);

create index if not exists games_date_time_idx on public.games (date_time);
create index if not exists games_host_id_idx  on public.games (host_id);

-- Who has joined which game. Composite primary key prevents double-joining.
create table if not exists public.game_participants (
  game_id   uuid not null references public.games (id) on delete cascade,
  user_id   uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create index if not exists game_participants_user_id_idx on public.game_participants (user_id);

-- ----------------------------------------------------------------------------
-- Row-Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.games             enable row level security;
alter table public.game_participants enable row level security;

-- --- profiles ---------------------------------------------------------------
-- Anyone (including anonymous visitors) can read profiles, so host names and
-- reliability scores are visible on the map.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- A user can update only their own profile.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- --- games ------------------------------------------------------------------
-- Anyone (including anonymous) can read games.
drop policy if exists "Games are viewable by everyone" on public.games;
create policy "Games are viewable by everyone"
  on public.games for select
  using (true);

-- Only an authenticated user can create a game, and only as themselves.
drop policy if exists "Authenticated users can create games" on public.games;
create policy "Authenticated users can create games"
  on public.games for insert
  to authenticated
  with check (auth.uid() = host_id);

-- Only the host can update their own game.
drop policy if exists "Hosts can update own games" on public.games;
create policy "Hosts can update own games"
  on public.games for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- Only the host can delete their own game.
drop policy if exists "Hosts can delete own games" on public.games;
create policy "Hosts can delete own games"
  on public.games for delete
  to authenticated
  using (auth.uid() = host_id);

-- --- game_participants ------------------------------------------------------
-- Anyone (including anonymous) can read the participant list.
drop policy if exists "Participants are viewable by everyone" on public.game_participants;
create policy "Participants are viewable by everyone"
  on public.game_participants for select
  using (true);

-- An authenticated user can join a game, but only insert their own row.
drop policy if exists "Users can join games" on public.game_participants;
create policy "Users can join games"
  on public.game_participants for insert
  to authenticated
  with check (auth.uid() = user_id);

-- An authenticated user can leave a game, but only delete their own row.
drop policy if exists "Users can leave games" on public.game_participants;
create policy "Users can leave games"
  on public.game_participants for delete
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    -- Prefer a name from signup metadata (Google sets name/full_name),
    -- otherwise fall back to the email local-part.
    coalesce(
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1),
      'Player'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Realtime: broadcast changes to games + participants so the map live-updates.
-- Guarded so this whole file stays safe to re-run.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'games'
  ) then
    alter publication supabase_realtime add table public.games;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'game_participants'
  ) then
    alter publication supabase_realtime add table public.game_participants;
  end if;
end $$;
