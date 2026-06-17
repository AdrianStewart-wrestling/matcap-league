import { useState } from "react";
import { C, displayFont, bodyFont, monoFont, fmtMoney, SALARY_CAP } from "../theme";
import { OutlineButton, Card } from "./Primitives";
import { WEIGHT_CLASSES } from "../data/wrestlers";
import { REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "../data/conferences";
import { rosterWrestlerList, checkConferenceRule } from "../data/rosterRules";
import { WrestlerPicker } from "./WrestlerPicker";

export function RosterPage({ myRoster, wrestlers, wrestlerById, capUsed, swapsRemaining, onAssign, onRemove }) {
  const [pickerWeight, setPickerWeight] = useState(null);
  const capPct = Math.min(100, (capUsed / SALARY_CAP) * 100);
  const over = capUsed > SALARY_CAP;
  const remaining = SALARY_CAP - capUsed;

  const picked = rosterWrestlerList(myRoster, wrestlerById);
  const conferenceCheck = checkConferenceRule(picked);
  const byConference = {};
  picked.forEach((p) => {
    const c = p.wrestler.conference;
    if (!c) return;
    byConference[c] = byConference[c] || [];
    byConference[c].push(p);
  });

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.ink, margin: 0 }}>
          My Roster
        </h1>
        <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 4 }}>
          Fill all 10 weight classes. {swapsRemaining} swap{swapsRemaining === 1 ? "" : "s"} left this week.
        </div>
      </div>

      <Card style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ flexShrink: 0 }}>
          <path d="M24 6V40" stroke={C.maroon} strokeWidth="3" strokeLinecap="round" />
          <path d="M10 16L24 10L38 16" stroke={C.maroon} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 16C6 16 8 24 10 24C12 24 14 16 14 16" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M34 16C34 16 36 24 38 24C40 24 42 16 42 16" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 40H34" stroke={C.maroon} strokeWidth="3" strokeLinecap="round" />
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: monoFont, fontSize: 12.5, marginBottom: 6, color: C.inkSoft }}>
            <span>Salary used</span>
            <strong style={{ color: C.ink, fontSize: 15 }}>
              {fmtMoney(capUsed)} / {fmtMoney(SALARY_CAP)}
            </strong>
          </div>
          <div style={{ height: 9, background: C.chalkDim, borderRadius: 6, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: capPct + "%",
                borderRadius: 6,
                background: over ? `linear-gradient(90deg, ${C.loss}, #c94c3f)` : `linear-gradient(90deg, ${C.win}, ${C.gold})`,
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>
        <div style={{ fontFamily: displayFont, fontSize: 20, color: over ? C.loss : C.maroon, textAlign: "right", whiteSpace: "nowrap" }}>
          {over ? "\u2212" : ""}
          {fmtMoney(Math.abs(remaining))}
          <div style={{ fontSize: 10.5, color: C.inkSoft, fontFamily: bodyFont, textAlign: "right" }}>{over ? "over cap" : "remaining"}</div>
        </div>
      </Card>

      <Card>
        <div style={{ fontFamily: displayFont, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: C.inkSoft, marginBottom: 12 }}>
          Conference rule
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
          {REQUIRED_CONFERENCES.map((conf) => {
            const have = (byConference[conf] || []).length > 0;
            return (
              <div
                key={conf}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 10px",
                  borderRadius: 4,
                  background: have ? "rgba(47,107,62,0.1)" : C.chalk,
                  border: `1px solid ${have ? C.win : C.line}`,
                  fontSize: 12,
                  fontWeight: 600,
                  color: have ? C.win : C.inkSoft,
                }}
              >
                <span style={{ fontSize: 13 }}>{have ? "\u2713" : "\u25cb"}</span>
                {conf}
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 12px",
            borderRadius: 4,
            background: conferenceCheck.wildCardsMet ? "rgba(47,107,62,0.1)" : "rgba(163,56,46,0.08)",
            border: `1px solid ${conferenceCheck.wildCardsMet ? C.win : C.loss}`,
            fontSize: 12.5,
            fontWeight: 600,
            color: conferenceCheck.wildCardsMet ? C.win : C.loss,
          }}
        >
          <span style={{ fontSize: 14 }}>{conferenceCheck.wildCardsMet ? "\u2713" : "\u25cb"}</span>
          Wild cards (extra {WILD_CARD_CONFERENCES.join("/")} picks): {conferenceCheck.wildCardSurplus} / {conferenceCheck.wildCardsNeeded}
        </div>
      </Card>

      <div style={{ display: "grid", gap: 9 }}>
        {WEIGHT_CLASSES.map((weight) => {
          const wid = myRoster[weight];
          const w = wid ? wrestlerById[wid] : null;
          return (
            <div
              key={weight}
              style={{
                background: C.white,
                border: `1px solid ${C.line}`,
                borderLeft: `5px solid ${w ? C.maroon : C.chalkDim}`,
                borderRadius: 3,
                padding: "13px 15px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.chalk,
                  background: w ? C.maroon : C.inkSoft,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                {weight}
                <span style={{ fontSize: 7.5, letterSpacing: 0.5, opacity: 0.75, marginTop: 1 }}>LBS</span>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                {w ? (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15.5 }}>{w.name}</span>
                      <span style={{ fontFamily: monoFont, fontSize: 10.5, background: C.chalkDim, padding: "2px 7px", borderRadius: 10, fontWeight: 700 }}>
                        #{w.rank}
                      </span>
                      {w.allAmerican && (
                        <span style={{ fontFamily: monoFont, fontSize: 9.5, background: C.gold, color: C.ink, padding: "2px 6px", borderRadius: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                          2026 AA
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: C.inkSoft }}>
                      {w.school} <span style={{ opacity: 0.6 }}>&middot; {w.conference}</span>
                    </div>
                  </>
                ) : (
                  <span style={{ color: C.inkSoft, fontStyle: "italic", fontSize: 13.5 }}>No wrestler selected</span>
                )}
              </div>
              {w && (
                <div style={{ fontFamily: monoFont, fontWeight: 700, color: C.maroon, fontSize: 14.5, whiteSpace: "nowrap" }}>
                  {fmtMoney(w.salary)}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <OutlineButton small onClick={() => setPickerWeight(weight)}>
                  {w ? "Swap" : "Add"}
                </OutlineButton>
                {w && <OutlineButton small onClick={() => onRemove(weight)}>Remove</OutlineButton>}
              </div>
            </div>
          );
        })}
      </div>

      {pickerWeight && (
        <WrestlerPicker
          weight={pickerWeight}
          wrestlers={wrestlers.filter((w) => w.weight === pickerWeight)}
          capRemainingExcludingCurrent={SALARY_CAP - (capUsed - (myRoster[pickerWeight] ? wrestlerById[myRoster[pickerWeight]].salary : 0))}
          onPick={(wid) => {
            onAssign(pickerWeight, wid);
            setPickerWeight(null);
          }}
          onClose={() => setPickerWeight(null)}
        />
      )}
    </div>
  );
}
