export const keyMoves = {
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
};

export function getTargetCell(grid, player, dx, dy) {
  const x = player.x + dx;
  const y = player.y + dy;
  return { x, y, cell: grid[y]?.[x] };
}

export function removeCellFromGrid(grid, x, y) {
  const updatedGrid = grid.map((row) => [...row]);
  updatedGrid[y][x] = ".";
  return updatedGrid;
}

export function applyPickup(stats, cell) {
  if (cell === "b") return { ...stats, blueKeys: stats.blueKeys + 1 };
  if (cell === "r") return { ...stats, redKeys: stats.redKeys + 1 };
  if (cell === "y") return { ...stats, yellowKeys: stats.yellowKeys + 1 };
  if (cell === "c") return { ...stats, coins: stats.coins + 1 };
  return stats;
}

export function pickupMessage(cell) {
  if (cell === "b") return "Picked up blue keycard. Try the blue exit again.";
  if (cell === "r") return "Picked up red keycard. The if condition should now be true.";
  if (cell === "y") return "Picked up yellow key. Does the vault need one key or two?";
  if (cell === "c") return "Coin collected. Coin thresholds control the reward doors.";
  return "";
}

export function applyDamage(stats, damage) {
  return { ...stats, health: Math.max(0, stats.health - damage) };
}
