import { useState } from "react";
import { C, displayFont, monoFont } from "../theme";
import { OutlineButton, Card } from "./Primitives";
import { WEIGHT_CLASSES } from "../data/wrestlers";
import { REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "../data/conferences";
import { rosterWrestlerList, checkConferenceRule, checkChampionRule } from "../data/rosterRules";
import { WrestlerPicker } from "./WrestlerPicker";

export function RosterPage({ myRoster, wrestlers, wrestlerById, swapsRemaining, onAssign, onRemove }) {
  const [pickerWeight, setPickerWeight] = useState(null);

  const picked = rosterWrestlerList(myRoster, wrestlerById);
  const conferenceCheck = checkConferenceRule(picked);
  const championCheck = checkChampionRule(picked);
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

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "9px 12px",
            borderRadius: 4,
            background: championCheck.satisfied ? "rgba(47,107,62,0.1)" : "rgba(163,56,46,0.08)",
            border: `1px solid ${championCheck.satisfied ? C.win : C.loss}`,
          }}
        >
          <span style={{ fontSize: 16 }}>{championCheck.satisfied ? "\u2713" : "\u25cb"}</span>
          <div>
            <div style={{ fontFamily: displayFont, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, color: championCheck.satisfied ? C.win : C.loss }}>
              Returning champion: {championCheck.count} / 1 max
            </div>
            <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>
              You may include at most one 2026 NCAA weight-class champion &mdash; zero is fine, more than one is not allowed.
            </div>
          </div>
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
                      {w.champion && (
                        <span style={{ fontFamily: monoFont, fontSize: 9.5, background: C.gold, color: C.ink, padding: "2px 6px", borderRadius: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                          2026 CHAMP
                        </span>
                      )}
                      {!w.champion && w.allAmerican && (
                        <span style={{ fontFamily: monoFont, fontSize: 9.5, background: C.chalkDim, color: C.inkSoft, padding: "2px 6px", borderRadius: 10, fontWeight: 700, letterSpacing: 0.5 }}>
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
          rosterHasChampion={championCheck.count > 0}
          currentPickIsChampion={myRoster[pickerWeight] ? wrestlerById[myRoster[pickerWeight]].champion : false}
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
