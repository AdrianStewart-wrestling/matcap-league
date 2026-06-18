import { conferenceForSchool, SCHOOL_CONFERENCE, REQUIRED_CONFERENCES, WILD_CARD_CONFERENCES } from "./conferences.js";

// ============================================================
// WRESTLER DATA (placeholder, seeded from real 2025-26 NCAA AAs)
// Refresh this block closer to the 2026-27 season with live
// preseason rankings from InterMat / FloWrestling.
// ============================================================

export const WEIGHT_CLASSES = [125, 133, 141, 149, 157, 165, 174, 184, 197, 285];

export const ALL_AMERICANS = {
  125: [
    { rank: 1, name: "Luke Lilledahl", school: "Penn State", finish: 1 },
    { rank: 10, name: "Marc-Anthony McGowan", school: "Princeton", finish: 2 },
    { rank: 7, name: "Nico Provo", school: "Stanford", finish: 3 },
    { rank: 12, name: "Vincent Robinson", school: "NC State", finish: 4 },
    { rank: 5, name: "Troy Spratley", school: "Lehigh", finish: 5 },
    { rank: 14, name: "Jacob Moran", school: "Indiana", finish: 6 },
    { rank: 6, name: "Jore Volk", school: "Minnesota", finish: 7 },
    { rank: 11, name: "Tyler Klinsky", school: "Rider", finish: 8 },
  ],
  133: [
    { rank: 1, name: "Jax Forrest", school: "Oklahoma State", finish: 1 },
    { rank: 2, name: "Ben Davino", school: "Ohio State", finish: 2 },
    { rank: 4, name: "Aaron Seidel", school: "Virginia Tech", finish: 3 },
    { rank: 3, name: "Marcus Blaze", school: "Penn State", finish: 4 },
    { rank: 7, name: "Drake Ayala", school: "Iowa", finish: 5 },
    { rank: 15, name: "Tyler Knox", school: "Stanford", finish: 6 },
    { rank: 13, name: "Jacob Van Dee", school: "Nebraska", finish: 7 },
    { rank: 8, name: "Lucas Byrd", school: "Illinois", finish: 8 },
  ],
  141: [
    { rank: 2, name: "Sergio Vega", school: "Oklahoma State", finish: 1 },
    { rank: 1, name: "Jesse Mendez", school: "Ohio State", finish: 2 },
    { rank: 5, name: "Luke Stanich", school: "Lehigh", finish: 3 },
    { rank: 3, name: "Brock Hardy", school: "Nebraska", finish: 4 },
    { rank: 18, name: "Carter Nogle", school: "Air Force", finish: 5 },
    { rank: 4, name: "Anthony Echemendia", school: "Iowa State", finish: 6 },
    { rank: 11, name: "CJ Composto", school: "Penn", finish: 7 },
    { rank: 13, name: "Wyatt Henson", school: "Lock Haven", finish: 8 },
  ],
  149: [
    { rank: 10, name: "Aden Valencia", school: "Stanford", finish: 1 },
    { rank: 1, name: "Shayne Van Ness", school: "Penn State", finish: 2 },
    { rank: 11, name: "Lachlan McNeil", school: "Michigan", finish: 3 },
    { rank: 20, name: "Chance Lamer", school: "Nebraska", finish: 4 },
    { rank: 4, name: "Collin Gaj", school: "Virginia Tech", finish: 5 },
    { rank: 15, name: "Ryder Block", school: "Iowa", finish: 6 },
    { rank: 8, name: "Casey Swiderski", school: "Oklahoma State", finish: 7 },
    { rank: 3, name: "Cross Wasilewski", school: "Penn", finish: 8 },
  ],
  157: [
    { rank: 5, name: "Landon Robideau", school: "Oklahoma State", finish: 1 },
    { rank: 2, name: "Antrell Taylor", school: "Nebraska", finish: 2 },
    { rank: 1, name: "PJ Duke", school: "Penn State", finish: 3 },
    { rank: 8, name: "Brandon Cannon", school: "Ohio State", finish: 4 },
    { rank: 7, name: "Kannon Webster", school: "Illinois", finish: 5 },
    { rank: 11, name: "Ty Watters", school: "West Virginia", finish: 6 },
    { rank: 15, name: "Cameron Catrabone", school: "Michigan", finish: 7 },
    { rank: 3, name: "Meyer Shapiro", school: "Cornell", finish: 8 },
  ],
  165: [
    { rank: 1, name: "Mitchell Mesenbrink", school: "Penn State", finish: 1 },
    { rank: 3, name: "Mikey Caliendo", school: "Iowa", finish: 2 },
    { rank: 12, name: "Cesar Alvan", school: "Columbia", finish: 3 },
    { rank: 4, name: "Nicco Ruiz", school: "Wisconsin", finish: 4 },
    { rank: 13, name: "Andrew Sparks", school: "NC State", finish: 5 },
    { rank: 2, name: "Joey Blaze", school: "Purdue", finish: 6 },
    { rank: 9, name: "Bryce Hepner", school: "North Carolina", finish: 7 },
    { rank: 16, name: "Paddy Gallagher", school: "Ohio State", finish: 8 },
  ],
  174: [
    { rank: 1, name: "Levi Haines", school: "Penn State", finish: 1 },
    { rank: 3, name: "Chris Minto", school: "Nebraska", finish: 2 },
    { rank: 5, name: "Patrick Kennedy", school: "Iowa", finish: 3 },
    { rank: 4, name: "Carson Kharchla", school: "Ohio State", finish: 4 },
    { rank: 7, name: "Cam Steed", school: "Missouri", finish: 5 },
    { rank: 15, name: "Danny Wask", school: "Navy", finish: 6 },
    { rank: 9, name: "Beau Mantanona", school: "Michigan", finish: 7 },
    { rank: 11, name: "MJ Gaitan", school: "Iowa State", finish: 8 },
  ],
  184: [
    { rank: 3, name: "Max McEnelly", school: "Minnesota", finish: 1 },
    { rank: 2, name: "Rocco Welsh", school: "Penn State", finish: 2 },
    { rank: 4, name: "Aeoden Sinclair", school: "Missouri", finish: 3 },
    { rank: 10, name: "Caleb Campos", school: "American", finish: 4 },
    { rank: 5, name: "Brock Mantanona", school: "Michigan", finish: 5 },
    { rank: 7, name: "Angelo Ferrari", school: "Iowa", finish: 6 },
    { rank: 6, name: "Eddie Neitenbach", school: "Wyoming", finish: 7 },
    { rank: 22, name: "Zack Ryder", school: "Oklahoma State", finish: 8 },
  ],
  197: [
    { rank: 1, name: "Josh Barr", school: "Penn State", finish: 1 },
    { rank: 7, name: "Cody Merrill", school: "Oklahoma State", finish: 2 },
    { rank: 3, name: "Stephen Little", school: "Little Rock", finish: 3 },
    { rank: 5, name: "Joey Novak", school: "Wyoming", finish: 4 },
    { rank: 11, name: "Camden McDanel", school: "Nebraska", finish: 5 },
    { rank: 9, name: "Angelo Posada", school: "Stanford", finish: 6 },
    { rank: 27, name: "Gabe Arnold", school: "Iowa", finish: 7 },
    { rank: 16, name: "Branson John", school: "Maryland", finish: 8 },
  ],
  285: [
    { rank: 2, name: "Isaac Trumble", school: "NC State", finish: 1 },
    { rank: 1, name: "Yonger Bastida", school: "Iowa State", finish: 2 },
    { rank: 3, name: "Taye Ghadiali", school: "Michigan", finish: 3 },
    { rank: 7, name: "Konner Doucet", school: "Oklahoma State", finish: 4 },
    { rank: 8, name: "Ben Kueter", school: "Iowa", finish: 5 },
    { rank: 4, name: "AJ Ferrari", school: "Nebraska", finish: 6 },
    { rank: 10, name: "David Szuba", school: "Arizona State", finish: 7 },
    { rank: 18, name: "Christian Carroll", school: "Wyoming", finish: 8 },
  ],
};

