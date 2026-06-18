import { WEIGHT_CLASSES } from "./wrestlers.js";
import { REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "./conferences.js";

// A roster is { [weight]: wrestlerId }. This module checks it
// against the league's two simultaneous rules:
//   1. All 10 weight classes must be filled.
//   2. Across those 10 picks, each conference has an EXACT target
//      count, not a minimum/maximum range:
//        - Big Ten, Big 12, EIWA, ACC, Ivy League, Pac-12: exactly 1 each
//        - MAC, SoCon: exactly 2 each (their own 1 required slot,
//          plus exactly 1 wild-card pick each — not "2 more from
//          either in any combination")
//      That's 6×1 + 2×2 = 10, exactly filling the roster. There is
//      no slack: a conference with 0 picks is just as invalid as one
//      with 2 (for the 6) or 3 (for MAC/SoCon).

// Exact required count per required conference. The 6 "singles"
// conferences need exactly 1; MAC and SoCon need exactly 2 (their
// own required pick + exactly 1 wild-card pick each).
export const CONFERENCE_TARGETS = Object.fromEntries(
  REQUIRED_CONFERENCES.map((c) => [c, WILD_CARD_CONFERENCES.includes(c) ? 2 : 1])
);

export function rosterWrestlerList(roster, wrestlerById) {
  return WEIGHT_CLASSES
    .map((weight) => ({ weight, id: roster[weight] }))
    .filter((slot) => slot.id)
    .map((slot) => ({ ...slot, wrestler: wrestlerById[slot.id] }))
    .filter((slot) => slot.wrestler);
}

// Given the list of picked wrestlers (with .conference), check each
// required conference against its EXACT target count (see
// CONFERENCE_TARGETS above). Returns per-conference status so the UI
// can show "0/1", "1/1", "2/2", "3/2 — too many", etc.
export function checkConferenceRule(pickedWrestlers) {
  const byConference = {};
  pickedWrestlers.forEach((p) => {
    const c = p.wrestler.conference;
    if (!c) return;
    byConference[c] = byConference[c] || [];
    byConference[c].push(p);
  });

  const conferenceStatus = REQUIRED_CONFERENCES.map((c) => {
    const count = (byConference[c] || []).length;
    const target = CONFERENCE_TARGETS[c];
    return { conference: c, count, target, met: count === target };
  });

  const unmetConferences = conferenceStatus.filter((s) => !s.met);
  const underConferences = conferenceStatus.filter((s) => s.count < s.target);
  const overConferences = conferenceStatus.filter((s) => s.count > s.target);

  return {
    conferenceStatus,
    byConference,
    unmetConferences,
    underConferences,
    overConferences,
    satisfied: unmetConferences.length === 0,
  };
}

// At most one of the 10 picks may be a 2026 weight-class champion.
// Zero is fine; a champion pick is optional, not required.
export function checkChampionRule(pickedWrestlers) {
  const champions = pickedWrestlers.filter((p) => p.wrestler.champion);
  const count = champions.length;
  return {
    count,
    max: 1,
    satisfied: count <= 1,
    champions,
  };
}

export function validateRoster(roster, wrestlerById) {
  const picked = rosterWrestlerList(roster, wrestlerById);
  const missingWeights = WEIGHT_CLASSES.filter((w) => !roster[w]);
  const conferenceCheck = checkConferenceRule(picked);
  const championCheck = checkChampionRule(picked);

  return {
    complete: missingWeights.length === 0,
    missingWeights,
    conferenceCheck,
    championCheck,
    valid: missingWeights.length === 0 && conferenceCheck.satisfied && championCheck.satisfied,
  };
}
