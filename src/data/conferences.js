// ============================================================
// D1 WRESTLING CONFERENCE MAP
// Sourced from the "List of NCAA Division I men's wrestling
// programs" reference table, 2025-26 season conference
// affiliations (wrestling-specific, NOT a school's primary
// all-sports conference — e.g. Missouri is SEC in football
// but Big 12 for wrestling; Oklahoma is the same story).
//
// Only conferences that actually sponsor D1 wrestling exist
// here: ACC, Big 12, Big Ten, EIWA, Ivy League, MAC, Pac-12,
// SoCon. There is no wrestling SEC, Big East, or CAA as of
// 2025-26 — those leagues dropped or never sponsored the sport.
// ============================================================

export const REQUIRED_CONFERENCES = [
  "Big Ten",
  "Big 12",
  "EIWA",
  "ACC",
  "Ivy League",
  "Pac-12",
  "SoCon",
  "MAC",
];

// Conferences eligible to fill the 2 "wild card" roster slots,
// on top of each conference's own required pick.
export const WILD_CARD_CONFERENCES = ["MAC", "SoCon"];

export const SCHOOL_CONFERENCE = {
  // ACC
  "Duke": "ACC",
  "NC State": "ACC",
  "North Carolina": "ACC",
  "Pitt": "ACC",
  "Stanford": "ACC",
  "Virginia": "ACC",
  "Virginia Tech": "ACC",

  // Big 12
  "Arizona State": "Big 12",
  "California Baptist": "Big 12",
  "Iowa State": "Big 12",
  "Missouri": "Big 12",
  "Northern Iowa": "Big 12",
  "Oklahoma": "Big 12",
  "Oklahoma State": "Big 12",
  "Utah Valley": "Big 12",
  "West Virginia": "Big 12",
  "Wyoming": "Big 12",
  "Air Force": "Big 12",
  "North Dakota State": "Big 12",
  "Northern Colorado": "Big 12",
  "South Dakota State": "Big 12",

  // Big Ten
  "Illinois": "Big Ten",
  "Indiana": "Big Ten",
  "Iowa": "Big Ten",
  "Maryland": "Big Ten",
  "Michigan": "Big Ten",
  "Michigan State": "Big Ten",
  "Minnesota": "Big Ten",
  "Nebraska": "Big Ten",
  "Northwestern": "Big Ten",
  "Ohio State": "Big Ten",
  "Penn State": "Big Ten",
  "Purdue": "Big Ten",
  "Rutgers": "Big Ten",
  "Wisconsin": "Big Ten",

  // EIWA
  "American": "EIWA",
  "Army": "EIWA",
  "Binghamton": "EIWA",
  "Bucknell": "EIWA",
  "Drexel": "EIWA",
  "Franklin & Marshall": "EIWA",
  "Hofstra": "EIWA",
  "Lehigh": "EIWA",
  "LIU": "EIWA",
  "Morgan State": "EIWA",
  "Navy": "EIWA",
  "Sacred Heart": "EIWA",

  // Ivy League
  "Brown": "Ivy League",
  "Columbia": "Ivy League",
  "Cornell": "Ivy League",
  "Harvard": "Ivy League",
  "Penn": "Ivy League",
  "Princeton": "Ivy League",

  // MAC
  "Bloomsburg": "MAC",
  "Buffalo": "MAC",
  "Central Michigan": "MAC",
  "Clarion": "MAC",
  "Edinboro": "MAC",
  "George Mason": "MAC",
  "Kent State": "MAC",
  "Lock Haven": "MAC",
  "Northern Illinois": "MAC",
  "Ohio": "MAC",
  "Rider": "MAC",
  "SIU Edwardsville": "MAC",

  // Pac-12
  "Cal Poly": "Pac-12",
  "Cal State Bakersfield": "Pac-12",
  "Little Rock": "Pac-12",
  "Oregon State": "Pac-12",

  // SoCon
  "Appalachian State": "SoCon",
  "Bellarmine": "SoCon",
  "Campbell": "SoCon",
  "Chattanooga": "SoCon",
  "Citadel": "SoCon",
  "Davidson": "SoCon",
  "Gardner-Webb": "SoCon",
  "Presbyterian": "SoCon",
  "VMI": "SoCon",
};

export function conferenceForSchool(school) {
  return SCHOOL_CONFERENCE[school] || null;
}
