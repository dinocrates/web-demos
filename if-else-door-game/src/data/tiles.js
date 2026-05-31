export const pickupCells = ["b", "r", "y", "c"];
export const rewardDoorCells = ["G", "S", "N"];

export function cellStyle(cell, room) {
  const base = "relative flex aspect-square items-center justify-center rounded-md border text-xs font-black shadow-inner select-none";
  const doorStyles = {
    blue: "border-sky-200 bg-sky-700 text-white shadow-sky-500/30",
    red: "border-red-200 bg-red-700 text-white shadow-red-500/30",
    yellow: "border-yellow-200 bg-yellow-500 text-black shadow-yellow-500/30",
  };
  const styles = {
    "#": "border-slate-950 bg-slate-800 text-slate-700",
    ".": "border-slate-800 bg-slate-950",
    "^": "border-red-500/50 bg-red-950 text-red-200",
    D: doorStyles[room?.doorColor] ?? "border-sky-300 bg-sky-700 text-white",
    b: "border-sky-200 bg-sky-500 text-white",
    r: "border-red-200 bg-red-600 text-white",
    y: "border-yellow-200 bg-yellow-500 text-black",
    c: "border-amber-200 bg-amber-500 text-black",
    G: "border-yellow-200 bg-yellow-600 text-black",
    S: "border-slate-200 bg-slate-400 text-black",
    N: "border-orange-200 bg-orange-700 text-white",
  };
  return `${base} ${styles[cell] || styles["."]}`;
}

export function cellLabel(cell) {
  const labels = {
    "#": "",
    ".": "",
    "^": "!",
    D: "EXIT",
    b: "B",
    r: "R",
    y: "Y",
    c: "$",
    G: "GOLD",
    S: "SILV",
    N: "BRNZ",
  };
  return labels[cell] ?? "";
}
