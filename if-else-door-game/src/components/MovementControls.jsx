import { MiniButton } from "./MiniButton";

export function MovementControls({ onMove, onReset }) {
  return (
    <div className="mx-auto grid w-40 grid-cols-3 gap-2 text-center">
      <div />
      <MiniButton onClick={() => onMove(0, -1)}>Up</MiniButton>
      <div />
      <MiniButton onClick={() => onMove(-1, 0)}>Left</MiniButton>
      <MiniButton onClick={onReset}>Reset</MiniButton>
      <MiniButton onClick={() => onMove(1, 0)}>Right</MiniButton>
      <div />
      <MiniButton onClick={() => onMove(0, 1)}>Down</MiniButton>
      <div />
    </div>
  );
}
