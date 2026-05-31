export function buildRoom(room) {
  let start = { x: 1, y: 1 };
  const grid = room.map.map((row, y) =>
    row.split("").map((cell, x) => {
      if (cell === "P") {
        start = { x, y };
        return ".";
      }
      return cell;
    }),
  );

  return { grid, start };
}
