# MatCap League

A salary-cap NCAA wrestling fantasy league for you and your friends. Real
React app, shared live data via Supabase, deployable to GitHub Pages for
free.

## How the league works

- 10 roster slots, one per NCAA weight class (125 through 285 lbs).
- $50,000,000 salary cap. Every wrestler has a price based on their rank
  and 2025-26 All-American status.
- **Conference rule:** across your 10 picks, you must have at least one
  wrestler each from Big Ten, Big 12, EIWA, ACC, Ivy League, Pac-12,
  SoCon, and MAC (8 required conferences), *plus* 2 more wild-card picks
  from MAC or SoCon specifically (on top of their own required slot).
  The Roster page shows a live checklist for this.
- 2 lineup swaps allowed per week.
- Anyone in the league can generate weekly matchups and log results —
  there's no single commissioner gatekeeping data entry.
- Scoring: Fall/Pin = 6, Tech Fall = 5, Major Decision = 4, Decision = 3,
  Loss = 0.

The wrestler pool (400 wrestlers, real 2025-26 All-Americans plus
generated depth) is placeholder data seeded from the season that just
finished. See "Refreshing wrestler data" below for updating it once
2026-27 preseason rankings are out.

## One-time setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free account and a
new project. Wait for it to finish provisioning (a couple minutes).

### 2. Run the database schema

In your Supabase project, open **SQL Editor → New query**, paste in the
entire contents of [`supabase/schema.sql`](./supabase/schema.sql), and
click **Run**. This creates all the tables the app needs (managers,
rosters, swap logs, matchups, results, league state) and turns on
realtime sync so everyone's screen updates live.

### 3. Get your API keys

In your Supabase project, go to **Settings → API**. You'll need:
- **Project URL** (looks like `https://xxxxx.supabase.co`)
- **anon public** key (a long string under "Project API keys")

### 4. Configure the app locally

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and paste in your Project URL and anon key:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run it locally

```bash
npm run dev
```

Open the URL it prints (something like `http://localhost:5173/matcap-league/`).
Type a name to join the league, build a roster, and try generating
matchups. Open the same URL in another browser (or incognito window) and
join as a second manager to see the shared/live behavior in action.

## Deploying to GitHub Pages

1. Push this repo to GitHub (the repo name should match what's in
   `vite.config.js` — it currently assumes the repo is named
   `matcap-league`; if you name your GitHub repo something else, update
   the `REPO_NAME` constant in `vite.config.js` to match).
2. In your GitHub repo, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. In your GitHub repo, go to **Settings → Secrets and variables →
   Actions** and add two repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (same values as your `.env.local`)
4. Push to the `main` branch. The included GitHub Actions workflow
   (`.github/workflows/deploy.yml`) will build and deploy automatically.
   Your league will be live at `https://<your-github-username>.github.io/matcap-league/`.

Share that URL with your friends — anyone who opens it can type their
name and join.

## Refreshing wrestler data for the 2026-27 season

All wrestler data lives in `src/data/wrestlers.js`, isolated from the
rest of the app. The `ALL_AMERICANS` object at the top has the real
2025-26 results hardcoded by weight class; everything else (depth
wrestlers, salaries) is generated from that. Closer to November 2026,
replace `ALL_AMERICANS` with real 2026-27 preseason rankings and the
rest of the app — salaries, conference tagging, roster validation — will
flow through automatically. No other file needs to change for a normal
season refresh.

If conference realignment happens (it does, often), update
`src/data/conferences.js` instead — that's the single source of truth
mapping each school to its wrestling conference.

## Project structure

```
src/
  data/
    wrestlers.js       # wrestler pool + salary calculation
    conferences.js      # school -> conference mapping
    rosterRules.js       # the 10-weight + 8-conference + 2-wildcard validator
  lib/
    supabaseClient.js    # Supabase connection
    leagueData.js         # all reads/writes to the shared database
  components/            # UI pages and pieces
  App.jsx                 # wires everything together
supabase/
  schema.sql               # run this once in your Supabase project
```

## Notes

- This uses an open (no-auth) database setup appropriate for a small
  group of trusted friends — anyone with the anon key (which is public
  in the deployed app, by design) can read and write league data. Don't
  reuse this schema for anything sensitive.
- "Login" is just typing your name; there's no password. Your browser
  remembers who you are via `localStorage` so you don't have to retype
  it.
