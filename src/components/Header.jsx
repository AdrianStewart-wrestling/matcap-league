import { C, displayFont } from "../theme";

export function Header({ manager, onSwitch }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${C.maroon}, ${C.maroonDeep})`,
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ fontFamily: displayFont, fontSize: 19, fontWeight: 700, color: C.chalk, letterSpacing: 0.5, textTransform: "uppercase" }}>
        MatCap League
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13.5, color: C.chalkDim }}>{manager.name}</span>
        <button
          onClick={onSwitch}
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            padding: "6px 12px",
            borderRadius: 4,
            border: `1.5px solid ${C.goldBright}`,
            background: "transparent",
            color: C.goldBright,
            cursor: "pointer",
          }}
        >
          Switch
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { key: "roster", label: "My Roster" },
  { key: "matchup", label: "This Week" },
  { key: "results", label: "Enter Results" },
  { key: "standings", label: "Standings" },
];

export function Nav({ page, setPage }) {
  return (
    <div
      style={{
        display: "flex",
        overflowX: "auto",
        borderBottom: `1px solid ${C.line}`,
        background: C.white,
        WebkitOverflowScrolling: "touch",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = page === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              flex: "1 0 auto",
              minWidth: 110,
              padding: "13px 14px",
              fontFamily: displayFont,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.3,
              textTransform: "uppercase",
              border: "none",
              background: "transparent",
              color: active ? C.maroon : C.inkSoft,
              borderBottom: active ? `3px solid ${C.maroon}` : "3px solid transparent",
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