// All schools available for generated depth wrestlers, grouped
// by conference so every required conference (including thin
// ones like Pac-12 and SoCon) can be guaranteed real depth at
// every single weight class.
const SCHOOLS_BY_CONFERENCE = {};
Object.entries(SCHOOL_CONFERENCE).forEach(([school, conf]) => {
  SCHOOLS_BY_CONFERENCE[conf] = SCHOOLS_BY_CONFERENCE[conf] || [];
  SCHOOLS_BY_CONFERENCE[conf].push(school);
});
const ALL_CONFERENCES = Object.keys(SCHOOLS_BY_CONFERENCE);

const FIRST_NAMES = ["Jake", "Mason", "Tyler", "Dylan", "Cole", "Trent", "Gavin", "Owen", "Wyatt", "Holden",
  "Brody", "Carter", "Hunter", "Jaxon", "Ryder", "Beau", "Cooper", "Eli", "Caden", "Brayden",
  "Connor", "Wesley", "Grant", "Bennett", "Asher", "Ian", "Levi", "Miles", "Soren", "Reid"];
const LAST_NAMES = ["Bauer", "Schmidt", "Konrad", "Voss", "Hartley", "Mercer", "Donovan", "Pruitt", "Castillo", "Knapp",
  "Sorenson", "Whitaker", "Maddox", "Cantrell", "Belmont", "Ostrander", "Quintero", "Faulkner", "Brennan", "Tisdale",
  "Garrity", "Halloran", "Pemberton", "Strand", "Voskuil", "Ladner", "Brockman", "Yelich", "Marrone", "Tedesco"];

