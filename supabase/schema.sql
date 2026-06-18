-- ============================================================
-- MatCap League — Supabase schema (multi-league version)
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- If you're upgrading an EXISTING project that was set up before
-- multi-league support existed, do NOT re-run this file — use
-- supabase/migration_multi_league.sql instead, which alters your
-- existing tables in place without losing data. This file is for
-- brand-new projects only.
-- ============================================================

create table if not exists leagues (
  id text primary key,       -- short slug, used as the ?league= URL param
  name text not null,
  created_at timestamptz default now()
);

-- Seed one starter league so the app has somewhere to land before
-- you've created any others. Change the id/name as you like, or
-- create additional leagues directly via the Supabase dashboard
-- (only you create leagues for now — there's no in-app "create
-- league" UI yet).
insert into leagues (id, name) values ('default', 'MatCap League')
  on conflict (id) do nothing;

create table if not exists managers (
  id text primary key,
  league_id text not null references leagues(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  constraint managers_league_name_unique unique (league_id, name)
);

create table if not exists rosters (
  manager_id text primary key references managers(id) on delete cascade,
  league_id text not null references leagues(id) on delete cascade,
  roster jsonb not null default '{}'::jsonb, -- { "125": "w12", "133": "w45", ... }
  committed boolean not null default false,
  updated_at timestamptz default now()
);

create table if not exists swap_log (
  manager_id text primary key references managers(id) on delete cascade,
  league_id text not null references leagues(id) on delete cascade,
  log jsonb not null default '{}'::jsonb, -- { "wk1": 2, "wk2": 0, ... }
  updated_at timestamptz default now()
);

-- One row per league (not a global singleton like the original
-- single-league schema — each league tracks its own current week).
create table if not exists league_state (
  league_id text primary key references leagues(id) on delete cascade,
  current_week int not null default 1
);

create table if not exists matchups (
  week_key text not null, -- "wk1", "wk2", ...
  league_id text not null references leagues(id) on delete cascade,
  pairs jsonb not null default '[]'::jsonb, -- [{ "a": "m123", "b": "m456" }, ...]
  primary key (league_id, week_key)
);

create table if not exists results (
  week_key text not null, -- "wk1", "wk2", ...
  league_id text not null references leagues(id) on delete cascade,
  outcomes jsonb not null default '{}'::jsonb, -- { "w12": "fall", "w45": "decision", ... }
  primary key (league_id, week_key)
);

-- ------------------------------------------------------------
-- Row Level Security: this is meant for small groups of trusted
-- friends with no auth, so we allow open read/write via the anon
-- key, same as the original single-league schema. Leagues
-- themselves are read-only from the client — only the Supabase
-- dashboard (service role) creates new ones, matching "only you
-- create leagues for now." Don't reuse this open-policy approach
-- for anything containing sensitive data.
-- ------------------------------------------------------------
alter table leagues enable row level security;
alter table managers enable row level security;
alter table rosters enable row level security;
alter table swap_log enable row level security;
alter table league_state enable row level security;
alter table matchups enable row level security;
alter table results enable row level security;

create policy "open read leagues" on leagues for select using (true);

create policy "open read managers" on managers for select using (true);
create policy "open write managers" on managers for insert with check (true);
create policy "open update managers" on managers for update using (true);

create policy "open read rosters" on rosters for select using (true);
create policy "open write rosters" on rosters for insert with check (true);
create policy "open update rosters" on rosters for update using (true);

create policy "open read swap_log" on swap_log for select using (true);
create policy "open write swap_log" on swap_log for insert with check (true);
create policy "open update swap_log" on swap_log for update using (true);

create policy "open read league_state" on league_state for select using (true);
create policy "open write league_state" on league_state for insert with check (true);
create policy "open update league_state" on league_state for update using (true);

create policy "open read matchups" on matchups for select using (true);
create policy "open write matchups" on matchups for insert with check (true);
create policy "open update matchups" on matchups for update using (true);

create policy "open read results" on results for select using (true);
create policy "open write results" on results for insert with check (true);
create policy "open update results" on results for update using (true);

-- Each new league created via the dashboard needs its own
-- league_state row before the app can load it (fetchCurrentWeek
-- uses .single(), which errors on zero rows). Insert one whenever
-- you create a league:
--   insert into league_state (league_id, current_week) values ('your-new-league-id', 1);

-- ------------------------------------------------------------
-- Realtime: lets every manager's browser see updates from others
-- live, without manual refresh. The app's subscribeToLeagueChanges
-- function adds a league_id filter on top of this at the client
-- level, so a change in one league never gets pushed to clients
-- watching a different league.
-- ------------------------------------------------------------
alter publication supabase_realtime add table leagues;
alter publication supabase_realtime add table managers;
alter publication supabase_realtime add table rosters;
alter publication supabase_realtime add table swap_log;
alter publication supabase_realtime add table league_state;
alter publication supabase_realtime add table matchups;
alter publication supabase_realtime add table results;
