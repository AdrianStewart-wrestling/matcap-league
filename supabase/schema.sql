-- ============================================================
-- MatCap League — Supabase schema
-- Run this once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
-- ============================================================

create table if not exists managers (
  id text primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists rosters (
  manager_id text primary key references managers(id) on delete cascade,
  roster jsonb not null default '{}'::jsonb, -- { "125": "w12", "133": "w45", ... }
  updated_at timestamptz default now()
);

create table if not exists swap_log (
  manager_id text primary key references managers(id) on delete cascade,
  log jsonb not null default '{}'::jsonb, -- { "wk1": 2, "wk2": 0, ... }
  updated_at timestamptz default now()
);

create table if not exists league_state (
  id int primary key default 1,
  current_week int not null default 1,
  constraint single_row check (id = 1)
);
insert into league_state (id, current_week) values (1, 1)
  on conflict (id) do nothing;

create table if not exists matchups (
  week_key text primary key, -- "wk1", "wk2", ...
  pairs jsonb not null default '[]'::jsonb -- [{ "a": "m123", "b": "m456" }, ...]
);

create table if not exists results (
  week_key text primary key, -- "wk1", "wk2", ...
  outcomes jsonb not null default '{}'::jsonb -- { "w12": "fall", "w45": "decision", ... }
);

-- ------------------------------------------------------------
-- Row Level Security: this is a single shared league among
-- trusted friends with no auth, so we allow open read/write on
-- these tables via the anon key. Do NOT reuse this schema for
-- anything containing sensitive data.
-- ------------------------------------------------------------
alter table managers enable row level security;
alter table rosters enable row level security;
alter table swap_log enable row level security;
alter table league_state enable row level security;
alter table matchups enable row level security;
alter table results enable row level security;

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
create policy "open update league_state" on league_state for update using (true);

create policy "open read matchups" on matchups for select using (true);
create policy "open write matchups" on matchups for insert with check (true);
create policy "open update matchups" on matchups for update using (true);

create policy "open read results" on results for select using (true);
create policy "open write results" on results for insert with check (true);
create policy "open update results" on results for update using (true);

-- ------------------------------------------------------------
-- Realtime: lets every manager's browser see updates from others
-- live, without manual refresh.
-- ------------------------------------------------------------
alter publication supabase_realtime add table managers;
alter publication supabase_realtime add table rosters;
alter publication supabase_realtime add table swap_log;
alter publication supabase_realtime add table league_state;
alter publication supabase_realtime add table matchups;
alter publication supabase_realtime add table results;
