-- ============================================================
-- MatCap League — multi-league migration
-- Run this once in your Supabase project's SQL Editor, AFTER
-- schema.sql and supabase_migration_committed.sql have already
-- been run. This turns the single shared league into a
-- multi-tenant setup: many leagues, each with their own
-- managers/rosters/matchups/results, sharing one deployment.
--
-- Existing data is preserved: everything that already exists
-- gets assigned to a new "default" league, identified below as
-- DEFAULT_LEAGUE_ID, so your current league keeps working with
-- its existing join link continuing to behave the same way it
-- always has (no ?league= param = falls back to this league —
-- see the app-side note in leagueData.js for how that fallback
-- works).
-- ============================================================

-- ------------------------------------------------------------
-- 1. New leagues table.
-- ------------------------------------------------------------
create table if not exists leagues (
  id text primary key,       -- short slug, used as the ?league= URL param
  name text not null,
  created_at timestamptz default now()
);

-- Seed the default league that all your existing data will be
-- assigned to. Change the id/name here before running if you
-- want something other than "default" / "MatCap League".
insert into leagues (id, name) values ('default', 'MatCap League')
  on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Add league_id to every existing table, backfill it to the
--    default league, then make it required going forward.
-- ------------------------------------------------------------
alter table managers add column if not exists league_id text references leagues(id);
update managers set league_id = 'default' where league_id is null;
alter table managers alter column league_id set not null;

alter table rosters add column if not exists league_id text references leagues(id);
update rosters set league_id = 'default' where league_id is null;
alter table rosters alter column league_id set not null;

alter table swap_log add column if not exists league_id text references leagues(id);
update swap_log set league_id = 'default' where league_id is null;
alter table swap_log alter column league_id set not null;

-- (matchups_pkey / results_pkey below are Postgres's standard default
-- name for a primary key constraint, "tablename_pkey" — this is a very
-- consistent convention, but if either was renamed, find the real name
-- with: select conname from pg_constraint where conrelid = 'matchups'::regclass and contype = 'p';)
alter table matchups add column if not exists league_id text references leagues(id);
update matchups set league_id = 'default' where league_id is null;
alter table matchups alter column league_id set not null;
-- week_key alone was the primary key before, which is fine with one
-- league but breaks the moment a second league also has a "wk1" row —
-- two leagues' week 1 would collide on the same primary key. Switch to
-- a composite (league_id, week_key) key instead.
alter table matchups drop constraint if exists matchups_pkey;
alter table matchups add primary key (league_id, week_key);

alter table results add column if not exists league_id text references leagues(id);
update results set league_id = 'default' where league_id is null;
alter table results alter column league_id set not null;
-- Same fix as matchups above, same reason.
alter table results drop constraint if exists results_pkey;
alter table results add primary key (league_id, week_key);

-- ------------------------------------------------------------
-- 3. Fix manager-name uniqueness: it was globally unique, which
--    breaks the moment two different leagues both have a
--    manager named e.g. "Jordan". Drop the old global unique
--    constraint and replace it with a per-league one.
--
--    NOTE: the exact constraint name below
--    (managers_name_key) is Postgres's default auto-generated
--    name for a `unique` column constraint declared inline, as
--    in schema.sql's `name text not null unique`. If you
--    previously renamed it, adjust this line to match — you can
--    confirm the real name by running:
--      select conname from pg_constraint where conrelid = 'managers'::regclass;
-- ------------------------------------------------------------
alter table managers drop constraint if exists managers_name_key;
alter table managers add constraint managers_league_name_unique unique (league_id, name);

-- ------------------------------------------------------------
-- 4. league_state was a hardcoded singleton (id always = 1).
--    Replace it with one row per league, keyed by league_id.
-- ------------------------------------------------------------
alter table league_state add column if not exists league_id text references leagues(id);
update league_state set league_id = 'default' where league_id is null;

-- Drop the old singleton primary key + check constraint, and
-- make league_id the new primary key instead (one row per
-- league, not one row total).
alter table league_state drop constraint if exists league_state_pkey;
alter table league_state drop constraint if exists single_row;
alter table league_state alter column league_id set not null;
alter table league_state add primary key (league_id);

-- The old `id` column (always 1) is no longer meaningful. It's
-- left in place rather than dropped, since dropping a column
-- that used to be the primary key is occasionally finicky
-- depending on what else references it — harmless to leave, and
-- the app no longer reads or writes it.

-- ------------------------------------------------------------
-- 5. league_state needs an INSERT policy now, which the original
--    single-league schema never had (its one row was inserted
--    manually, once, via schema.sql itself). The app's
--    fetchCurrentWeek is now self-healing — it inserts a default
--    week-1 row for any league that doesn't have one yet — so it
--    needs insert permission via the anon key, same open-access
--    pattern as every other table here.
-- ------------------------------------------------------------
create policy "open write league_state" on league_state for insert with check (true);

-- ------------------------------------------------------------
-- 6. RLS: open policies still work as-is for select/insert/
--    update — they all said `using (true)` / `with check (true)`,
--    meaning "any row," which is still fine since the app now
--    filters by league_id itself on every query. Enable RLS on
--    the new leagues table too, with a read-only-by-default
--    policy (since only you create leagues manually for now).
-- ------------------------------------------------------------
alter table leagues enable row level security;
create policy "open read leagues" on leagues for select using (true);
-- No insert/update policy on leagues: only the Supabase dashboard
-- (using the service role, which bypasses RLS) can create new
-- leagues for now, matching "only you create leagues."

-- Add leagues to realtime too, in case you ever want clients to
-- notice a brand-new league appearing without a manual refresh.
alter publication supabase_realtime add table leagues;

-- ------------------------------------------------------------
-- 7. Done. Sanity-check queries (optional, just for you to read,
--    not required for the migration to "succeed"):
--
--   select * from leagues;
--   select league_id, count(*) from managers group by league_id;
--   select league_id, count(*) from rosters group by league_id;
-- ------------------------------------------------------------
