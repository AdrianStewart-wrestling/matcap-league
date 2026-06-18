import { WEIGHT_CLASSES } from "./wrestlers.js";
import { REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "./conferences.js";

// A roster is { [weight]: wrestlerId }. This module checks it
// against the league's two simultaneous rules:
//   1. All 10 weight classes must be filled.
//   2. Across those 10 picks, each of the 8 REQUIRED_CONFERENCES
//      must appear at least once, AND at least 2 additional picks
//      (beyond each conference's own required appearance) must
//      come from MAC or SoCon — the "wild card" slots.
//
// Concretely: out of 10 total picks, 8 are "spent" satisfying the
// 8 required conferences one each, and the remaining 2 must be
// MAC and/or SoCon wrestlers (in any combination — 2 MAC, 2 SoCon,
// or 1 of each all satisfy the wild-card requirement).

export function rosterWrestlerList(roster, wrestlerById) {
  return WEIGHT_CLASSES
    .map((weight) => ({ weight, id: roster[weight] }))
    .filter((slot) => slot.id)
    .map((slot) => ({ ...slot, wrestler: wrestlerById[slot.id] }))
    .filter((slot) => slot.wrestler);
}

// Given the list of picked wrestlers (with .conference), determine
// whether the conference rule is satisfiable, using a simple greedy
// assignment: give each required conference its own pick first if
// available, then count remaining MAC/SoCon picks as wild cards.
export function checkConferenceRule(pickedWrestlers) {
  const byConference = {};
  pickedWrestlers.forEach((p) => {
    const c = p.wrestler.conference;
    if (!c) return;
    byConference[c] = byConference[c] || [];
    byConference[c].push(p);
  });

  const missingRequired = REQUIRED_CONFERENCES.filter(
    (c) => !byConference[c] || byConference[c].length === 0
  );

  // Count how many MAC/SoCon picks exist beyond the one each
  // conference needs for its own required slot.
  let wildCardSurplus = 0;
  WILD_CARD_CONFERENCES.forEach((c) => {
    const count = (byConference[c] || []).length;
    // first one (if present) covers that conference's own required
    // slot; anything beyond that counts toward the wild-card pool
    wildCardSurplus += Math.max(0, count - 1);
  });

  const wildCardsNeeded = 2;
  const wildCardsMet = wildCardSurplus >= wildCardsNeeded;

  return {
    missingRequired,
    wildCardSurplus,
    wildCardsNeeded,
    wildCardsMet,
    satisfied: missingRequired.length === 0 && wildCardsMet,
  };
}

// Exactly one of the 10 picks must be a 2026 weight-class champion
// (not zero, not two or more).
export function checkChampionRule(pickedWrestlers) {
  const champions = pickedWrestlers.filter((p) => p.wrestler.champion);
  const count = champions.length;
  return {
    count,
    needed: 1,
    satisfied: count === 1,
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
