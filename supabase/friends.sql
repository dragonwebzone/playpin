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

-- ============================================================================
-- Reciprocal requests → automatic friendship, and no duplicate rows per pair.
-- The unique(requester_id, addressee_id) above only stops duplicates in the
-- SAME direction, so A→B and B→A could both exist and each user would see the
-- other twice. The pieces below make a friendship a single, unordered thing.
-- ============================================================================

-- 1. One-time cleanup of any existing data ---------------------------------

-- If both directions already exist, they both meant to be friends → accept.
update public.friendships f
set status = 'accepted'
where f.status <> 'accepted'
  and exists (
    select 1 from public.friendships g
    where g.requester_id = f.addressee_id and g.addressee_id = f.requester_id
  );

-- Drop the duplicate direction, keeping one row per unordered pair.
delete from public.friendships f
using public.friendships g
where f.requester_id = g.addressee_id
  and f.addressee_id = g.requester_id
  and f.id > g.id;

-- 2. Enforce a single row per unordered pair going forward.
create unique index if not exists friendships_unique_pair
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

-- 3. When a request arrives and the reverse request already exists, both
--    people want to connect: accept the existing row and skip the new insert
--    (returning null cancels it) so there's exactly one accepted friendship.
create or replace function public.on_friend_request()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  reciprocal_id uuid;
begin
  select id into reciprocal_id from public.friendships
   where requester_id = new.addressee_id and addressee_id = new.requester_id
   limit 1;
  if reciprocal_id is not null then
    update public.friendships set status = 'accepted' where id = reciprocal_id;
    return null;
  end if;
  return new;
end; $$;

drop trigger if exists trg_friend_request on public.friendships;
create trigger trg_friend_request
  before insert on public.friendships
  for each row execute function public.on_friend_request();
