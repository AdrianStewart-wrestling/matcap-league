export const C = {
  maroon: "#6b1420",
  maroonDeep: "#4a0e16",
  maroonBright: "#7e1a28",
  chalk: "#f3eee4",
  chalkDim: "#d9d2c2",
  gold: "#c9971f",
  goldBright: "#e8b347",
  ink: "#1c1410",
  inkSoft: "#3a2e26",
  line: "rgba(28,20,16,0.14)",
  win: "#2f6b3e",
  loss: "#a3382e",
  white: "#ffffff",
};

export const displayFont = "'Oswald', 'Arial Narrow', sans-serif";
export const bodyFont = "-apple-system, 'Segoe UI', sans-serif";
export const monoFont = "'Roboto Mono', 'Courier New', monospace";

export const SCORING = { fall: 6, techfall: 5, major: 4, decision: 3, loss: 0 };
export const OUTCOMES = [
  { key: "fall", label: "Fall / Pin", pts: SCORING.fall },
  { key: "techfall", label: "Tech Fall", pts: SCORING.techfall },
  { key: "major", label: "Major Dec.", pts: SCORING.major },
  { key: "decision", label: "Decision", pts: SCORING.decision },
  { key: "loss", label: "Loss", pts: SCORING.loss },
];
export const SALARY_CAP = 50_000_000;
export const SWAPS_PER_WEEK = 2;

export function fmtMoney(n) {
  return "$" + (n / 1_000_000).toFixed(2) + "M";
}
