-- ============================================================================
-- playpin — saved games (bookmarks)
-- Run this in the Supabase SQL Editor AFTER migration.sql. Safe to re-run.
-- ============================================================================

create table if not exists public.saved_games (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  game_id    uuid not null references public.games (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create index if not exists saved_games_user_idx on public.saved_games (user_id);

alter table public.saved_games enable row level security;

-- You can only see, add, and remove your own saves.
drop policy if exists "View own saved games" on public.saved_games;
create policy "View own saved games" on public.saved_games for select
  using (auth.uid() = user_id);

drop policy if exists "Save a game" on public.saved_games;
create policy "Save a game" on public.saved_games for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Unsave a game" on public.saved_games;
create policy "Unsave a game" on public.saved_games for delete
  to authenticated
  using (auth.uid() = user_id);
