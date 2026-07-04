# 📍 playpin

A pickup-sports meetup platform. Drop a pin on a map to organize a game —
football, cricket, badminton, basketball, tennis, and more — and let others
nearby join. Runs entirely in the browser: **React (Vite)** frontend talking
directly to **Supabase** (Postgres + Auth) via `@supabase/supabase-js`, with
**Google Maps** for the map. No custom backend server.

- Full-screen map centered on your location, markers for every upcoming game
- Create a game by dropping a pin and filling a short form
- Game detail panel with host, reliability score, joined players, and spots left
- Join / Leave games, with a "Full" state at capacity
- Filter by sport, skill level, and time window (next 2 hours / today / this week)
- Mobile-first responsive design

---

## Tech stack

| Piece    | Choice                                   |
| -------- | ---------------------------------------- |
| Frontend | React 18 + Vite                          |
| Data/Auth| Supabase (Postgres, Row-Level Security, Auth) |
| Map      | Google Maps JavaScript API               |
| Hosting  | Vercel                                    |

All secrets are read from environment variables — see [`.env.example`](.env.example).
Nothing is hardcoded.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com> and sign in.
2. **New project** → give it a name, set a database password, pick a region.
3. Wait for it to finish provisioning (~1–2 minutes).

## 2. Run the migration SQL

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Copy the entire contents of [`supabase/migration.sql`](supabase/migration.sql)
   into the editor and click **Run**. This creates the `profiles`, `games`, and
   `game_participants` tables, all Row-Level Security policies, and the trigger
   that auto-creates a profile when someone signs up.
3. *(Optional, recommended for a nice first look)* Open a new query, paste
   [`supabase/seed.sql`](supabase/seed.sql), and **Run** it. This adds two demo
   host accounts and 6 sample games around San Francisco. Demo logins:
   - `alex@playpin.demo` / `playpin123`
   - `sam@playpin.demo` / `playpin123`

### Auth note (email confirmation)
By default Supabase may require email confirmation. For fast local testing you
can turn it off: **Authentication → Providers → Email → disable "Confirm email"**.
Leave it on for production if you want verified emails.

## 3. Get the three keys

**Supabase** — in your project go to **Project Settings → API**:
- `VITE_SUPABASE_URL` = the **Project URL**
- `VITE_SUPABASE_ANON_KEY` = the **anon / public** key
  (safe to expose in the browser; Row-Level Security protects your data)

**Google Maps** — in the [Google Cloud Console](https://console.cloud.google.com/):
1. Create/select a project → **APIs & Services → Library** → enable **both**:
   - **Maps JavaScript API** (the map itself)
   - **Places API (New)** (the "search a place" box on the map)
2. **APIs & Services → Credentials → Create credentials → API key**.
3. `VITE_GOOGLE_MAPS_API_KEY` = that key. Restrict it to those two APIs and to
   your site's HTTP referrers for safety.
   > Google Maps requires a billing account enabled, even for the free tier.
   > If the search box shows no suggestions, **Places API (New)** isn't enabled.

## 4. Run locally

```bash
# 1. install dependencies
npm install

# 2. create your env file and fill in the three keys
cp .env.example .env
#   then edit .env

# 3. start the dev server
npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>).

## 5. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to <https://vercel.com> → **Add New… → Project** → import the repo.
3. Vercel auto-detects Vite (Build command `npm run build`, output `dist`).
   The included [`vercel.json`](vercel.json) adds the SPA rewrite so refreshes work.
4. **Set the environment variables** before/at deploy time:
   **Project → Settings → Environment Variables**, add all three for the
   **Production** (and Preview) environments:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GOOGLE_MAPS_API_KEY`

   > Vite inlines `VITE_*` vars at **build time**, so if you add or change them
   > after a deploy, trigger a **Redeploy**.
5. Deploy. Then add your Vercel domain to the Google Maps key's allowed
   referrers, and (if you enabled it) to Supabase **Authentication → URL
   Configuration** as a redirect/site URL.

---

## Project structure

```
playpin/
├── .env.example              # documents the 3 required env vars
├── index.html
├── vercel.json               # SPA rewrites for Vercel
├── supabase/
│   ├── migration.sql         # schema + RLS policies + signup trigger
│   └── seed.sql              # 2 demo hosts + 6 sample games
└── src/
    ├── main.jsx              # app entry, wraps App in AuthProvider
    ├── App.jsx               # top-level layout + state orchestration
    ├── index.css             # mobile-first styles
    ├── lib/
    │   ├── supabase.js       # Supabase client from env vars
    │   └── constants.js      # sports, skill levels, time windows, defaults
    ├── context/AuthContext.jsx   # session + profile + auth helpers
    ├── hooks/
    │   ├── useGoogleMaps.js  # loads the Maps JS API once
    │   └── useGames.js       # fetch games/participants, join/leave, filtering
    └── components/
        ├── MapView.jsx       # full-screen map, markers, create-mode pin
        ├── FilterBar.jsx     # sport / skill / time filters
        ├── AuthModal.jsx     # login & signup
        ├── CreateGameForm.jsx# form after dropping a pin
        ├── GameDetailPanel.jsx # detail + Join/Leave
        └── Spinner.jsx
```

## Data model

- **profiles** `(id → auth.users, name, reliability_score default 100, created_at)`
- **games** `(id, host_id → profiles, sport, skill_level, date_time, latitude,
  longitude, players_needed, note, created_at)`
- **game_participants** `(game_id → games, user_id → profiles, joined_at)` with a
  composite primary key `(game_id, user_id)` so no one joins twice.

Row-Level Security summary:
- **Read**: anyone (including anonymous) can read games and participants.
- **Create game**: authenticated users only, and only as themselves (`host_id = auth.uid()`).
- **Update/Delete game**: only the host.
- **Join/Leave**: authenticated users, only inserting/deleting their own participant row.

## Out of scope (by design)

No chat, payments, stakes, or post-game ratings — this is a focused MVP.

## Scripts

```bash
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```
