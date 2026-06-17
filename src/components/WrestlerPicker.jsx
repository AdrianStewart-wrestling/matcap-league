import { C, displayFont, bodyFont, monoFont, fmtMoney } from "../theme";

export function WrestlerPicker({ weight, wrestlers, capRemainingExcludingCurrent, onPick, onClose }) {
  const sorted = [...wrestlers].sort((a, b) => a.rank - b.rank);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,20,16,0.55)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 900,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.chalk,
          width: "100%",
          maxWidth: 560,
          maxHeight: "82vh",
          borderRadius: "10px 10px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: C.white,
          }}
        >
          <div style={{ fontFamily: displayFont, fontSize: 17, fontWeight: 700, textTransform: "uppercase" }}>
            {weight} lbs
          </div>
          <button
            onClick={onClose}
            style={{ border: "none", background: "transparent", fontSize: 22, color: C.inkSoft, cursor: "pointer", lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "8px 10px" }}>
          {sorted.map((w) => {
            const affordable = w.salary <= capRemainingExcludingCurrent;
            return (
              <button
                key={w.id}
                disabled={!affordable}
                onClick={() => onPick(w.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 10px",
                  marginBottom: 4,
                  border: "none",
                  borderRadius: 5,
                  background: affordable ? C.white : "transparent",
                  cursor: affordable ? "pointer" : "default",
                  opacity: affordable ? 1 : 0.45,
                  textAlign: "left",
                  fontFamily: bodyFont,
                }}
              >
                <div style={{ fontFamily: monoFont, fontWeight: 700, width: 24, textAlign: "center", color: C.inkSoft, flexShrink: 0 }}>
                  #{w.rank}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>{w.name}</span>
                    {w.allAmerican && (
                      <span style={{ fontFamily: monoFont, fontSize: 9, background: C.gold, color: C.ink, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>
                        AA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>
                    {w.school} <span style={{ opacity: 0.6 }}>&middot; {w.conference}</span>
                  </div>
                </div>
                <div style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 13.5, color: affordable ? C.maroon : C.inkSoft, whiteSpace: "nowrap" }}>
                  {fmtMoney(w.salary)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
