import { WEIGHT_CLASSES } from "./wrestlers.js";
import { REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "./conferences.js";

// A roster is { [weight]: wrestlerId }. This module checks it
// against the league's three simultaneous rules:
//   1. All 10 weight classes must be filled.
//   2. Across those 10 picks, each of the 8 REQUIRED_CONFERENCES
//      must appear at least once, AND at least 2 additional picks
//      (beyond each conference's own required appearance) must
//      come from MAC or SoCon — the "wild card" slots.
//   3. No single conference may supply more than MAX_PER_CONFERENCE
//      picks, total, across the whole roster.
//
// Concretely: out of 10 total picks, 8 are "spent" satisfying the
// 8 required conferences one each, and the remaining 2 must be
// MAC and/or SoCon wrestlers (in any combination — 2 MAC, 2 SoCon,
// or 1 of each all satisfy the wild-card requirement) — and no
// conference, including MAC/SoCon, can exceed the per-conference cap.
//
// Note this means the wild-card requirement can ONLY be met by an
// even split (2 MAC + 2 SoCon overall, or all 4 picks across the two
// split some other 2/2 way) once the cap is 2 — "3 MAC + 1 SoCon"
// used to be a valid way to hit the wild-card minimum but now
// violates the cap, since MAC would have 3 total picks.

export const MAX_PER_CONFERENCE = 2;

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
// Also enforces a hard per-conference cap (MAX_PER_CONFERENCE) that
// applies to every conference, including MAC/SoCon.
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

  const overCapConferences = Object.keys(byConference).filter(
    (c) => byConference[c].length > MAX_PER_CONFERENCE
  );
  const capRespected = overCapConferences.length === 0;

  return {
    missingRequired,
    wildCardSurplus,
    wildCardsNeeded,
    wildCardsMet,
    byConference,
    maxPerConference: MAX_PER_CONFERENCE,
    overCapConferences,
    capRespected,
    satisfied: missingRequired.length === 0 && wildCardsMet && capRespected,
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
