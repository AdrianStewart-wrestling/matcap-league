# MatCap League

An NCAA wrestling fantasy league for you and your friends. Real React
app, shared live data via Supabase, deployable to GitHub Pages for
free.

## How the league works

- 10 roster slots, one per NCAA weight class (125 through 285 lbs).
- **Champion rule:** at most 1 of your 10 picks may be a 2026 NCAA
  weight-class champion &mdash; zero is fine, but no more than one. The
  Roster page shows a live indicator for this.
- **Conference rule:** your 10 picks must hit an EXACT conference
  distribution, not just a minimum &mdash; exactly 1 each from Big Ten,
  Big 12, EIWA, ACC, Ivy League, and Pac-12 (6 conferences &times; 1 =
  6 picks), plus exactly 2 each from MAC and SoCon (their own required
  slot, plus exactly 1 wild-card pick each; 2 conferences &times; 2 = 4
  picks). 6 + 4 = 10, your whole roster. A conference with 0 picks is
  just as invalid as one with too many. The Roster page shows a live
  count (e.g. "Big Ten: 1/1", "MAC: 2/2") for every required
  conference.
- **Building your initial roster:** before you commit, every slot is
  freely editable &mdash; Swap and Remove always work, with no weekly
  limit and no cost, even on slots you've already filled. Use this
  phase to try out different picks before locking anything in.
- **Committing:** once all 10 weight classes are filled AND both rules
  above are satisfied, a "Commit Roster" button unlocks on the Roster
  page. Until then it's grayed out with a note on what's still missing.
  Commit is a one-way switch &mdash; after committing, editing drops
  into the normal weekly-swap-limited mode described below.
- **After committing:** your roster slots stay locked &mdash; no Swap
  or Remove button appears on a filled weight class &mdash; unless the
  roster is somehow incomplete (e.g. you lost a pick some other way),
  in which case editing re-unlocks until it's full again. Each Swap or
  Remove now costs one of your weekly swaps.
- 2 lineup swaps allowed per week (post-commit only).
- Anyone in the league can generate weekly matchups and log results —
  there's no single commissioner gatekeeping data entry.
- Scoring: Fall/Pin = 6, Tech Fall = 5, Major Decision = 4, Decision = 3,
  Loss = 0.

The wrestler pool (759 wrestlers across all 10 weights) is sourced
from the league's 2026-27 expected-lineups spreadsheet, with returning
2025-26 champion/All-American flags carried over by name match. See
"Refreshing wrestler data" below for how to update it for a future
season.

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

### 2b. Run the "commit roster" migration

If your project predates the commit-roster feature, also run
[`supabase_migration_committed.sql`](./supabase_migration_committed.sql)
in the same SQL editor — it adds the `committed` column to the
`rosters` table that the commit flow relies on. New projects created
after this feature shipped should fold this into `schema.sql` directly
and can skip this step.

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

## Refreshing wrestler data for a new season

All wrestler data lives in `src/data/wrestlers.js`, isolated from the
rest of the app. As of the 2026-27 refresh, the full pool (759
wrestlers across all 10 weights) is sourced from the league's
fan-submitted expected-lineups spreadsheet — one tab per weight class,
alphabetical by last name, not ranked by skill. `rank` on each entry is
just that row order, used for stable sort/display only.

`champion` / `allAmerican` flags are carried over from final 2025-26
NCAA results onto any returning wrestler whose name matched exactly
against the new lineup sheet; anyone who graduated, transferred out,
or didn't match keeps no flag. As of this data pull, weights 141, 174,
and 285 have **no** returning champion at all, since last year's champ
at each of those three weights isn't in the 2026-27 lineup data — so
nobody can satisfy the champion rule at those specific weights.

For a future season refresh: replace the wrestler list in
`src/data/wrestlers.js` with the new season's data (same shape — id,
name, school, weight, rank, year, finish2026, allAmerican, champion),
and conference tagging will flow through automatically via
`conferenceForSchool()`. No other file needs to change for a normal
refresh, unless conference realignment also happened (see below) or
the per-conference target counts (`CONFERENCE_TARGETS` in
`rosterRules.js`) need adjusting.

If conference realignment happens (it does, often), update
`src/data/conferences.js` instead — that's the single source of truth
mapping each school to its wrestling conference.

## Project structure

```
src/
  data/
    wrestlers.js       # wrestler pool + champion flag per weight class
    conferences.js      # school -> conference mapping
    rosterRules.js       # the 10-weight + champion + exact-conference-distribution validator
  lib/
    supabaseClient.js    # Supabase connection
    leagueData.js         # all reads/writes to the shared database
  components/            # UI pages and pieces
  App.jsx                 # wires everything together
supabase/
  schema.sql               # run this once in your Supabase project
supabase_migration_committed.sql  # run once if upgrading an existing project (see step 2b above)
```

## Notes

- This uses an open (no-auth) database setup appropriate for a small
  group of trusted friends — anyone with the anon key (which is public
  in the deployed app, by design) can read and write league data. Don't
  reuse this schema for anything sensitive.
- "Login" is just typing your name; there's no password. Your browser
  remembers who you are via `localStorage` so you don't have to retype
  it.
