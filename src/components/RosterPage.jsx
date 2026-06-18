import { useState } from "react";
import { C, displayFont, monoFont } from "../theme";
import { OutlineButton, Card } from "./Primitives";
import { WEIGHT_CLASSES } from "../data/wrestlers";
import { rosterWrestlerList, checkConferenceRule, checkChampionRule, CONFERENCE_TARGETS } from "../data/rosterRules";
import { WrestlerPicker } from "./WrestlerPicker";

export function RosterPage({ myRoster, wrestlers, wrestlerById, swapsRemaining, isCommitted, onAssign, onRemove, onCommit }) {
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
  const filledCount = WEIGHT_CLASSES.filter((w) => myRoster[w]).length;
  const rosterComplete = filledCount === WEIGHT_CLASSES.length;
  const allRulesSatisfied = conferenceCheck.satisfied && championCheck.satisfied;
  const canCommit = rosterComplete && allRulesSatisfied;
  // Pre-commit, editing is always unlocked on every slot regardless of
  // fill state (that's the whole point of the free-editing phase).
  // Post-commit, editing on already-filled slots is gated behind the
  // roster being complete (kept from the earlier lock-until-complete
  // behavior, mostly relevant if a manager somehow lost a pick).
  const editingUnlocked = !isCommitted || rosterComplete;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: displayFont, fontSize: 26, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: C.ink, margin: 0 }}>
          My Roster
        </h1>
        <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 4 }}>
          {isCommitted
            ? rosterComplete
              ? `All 10 weight classes filled. ${swapsRemaining} swap${swapsRemaining === 1 ? "" : "s"} left this week.`
              : `Fill all 10 weight classes (${filledCount}/10 so far). Swaps and removals unlock once your roster is complete.`
            : `Building your initial roster (${filledCount}/10 so far) — edit freely, no swap limit applies yet. Commit when you're happy with it.`}
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
        <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 12 }}>
          Exactly 1 pick each from Big Ten, Big 12, EIWA, ACC, Ivy League, and
          Pac-12 &mdash; plus exactly 2 each from MAC and SoCon (their own
          required slot, plus 1 wild-card pick). That's 6&times;1 + 2&times;2 = 10,
          your whole roster.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
          {conferenceCheck.conferenceStatus.map(({ conference, count, target, met }) => (
            <div
              key={conference}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 10px",
                borderRadius: 4,
                background: met ? "rgba(47,107,62,0.1)" : "rgba(163,56,46,0.08)",
                border: `1px solid ${met ? C.win : C.loss}`,
                fontSize: 12,
                fontWeight: 600,
                color: met ? C.win : C.loss,
              }}
            >
              <span style={{ fontSize: 13 }}>{met ? "\u2713" : "\u25cb"}</span>
              {conference}: {count}/{target}
            </div>
          ))}
        </div>
      </Card>

      {!isCommitted && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: displayFont, fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, color: C.ink }}>
                Commit your roster
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2, maxWidth: 460 }}>
                {canCommit
                  ? "Everything checks out. Once you commit, edits switch to the normal weekly swap limit."
                  : !rosterComplete
                  ? `Fill all 10 weight classes first (${filledCount}/10 so far).`
                  : "Your roster is full, but doesn't satisfy the rules above yet \u2014 fix those before committing."}
              </div>
            </div>
            <OutlineButton
              small
              disabled={!canCommit}
              onClick={onCommit}
              style={
                canCommit
                  ? undefined
                  : {
                      cursor: "not-allowed",
                      opacity: 0.4,
                      borderColor: C.inkSoft,
                      color: C.inkSoft,
                    }
              }
            >
              Commit Roster
            </OutlineButton>
          </div>
        </Card>
      )}

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
                {(!w || editingUnlocked) && (
                  <OutlineButton small onClick={() => setPickerWeight(weight)}>
                    {w ? "Swap" : "Add"}
                  </OutlineButton>
                )}
                {w && editingUnlocked && (
                  <OutlineButton small onClick={() => onRemove(weight)}>Remove</OutlineButton>
                )}
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
          conferenceCounts={byConference}
          conferenceTargets={CONFERENCE_TARGETS}
          currentPickConference={myRoster[pickerWeight] ? wrestlerById[myRoster[pickerWeight]].conference : null}
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
