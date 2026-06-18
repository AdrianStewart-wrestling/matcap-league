import { supabase } from "./supabaseClient";

// ============================================================
// LEAGUE DATA ACCESS
// Thin wrappers around Supabase tables. Each function returns
// plain JS values (not Supabase response envelopes) so the rest
// of the app doesn't need to know it's talking to a database.
//
// MULTI-LEAGUE: every function below now takes a `leagueId` and
// scopes its query to it. This lets many independent leagues
// share one deployment/database without seeing each other's
// data, and — just as importantly for scaling past a handful of
// people — lets the realtime subscription filter server-side by
// league_id, so a pick in League A never wakes up League B's
// connected browsers. See subscribeToLeagueChanges below.
// ============================================================

export async function fetchManagers(leagueId) {
  const { data, error } = await supabase
    .from("managers")
    .select("*")
    .eq("league_id", leagueId)
    .order("created_at");
  if (error) throw error;
  return data.map((m) => ({ id: m.id, name: m.name }));
}

export async function createManager(manager, leagueId) {
  const { error } = await supabase
    .from("managers")
    .insert({ id: manager.id, name: manager.name, league_id: leagueId });
  if (error) throw error;
}

// Returns { rosters: { [managerId]: roster }, committed: { [managerId]: boolean } }.
// `committed` defaults to false for any manager row that predates this
// column (handled by the `?? false` below), so existing in-progress
// rosters from before this feature don't accidentally look locked.
export async function fetchAllRosters(leagueId) {
  const { data, error } = await supabase
    .from("rosters")
    .select("*")
    .eq("league_id", leagueId);
  if (error) throw error;
  const rosters = {};
  const committed = {};
  data.forEach((r) => {
    rosters[r.manager_id] = r.roster || {};
    committed[r.manager_id] = r.committed ?? false;
  });
  return { rosters, committed };
}

// IMPORTANT: this never touches the `committed` column. Supabase/PostgREST
// upsert() replaces the whole row with whatever columns you pass — it does
// NOT merge column-by-column — so if this function ever included
// `committed` here, every regular pre-commit edit or weekly swap would
// silently overwrite it. Use setRosterCommitted (below) to change that
// flag; it uses update() with an explicit column list instead, which only
// touches the columns named.
export async function saveRoster(managerId, roster, leagueId) {
  const { error } = await supabase
    .from("rosters")
    .upsert({ manager_id: managerId, league_id: leagueId, roster, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Dedicated function for flipping the commit flag. Uses update(), not
// upsert(), so it only ever touches the `committed` column on the row
// that already exists — it can never wipe out `roster` or any other
// column, and it can't accidentally create a row either (the roster row
// must already exist, which it always does by the time someone is
// finishing their initial build). league_id is included in the .eq()
// filter as a defensive measure — manager_id is already globally unique
// as a primary key, so it's not strictly required for correctness, but
// it keeps every query in this file consistently scoped to one league.
export async function setRosterCommitted(managerId, committed, leagueId) {
  const { error } = await supabase
    .from("rosters")
    .update({ committed, updated_at: new Date().toISOString() })
    .eq("manager_id", managerId)
    .eq("league_id", leagueId);
  if (error) throw error;
}

export async function fetchAllSwapLogs(leagueId) {
  const { data, error } = await supabase
    .from("swap_log")
    .select("*")
    .eq("league_id", leagueId);
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.manager_id] = r.log || {}; });
  return out;
}

export async function saveSwapLog(managerId, log, leagueId) {
  const { error } = await supabase
    .from("swap_log")
    .upsert({ manager_id: managerId, league_id: leagueId, log, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Uses maybeSingle() (not single()) plus a self-healing insert, so a
// brand-new league that hasn't had its league_state row manually
// inserted yet doesn't hard-error the whole app for everyone — it just
// creates the missing row defaulting to week 1 and moves on.
export async function fetchCurrentWeek(leagueId) {
  const { data, error } = await supabase
    .from("league_state")
    .select("current_week")
    .eq("league_id", leagueId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data.current_week;

  const { error: insertError } = await supabase
    .from("league_state")
    .insert({ league_id: leagueId, current_week: 1 });
  if (insertError) throw insertError;
  return 1;
}

export async function saveCurrentWeek(week, leagueId) {
  const { error } = await supabase
    .from("league_state")
    .update({ current_week: week })
    .eq("league_id", leagueId);
  if (error) throw error;
}

export async function fetchAllMatchups(leagueId) {
  const { data, error } = await supabase
    .from("matchups")
    .select("*")
    .eq("league_id", leagueId);
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.week_key] = r.pairs || []; });
  return out;
}

export async function saveMatchups(weekKey, pairs, leagueId) {
  const { error } = await supabase
    .from("matchups")
    .upsert({ week_key: weekKey, league_id: leagueId, pairs });
  if (error) throw error;
}

export async function fetchAllResults(leagueId) {
  const { data, error } = await supabase
    .from("results")
    .select("*")
    .eq("league_id", leagueId);
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.week_key] = r.outcomes || {}; });
  return out;
}

export async function saveResults(weekKey, outcomes, leagueId) {
  const { error } = await supabase
    .from("results")
    .upsert({ week_key: weekKey, league_id: leagueId, outcomes });
  if (error) throw error;
}

// Look up a league by its id (the ?league= URL slug). Returns null if it
// doesn't exist, rather than throwing, so callers can show a clean
// "league not found" state instead of a raw error.
export async function fetchLeague(leagueId) {
  const { data, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", leagueId)
    .maybeSingle();
  if (error) throw error;
  return data; // null if no matching row
}

// ------------------------------------------------------------
// Realtime subscription: fires `onChange` whenever a row changes
// in THIS league specifically. Each `.on()` call below includes
// a `filter: "league_id=eq.<leagueId>"`, which Supabase applies
// server-side — meaning a change in a different league is never
// even sent to this client, not just ignored after arrival. This
// is the main thing that keeps many leagues sharing one
// deployment from generating cross-league refetch noise as the
// number of leagues/players grows.
//
// Returns an unsubscribe function.
// ------------------------------------------------------------
export function subscribeToLeagueChanges(leagueId, onChange) {
  const leagueFilter = { filter: `league_id=eq.${leagueId}` };
  const channel = supabase
    .channel(`league-changes-${leagueId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "managers", ...leagueFilter }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "rosters", ...leagueFilter }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "swap_log", ...leagueFilter }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "league_state", ...leagueFilter }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "matchups", ...leagueFilter }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "results", ...leagueFilter }, onChange)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Personal "who am I" persistence stays in localStorage — it's
// purely a per-browser convenience, not shared league data. Keyed
// by league too, since the same browser might be used to check in
// on more than one league (e.g. you, running several).
export function saveMyIdentity(manager, leagueId) {
  if (manager) {
    localStorage.setItem(`matcap:me:${leagueId}`, JSON.stringify(manager));
  } else {
    localStorage.removeItem(`matcap:me:${leagueId}`);
  }
}

export function loadMyIdentity(leagueId) {
  try {
    const raw = localStorage.getItem(`matcap:me:${leagueId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
