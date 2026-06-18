import { useState, useEffect, useMemo, useCallback } from "react";
import { C, bodyFont, displayFont, SWAPS_PER_WEEK } from "./theme";
import { buildFullWrestlerData } from "./data/wrestlers";
import {
  fetchManagers,
  createManager,
  fetchAllRosters,
  saveRoster,
  fetchAllSwapLogs,
  saveSwapLog,
  fetchCurrentWeek,
  saveCurrentWeek,
  fetchAllMatchups,
  saveMatchups,
  fetchAllResults,
  saveResults,
  subscribeToLeagueChanges,
  saveMyIdentity,
  loadMyIdentity,
} from "./lib/leagueData";
import { LoginScreen } from "./components/LoginScreen";
import { Header, Nav } from "./components/Header";
import { Toast } from "./components/Primitives";
import { RosterPage } from "./components/RosterPage";
import { MatchupPage } from "./components/MatchupPage";
import { ResultsPage } from "./components/ResultsPage";
import { StandingsPage } from "./components/StandingsPage";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentManager, setCurrentManager] = useState(null);

  const [managers, setManagers] = useState([]);
  const [rosters, setRosters] = useState({});
  const [swapLog, setSwapLog] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [matchups, setMatchups] = useState({});
  const [results, setResults] = useState({});

  const [page, setPage] = useState("roster");
  const [toast, setToast] = useState(null);

  const wrestlers = useMemo(() => buildFullWrestlerData(), []);
  const wrestlerById = useMemo(() => {
    const m = {};
    wrestlers.forEach((w) => (m[w.id] = w));
    return m;
  }, [wrestlers]);

  const loadAll = useCallback(async () => {
    const [mgrs, rost, swaps, week, mtch, res] = await Promise.all([
      fetchManagers(),
      fetchAllRosters(),
      fetchAllSwapLogs(),
      fetchCurrentWeek(),
      fetchAllMatchups(),
      fetchAllResults(),
    ]);
    setManagers(mgrs);
    setRosters(rost);
    setSwapLog(swaps);
    setCurrentWeek(week);
    setMatchups(mtch);
    setResults(res);
    return mgrs;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const mgrs = await loadAll();
        const savedMe = loadMyIdentity();
        if (savedMe && mgrs.find((m) => m.id === savedMe.id)) {
          setCurrentManager(savedMe);
        }
      } catch (e) {
        console.error(e);
        setLoadError(e.message || String(e));
      } finally {
        setBooting(false);
      }
    })();
  }, [loadAll]);

  useEffect(() => {
    const unsubscribe = subscribeToLeagueChanges(() => {
      loadAll().catch((e) => console.error("Realtime refresh failed:", e));
    });
    return unsubscribe;
  }, [loadAll]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function handleLogin(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    let mgr = managers.find((m) => m.name.toLowerCase() === trimmed.toLowerCase());
    if (!mgr) {
      mgr = { id: "m" + Date.now() + Math.floor(Math.random() * 1000), name: trimmed };
      try {
        await createManager(mgr);
        setManagers((prev) => [...prev, mgr]);
        await saveRoster(mgr.id, {});
        setRosters((prev) => ({ ...prev, [mgr.id]: {} }));
      } catch (e) {
        showToast("Couldn't join the league: " + (e.message || e));
        return;
      }
    }
    setCurrentManager(mgr);
    saveMyIdentity(mgr);
  }

  function handleSwitchManager() {
    setCurrentManager(null);
    saveMyIdentity(null);
  }

  const myRoster = useMemo(() => rosters[currentManager?.id] || {}, [rosters, currentManager]);
  const weekKey = "wk" + currentWeek;
  const mySwapsUsed = (swapLog[currentManager?.id] || {})[weekKey] || 0;
  const swapsRemaining = Math.max(0, SWAPS_PER_WEEK - mySwapsUsed);

  async function assignWrestler(weight, wrestlerId) {
    const isSwap = !!myRoster[weight];
    if (isSwap && swapsRemaining <= 0) {
      showToast("No swaps remaining this week.");
      return;
    }
    const newRosterForMe = { ...myRoster, [weight]: wrestlerId };
    setRosters((prev) => ({ ...prev, [currentManager.id]: newRosterForMe }));
    try {
      await saveRoster(currentManager.id, newRosterForMe);
    } catch (e) {
      showToast("Couldn't save roster: " + (e.message || e));
      return;
    }

    if (isSwap) {
      const mySwaps = { ...(swapLog[currentManager.id] || {}) };
      mySwaps[weekKey] = (mySwaps[weekKey] || 0) + 1;
      setSwapLog((prev) => ({ ...prev, [currentManager.id]: mySwaps }));
      await saveSwapLog(currentManager.id, mySwaps);
    }
    showToast(`${wrestlerById[wrestlerId].name} added at ${weight} lbs.`);
  }

  async function removeWrestler(weight) {
    if (swapsRemaining <= 0) {
      showToast("No swaps remaining this week.");
      return;
    }
    const newRosterForMe = { ...myRoster };
    delete newRosterForMe[weight];
    setRosters((prev) => ({ ...prev, [currentManager.id]: newRosterForMe }));
    await saveRoster(currentManager.id, newRosterForMe);

    const mySwaps = { ...(swapLog[currentManager.id] || {}) };
    mySwaps[weekKey] = (mySwaps[weekKey] || 0) + 1;
    setSwapLog((prev) => ({ ...prev, [currentManager.id]: mySwaps }));
    await saveSwapLog(currentManager.id, mySwaps);
  }

  async function setResultForWrestler(wrestlerId, outcomeKey) {
    const weekResults = { ...(results[weekKey] || {}) };
    weekResults[wrestlerId] = outcomeKey;
    setResults((prev) => ({ ...prev, [weekKey]: weekResults }));
    await saveResults(weekKey, weekResults);
  }

  async function advanceWeek() {
    const next = currentWeek + 1;
    setCurrentWeek(next);
    await saveCurrentWeek(next);
    showToast(`Advanced to Week ${next}.`);
  }

  async function generateMatchupsForWeek() {
    if (managers.length < 2) {
      showToast("Need at least 2 managers to create matchups.");
      return;
    }
    const shuffled = [...managers].sort(() => Math.random() - 0.5);
    const pairs = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      pairs.push({ a: shuffled[i].id, b: shuffled[i + 1].id });
    }
    if (shuffled.length % 2 === 1) {
      pairs.push({ a: shuffled[shuffled.length - 1].id, b: null });
    }
    setMatchups((prev) => ({ ...prev, [weekKey]: pairs }));
    await saveMatchups(weekKey, pairs);
    showToast(`Matchups generated for Week ${currentWeek}.`);
  }

  function scoreForManager(managerId, wk) {
    const roster = rosters[managerId] || {};
    const wkResults = results[wk] || {};
    let total = 0;
    const breakdown = [];
    Object.entries(roster).forEach(([weight, wid]) => {
      const outcome = wkResults[wid];
      const w = wrestlerById[wid];
      if (outcome && w) {
        const pts = { fall: 6, techfall: 5, major: 4, decision: 3, loss: 0 }[outcome] || 0;
        total += pts;
        breakdown.push({ weight, wrestler: w, outcome, pts });
      } else if (w) {
        breakdown.push({ weight, wrestler: w, outcome: null, pts: 0 });
      }
    });
    return { total, breakdown };
  }

  const standings = useMemo(() => {
    const table = {};
    managers.forEach((m) => {
      table[m.id] = { manager: m, wins: 0, losses: 0, points: 0 };
    });
    Object.entries(matchups).forEach(([wk, pairs]) => {
      pairs.forEach((pair) => {
        if (!pair.b) {
          const scoreA = scoreForManager(pair.a, wk).total;
          if (table[pair.a]) {
            table[pair.a].points += scoreA;
            table[pair.a].wins += 1;
          }
          return;
        }
        const scoreA = scoreForManager(pair.a, wk).total;
        const scoreB = scoreForManager(pair.b, wk).total;
        if (table[pair.a]) table[pair.a].points += scoreA;
        if (table[pair.b]) table[pair.b].points += scoreB;
        if (scoreA > scoreB) {
          if (table[pair.a]) table[pair.a].wins += 1;
          if (table[pair.b]) table[pair.b].losses += 1;
        } else if (scoreB > scoreA) {
          if (table[pair.b]) table[pair.b].wins += 1;
          if (table[pair.a]) table[pair.a].losses += 1;
        }
      });
    });
    return Object.values(table).sort((a, b) => b.wins - a.wins || b.points - a.points);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managers, matchups, rosters, results]);

  const wrapperStyle = {
    fontFamily: bodyFont,
    background: C.chalk,
    color: C.ink,
    minHeight: "100vh",
    lineHeight: 1.5,
  };

  if (booting) {
    return (
      <div style={{ ...wrapperStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: displayFont, textTransform: "uppercase", letterSpacing: 1, color: C.inkSoft }}>
          Loading the mat&hellip;
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ ...wrapperStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontFamily: displayFont, fontSize: 20, color: C.maroon, marginBottom: 8 }}>
            Couldn't connect to the league database
          </div>
          <div style={{ fontSize: 14, color: C.inkSoft, marginBottom: 10 }}>
            {loadError}
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft }}>
            Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set correctly and that schema.sql has been run in your Supabase project.
          </div>
        </div>
      </div>
    );
  }

  if (!currentManager) {
    return (
      <div style={wrapperStyle}>
        <LoginScreen managers={managers} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <Header manager={currentManager} onSwitch={handleSwitchManager} />
      <Nav page={page} setPage={setPage} />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "26px 18px 56px" }}>
        {toast && <Toast message={toast} />}
        {page === "roster" && (
          <RosterPage
            myRoster={myRoster}
            wrestlers={wrestlers}
            wrestlerById={wrestlerById}
            swapsRemaining={swapsRemaining}
            onAssign={assignWrestler}
            onRemove={removeWrestler}
          />
        )}
        {page === "matchup" && (
          <MatchupPage
            currentManager={currentManager}
            managers={managers}
            matchups={matchups}
            currentWeek={currentWeek}
            weekKey={weekKey}
            scoreForManager={scoreForManager}
            onGenerateMatchups={generateMatchupsForWeek}
            onAdvanceWeek={advanceWeek}
          />
        )}
        {page === "results" && (
          <ResultsPage
            wrestlers={wrestlers}
            results={results}
            weekKey={weekKey}
            currentWeek={currentWeek}
            onSetResult={setResultForWrestler}
            rosters={rosters}
          />
        )}
        {page === "standings" && <StandingsPage standings={standings} currentWeek={currentWeek} />}
      </div>
    </div>
  );
}
