import { supabase } from "./supabaseClient";

// ============================================================
// LEAGUE DATA ACCESS
// Thin wrappers around Supabase tables. Each function returns
// plain JS values (not Supabase response envelopes) so the rest
// of the app doesn't need to know it's talking to a database.
// ============================================================

export async function fetchManagers() {
  const { data, error } = await supabase.from("managers").select("*").order("created_at");
  if (error) throw error;
  return data.map((m) => ({ id: m.id, name: m.name }));
}

export async function createManager(manager) {
  const { error } = await supabase.from("managers").insert({ id: manager.id, name: manager.name });
  if (error) throw error;
}

// Returns { rosters: { [managerId]: roster }, committed: { [managerId]: boolean } }.
// `committed` defaults to false for any manager row that predates this
// column (handled by the `?? false` below), so existing in-progress
// rosters from before this feature don't accidentally look locked.
export async function fetchAllRosters() {
  const { data, error } = await supabase.from("rosters").select("*");
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
export async function saveRoster(managerId, roster) {
  const { error } = await supabase
    .from("rosters")
    .upsert({ manager_id: managerId, roster, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Dedicated function for flipping the commit flag. Uses update(), not
// upsert(), so it only ever touches the `committed` column on the row
// that already exists — it can never wipe out `roster` or any other
// column, and it can't accidentally create a row either (the roster row
// must already exist, which it always does by the time someone is
// finishing their initial build).
export async function setRosterCommitted(managerId, committed) {
  const { error } = await supabase
    .from("rosters")
    .update({ committed, updated_at: new Date().toISOString() })
    .eq("manager_id", managerId);
  if (error) throw error;
}

export async function fetchAllSwapLogs() {
  const { data, error } = await supabase.from("swap_log").select("*");
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.manager_id] = r.log || {}; });
  return out;
}

export async function saveSwapLog(managerId, log) {
  const { error } = await supabase
    .from("swap_log")
    .upsert({ manager_id: managerId, log, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function fetchCurrentWeek() {
  const { data, error } = await supabase.from("league_state").select("current_week").eq("id", 1).single();
  if (error) throw error;
  return data.current_week;
}

export async function saveCurrentWeek(week) {
  const { error } = await supabase.from("league_state").update({ current_week: week }).eq("id", 1);
  if (error) throw error;
}

export async function fetchAllMatchups() {
  const { data, error } = await supabase.from("matchups").select("*");
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.week_key] = r.pairs || []; });
  return out;
}

export async function saveMatchups(weekKey, pairs) {
  const { error } = await supabase.from("matchups").upsert({ week_key: weekKey, pairs });
  if (error) throw error;
}

export async function fetchAllResults() {
  const { data, error } = await supabase.from("results").select("*");
  if (error) throw error;
  const out = {};
  data.forEach((r) => { out[r.week_key] = r.outcomes || {}; });
  return out;
}

export async function saveResults(weekKey, outcomes) {
  const { error } = await supabase.from("results").upsert({ week_key: weekKey, outcomes });
  if (error) throw error;
}

// ------------------------------------------------------------
// Realtime subscription: fires `onChange` whenever any league
// table changes, so all connected managers stay in sync without
// manual refresh. Returns an unsubscribe function.
// ------------------------------------------------------------
export function subscribeToLeagueChanges(onChange) {
  const channel = supabase
    .channel("league-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "managers" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "rosters" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "swap_log" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "league_state" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "matchups" }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "results" }, onChange)
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// Personal "who am I" persistence stays in localStorage — it's
// purely a per-browser convenience, not shared league data.
export function saveMyIdentity(manager) {
  if (manager) {
    localStorage.setItem("matcap:me", JSON.stringify(manager));
  } else {
    localStorage.removeItem("matcap:me");
  }
}

export function loadMyIdentity() {
  try {
    const raw = localStorage.getItem("matcap:me");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
