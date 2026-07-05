-- ============================================================================
-- playpin — friends (friend requests + accepted friendships)
-- Run this in the Supabase SQL Editor AFTER migration.sql. Safe to re-run.
-- ============================================================================

create table if not exists public.friendships (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at   timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create index if not exists friendships_requester_idx on public.friendships (requester_id);
create index if not exists friendships_addressee_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

-- You can see friendship rows you're part of (either direction).
drop policy if exists "View own friendships" on public.friendships;
create policy "View own friendships" on public.friendships for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- You can send a request only as yourself.
drop policy if exists "Send friend request" on public.friendships;
create policy "Send friend request" on public.friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

-- Only the addressee can accept a pending request.
drop policy if exists "Respond to friend request" on public.friendships;
create policy "Respond to friend request" on public.friendships for update
  to authenticated
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id);

-- Either party can decline / unfriend (delete the row).
drop policy if exists "Remove friendship" on public.friendships;
create policy "Remove friendship" on public.friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);
