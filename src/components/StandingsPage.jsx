import { C, monoFont } from "../theme";
import { PageTitle, Card } from "./Primitives";

export function StandingsPage({ standings, currentWeek }) {
  return (
    <div>
      <PageTitle subtitle={`Through Week ${currentWeek}`}>Standings</PageTitle>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: C.maroon }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: C.chalk, fontSize: 12, textTransform: "uppercase" }}>#</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: C.chalk, fontSize: 12, textTransform: "uppercase" }}>Manager</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: C.chalk, fontSize: 12, textTransform: "uppercase" }}>W-L</th>
              <th style={{ padding: "10px 14px", textAlign: "right", color: C.chalk, fontSize: 12, textTransform: "uppercase" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, i) => (
              <tr key={row.manager.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: "11px 14px", fontFamily: monoFont, color: C.inkSoft }}>{i + 1}</td>
                <td style={{ padding: "11px 14px", fontWeight: 700 }}>{row.manager.name}</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: monoFont }}>{row.wins}-{row.losses}</td>
                <td style={{ padding: "11px 14px", textAlign: "right", fontFamily: monoFont, fontWeight: 700, color: C.maroon }}>{row.points}</td>
              </tr>
            ))}
            {standings.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: "center", color: C.inkSoft }}>
                  No managers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