function generateName(usedNames, seed) {
  let attempts = 0;
  while (attempts < 50) {
    const fn = FIRST_NAMES[(seed * 7 + attempts * 13) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(seed * 11 + attempts * 17) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    attempts++;
  }
  return `Wrestler ${seed}`;
}

// Deterministic pseudo-random index, stable across renders/seeds.
function pick(arr, seed) {
  return arr[Math.abs(seed) % arr.length];
}

// Builds an ordered list of conferences to assign to generated
// depth wrestlers for one weight class: every required conference
// gets at least 2 slots (so it survives multiple managers picking
// from it), MAC/SoCon get extra slots since they double as wild
// cards, and the remainder cycles through all conferences for
// realistic variety.
function conferenceAssignmentPlan(weight, depthSlots) {
  const plan = [];
  REQUIRED_CONFERENCES.forEach((c) => {
    plan.push(c, c, c); // 3 guaranteed depth options per required conference
  });
  WILD_CARD_CONFERENCES.forEach((c) => {
    plan.push(c, c); // extra MAC/SoCon depth since they're reused as wild cards
  });
  let i = 0;
  while (plan.length < depthSlots) {
    plan.push(ALL_CONFERENCES[i % ALL_CONFERENCES.length]);
    i++;
  }
  // deterministic shuffle so the order isn't strictly grouped by conference
  for (let j = plan.length - 1; j > 0; j--) {
    const k = (weight * 13 + j * 7) % (j + 1);
    [plan[j], plan[k]] = [plan[k], plan[j]];
  }
  return plan;
}

function buildWrestlerPool() {
  const pool = [];
  let idCounter = 1;
  const usedNames = new Set();

  WEIGHT_CLASSES.forEach((weight) => {
    const aaList = ALL_AMERICANS[weight];
    aaList.forEach((aa) => usedNames.add(aa.name));
    const weightWrestlers = [];

    aaList.forEach((aa) => {
      weightWrestlers.push({
        id: `w${idCounter++}`,
        name: aa.name,
        school: aa.school,
        conference: conferenceForSchool(aa.school),
        weight,
        rank: aa.rank,
        finish2026: aa.finish,
        allAmerican: true,
        champion: aa.finish === 1,
      });
    });

    const takenRanks = new Set(aaList.map((a) => a.rank));
    const availableRanks = [];
    for (let r = 1; r <= 40 && availableRanks.length < 32; r++) {
      if (!takenRanks.has(r)) availableRanks.push(r);
    }
    const confPlan = conferenceAssignmentPlan(weight, availableRanks.length);

    availableRanks.forEach((r, idx) => {
      const conf = confPlan[idx];
      const schoolsInConf = SCHOOLS_BY_CONFERENCE[conf];
      const school = pick(schoolsInConf, weight * 97 + r * 31 + idx);
      const name = generateName(usedNames, idCounter + weight * 100 + r);
      weightWrestlers.push({
        id: `w${idCounter++}`,
        name,
        school,
        conference: conf,
        weight,
        rank: r,
        finish2026: null,
        allAmerican: false,
        champion: false,
      });
    });

    weightWrestlers.sort((a, b) => a.rank - b.rank);
    pool.push(...weightWrestlers);
  });

  return pool;
}

export function buildFullWrestlerData() {
  return buildWrestlerPool();
}
