import { cellLabel, cellStyle } from "../data/tiles";
import { RoomClearOverlay } from "./RoomClearOverlay";

export function GameArena({
  columns,
  complete,
  grid,
  isFinalRoom,
  message,
  onContinue,
  onReplay,
  player,
  room,
  trace,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-black p-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isPlayer = player.x === x && player.y === y;
            return (
              <div key={`${x}-${y}`} className={cellStyle(cell, room)}>
                {isPlayer ? (
                  <div className="absolute inset-1 flex items-center justify-center rounded-md border border-cyan-200 bg-cyan-400 text-black shadow-lg shadow-cyan-500/40">
                    ^
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs">{cellLabel(cell)}</span>
                )}
              </div>
            );
          }),
        )}
      </div>

      <RoomClearOverlay
        complete={complete}
        isFinalRoom={isFinalRoom}
        message={message}
        onContinue={onContinue}
        onReplay={onReplay}
        trace={trace}
      />
    </div>
  );
}
