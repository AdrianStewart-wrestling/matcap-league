import { C, displayFont, monoFont } from "../theme";
import { PageTitle, PrimaryButton, OutlineButton, Card } from "./Primitives";

export function MatchupPage({ currentManager, managers, matchups, currentWeek, weekKey, scoreForManager, onGenerateMatchups, onAdvanceWeek }) {
  const weekPairs = matchups[weekKey] || [];
  const managerById = {};
  managers.forEach((m) => { managerById[m.id] = m; });

  const myPair = weekPairs.find((p) => p.a === currentManager.id || p.b === currentManager.id);

  return (
    <div>
      <PageTitle subtitle={`Week ${currentWeek}`}>This Week</PageTitle>

      <Card style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <PrimaryButton onClick={onGenerateMatchups}>Generate Matchups</PrimaryButton>
        <OutlineButton onClick={onAdvanceWeek}>Advance to Week {currentWeek + 1}</OutlineButton>
      </Card>

      {weekPairs.length === 0 && (
        <Card>
          <div style={{ color: C.inkSoft, fontSize: 14 }}>
            No matchups yet for Week {currentWeek}. Click "Generate Matchups" once everyone's joined.
          </div>
        </Card>
      )}

      {weekPairs.map((pair, i) => {
        const mgrA = managerById[pair.a];
        const mgrB = pair.b ? managerById[pair.b] : null;
        const scoreA = scoreForManager(pair.a, weekKey).total;
        const scoreB = pair.b ? scoreForManager(pair.b, weekKey).total : 0;
        const isMine = pair.a === currentManager.id || pair.b === currentManager.id;

        return (
          <Card
            key={i}
            style={{
              border: isMine ? `2px solid ${C.gold}` : `1px solid ${C.line}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: 1, minWidth: 120, textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{mgrA?.name}</div>
            </div>
            <div style={{ fontFamily: monoFont, fontSize: 22, fontWeight: 700, color: C.maroon, display: "flex", alignItems: "center", gap: 10 }}>
              <span>{scoreA}</span>
              <span style={{ color: C.inkSoft, fontSize: 14 }}>vs</span>
              <span>{mgrB ? scoreB : "\u2014"}</span>
            </div>
            <div style={{ flex: 1, minWidth: 120, textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {mgrB ? mgrB.name : <span style={{ fontFamily: displayFont, textTransform: "uppercase", color: C.inkSoft }}>BYE</span>}
              </div>
            </div>
          </Card>
        );
      })}

      {myPair && (
        <div style={{ marginTop: 18, fontSize: 13, color: C.inkSoft, textAlign: "center" }}>
          Your matchup is highlighted above.
        </div>
      )}
    </div>
  );
}
