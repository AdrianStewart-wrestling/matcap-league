import { C, displayFont, bodyFont, monoFont } from "../theme";

export function WrestlerPicker({ weight, wrestlers, rosterHasChampion, currentPickIsChampion, onPick, onClose }) {
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
            // A champion can only be picked here if the roster doesn't
            // already have one elsewhere, UNLESS this exact pick is the
            // one already occupying this slot (so re-confirming/closing
            // without changing anything never gets blocked).
            const blockedByChampionRule = w.champion && rosterHasChampion && !currentPickIsChampion;
            const pickable = !blockedByChampionRule;
            return (
              <button
                key={w.id}
                disabled={!pickable}
                onClick={() => onPick(w.id)}
                title={blockedByChampionRule ? "Your roster already has a returning champion" : undefined}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 10px",
                  marginBottom: 4,
                  border: "none",
                  borderRadius: 5,
                  background: pickable ? C.white : "transparent",
                  cursor: pickable ? "pointer" : "default",
                  opacity: pickable ? 1 : 0.4,
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
                    {w.champion && (
                      <span style={{ fontFamily: monoFont, fontSize: 9, background: C.gold, color: C.ink, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>
                        CHAMP
                      </span>
                    )}
                    {!w.champion && w.allAmerican && (
                      <span style={{ fontFamily: monoFont, fontSize: 9, background: C.chalkDim, color: C.inkSoft, padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>
                        AA
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: C.inkSoft }}>
                    {w.school} <span style={{ opacity: 0.6 }}>&middot; {w.conference}</span>
                  </div>
                </div>
                {blockedByChampionRule && (
                  <div style={{ fontSize: 10.5, color: C.loss, fontWeight: 600, whiteSpace: "nowrap", maxWidth: 90, textAlign: "right" }}>
                    champ already used
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
