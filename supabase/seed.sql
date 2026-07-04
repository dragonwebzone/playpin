-- ============================================================================
-- playpin — seed data: 2 demo hosts + 6 sample games around San Francisco
-- Run this AFTER migration.sql, in the Supabase SQL Editor.
--
-- This creates two demo auth users so the sample games have real hosts.
-- Demo logins (you can sign in as these on the deployed site):
--   alex@playpin.demo   / playpin123
--   sam@playpin.demo    / playpin123
--
-- Safe to re-run: it upserts by fixed UUIDs and only inserts games if none exist.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Demo auth users. We insert directly into auth.users with a bcrypt password.
-- ----------------------------------------------------------------------------
insert into auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'alex@playpin.demo',
    crypt('playpin123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Alex Rivera"}',
    now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'sam@playpin.demo',
    crypt('playpin123', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Sam Okafor"}',
    now(), now()
  )
on conflict (id) do nothing;

-- Give the demo users an email identity so they can log in with email/password.
insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, created_at, updated_at
)
values
  (
    gen_random_uuid(), '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111', 'email',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"alex@playpin.demo"}',
    now(), now()
  ),
  (
    gen_random_uuid(), '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222', 'email',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"sam@playpin.demo"}',
    now(), now()
  )
on conflict (provider_id, provider) do nothing;

-- Ensure profiles exist (the signup trigger normally handles this).
insert into public.profiles (id, name, reliability_score)
values
  ('11111111-1111-1111-1111-111111111111', 'Alex Rivera', 96),
  ('22222222-2222-2222-2222-222222222222', 'Sam Okafor', 88)
on conflict (id) do update
  set name = excluded.name,
      reliability_score = excluded.reliability_score;

-- ----------------------------------------------------------------------------
-- Sample games around San Francisco (only if no games exist yet).
-- date_time values are relative to now() so they always look "upcoming".
-- ----------------------------------------------------------------------------
insert into public.games (host_id, sport, skill_level, date_time, latitude, longitude, players_needed, note)
select * from (values
  ('11111111-1111-1111-1111-111111111111', 'basketball', 'casual',      now() + interval '90 minutes', 37.7694, -122.4862, 8, 'Half-court runs at the park. Bring a light + dark shirt.'),
  ('22222222-2222-2222-2222-222222222222', 'football',   'competitive', now() + interval '4 hours',    37.7599, -122.4148, 10, '5-a-side on turf. Cleats recommended.'),
  ('11111111-1111-1111-1111-111111111111', 'tennis',     'beginner',    now() + interval '1 day',      37.8021, -122.4370, 3, 'Doubles, all levels welcome. I have spare rackets.'),
  ('22222222-2222-2222-2222-222222222222', 'badminton',  'casual',      now() + interval '2 days',     37.7847, -122.4079, 4, 'Indoor courts booked for an hour. Shuttles provided.'),
  ('11111111-1111-1111-1111-111111111111', 'cricket',    'competitive', now() + interval '3 days',     37.7204, -122.4750, 12, 'Tape-ball match. Golden Gate Park meadow.'),
  ('22222222-2222-2222-2222-222222222222', 'other',      'beginner',    now() + interval '5 hours',    37.7749, -122.4194, 6, 'Casual frisbee / pickup ultimate. Newbies encouraged!')
) as v(host_id, sport, skill_level, date_time, latitude, longitude, players_needed, note)
where not exists (select 1 from public.games);

-- A couple of participants so the "joined" lists aren't empty.
insert into public.game_participants (game_id, user_id)
select g.id, '22222222-2222-2222-2222-222222222222'
from public.games g
where g.host_id = '11111111-1111-1111-1111-111111111111'
  and g.sport = 'basketball'
on conflict do nothing;

insert into public.game_participants (game_id, user_id)
select g.id, '11111111-1111-1111-1111-111111111111'
from public.games g
where g.host_id = '22222222-2222-2222-2222-222222222222'
  and g.sport = 'football'
on conflict do nothing;
