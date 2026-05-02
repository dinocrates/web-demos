import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../game/constants";

export function GamePanel({ canvasRef, gameSnapshot, onResetGame, onToggleRunning }) {
  const playLabel = gameSnapshot.running ? "Pause" : gameSnapshot.gameOver || gameSnapshot.win ? "Play Again" : "Start";

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Game Pane</h2>
          <p className="text-sm text-slate-400">Move with WASD or arrow keys. Press Space or J to attack.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onToggleRunning} className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200">
            {playLabel}
          </button>
          <button onClick={onResetGame} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700">
            Reset Game
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="h-auto w-full rounded-xl"
          aria-label="Playable variable-controlled dungeon game"
        />
      </div>
    </div>
  );
}
