import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../game/constants";
import { RetroButton } from "./RetroButton";
import { RetroWindow } from "./RetroWindow";

export function GamePanel({ canvasRef, gameSnapshot, onResetGame, onToggleRunning }) {
  const playLabel = gameSnapshot.running ? "Pause" : gameSnapshot.gameOver || gameSnapshot.win ? "Play Again" : "Start";

  return (
    <RetroWindow
      title="Game Pane"
      subtitle="Move with WASD or arrow keys. Press Space or J to attack."
      actions={
        <>
          <RetroButton onClick={onToggleRunning} variant="secondary">{playLabel}</RetroButton>
          <RetroButton onClick={onResetGame}>Reset Game</RetroButton>
        </>
      }
    >
      <div className="retro-canvas-frame">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="retro-canvas"
          aria-label="Playable variable-controlled dungeon game"
        />
      </div>
    </RetroWindow>
  );
}
