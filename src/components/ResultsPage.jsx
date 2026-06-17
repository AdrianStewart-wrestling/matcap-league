import { useState, useMemo } from "react";
import { C, OUTCOMES } from "../theme";
import { PageTitle, Card, OutlineButton, TextInput } from "./Primitives";
import { WEIGHT_CLASSES } from "../data/wrestlers";

export function ResultsPage({ wrestlers, results, weekKey, currentWeek, onSetResult, rosters }) {
  const [search, setSearch] = useState("");
  const [weightFilter, setWeightFilter] = useState("all");
  const [rosteredOnly, setRosteredOnly] = useState(true);

  const rosteredIds = useMemo(() => {
    const set = new Set();
    Object.values(rosters).forEach((roster) => {
      Object.values(roster || {}).forEach((wid) => set.add(wid));
    });
    return set;
  }, [rosters]);

  const weekResults = results[weekKey] || {};

  const filtered = wrestlers.filter((w) => {
    if (weightFilter !== "all" && w.weight !== Number(weightFilter)) return false;
    if (rosteredOnly && !rosteredIds.has(w.id)) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageTitle subtitle={`Week ${currentWeek} — any manager can log any wrestler's result.`}>Enter Results</PageTitle>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <TextInput placeholder="Search wrestler..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
            style={{ padding: "10px 12px", borderRadius: 4, border: `1.5px solid ${C.line}`, fontSize: 14 }}
          >
            <option value="all">All weights</option>
            {WEIGHT_CLASSES.map((w) => (
              <option key={w} value={w}>{w} lbs</option>
            ))}
          </select>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.inkSoft }}>
          <input type="checkbox" checked={rosteredOnly} onChange={(e) => setRosteredOnly(e.target.checked)} />
          Only show rostered wrestlers
        </label>
      </Card>

      <Card>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11.5, color: C.inkSoft }}>
          {OUTCOMES.map((o) => (
            <span key={o.key}>{o.label} = {o.pts}pt{o.pts === 1 ? "" : "s"}</span>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map((w) => {
          const currentOutcome = weekResults[w.id];
          return (
            <div
              key={w.id}
              style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderRadius: 4,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 150, flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{w.name}</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft }}>
                  {w.weight} lbs &middot; {w.school} &middot; {w.conference}
                </div>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {OUTCOMES.map((o) => (
                  <OutlineButton
                    key={o.key}
                    small
                    onClick={() => onSetResult(w.id, o.key)}
                    style={{
                      background: currentOutcome === o.key ? C.maroon : "transparent",
                      color: currentOutcome === o.key ? C.chalk : C.maroon,
                    }}
                  >
                    {o.label}
                  </OutlineButton>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ color: C.inkSoft, fontSize: 13.5, padding: 12, textAlign: "center" }}>
            No wrestlers match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
