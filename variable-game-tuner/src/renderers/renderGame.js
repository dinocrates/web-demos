import { renderShapeGame } from "./shapeRenderer";

export function renderGame(ctx, state, config, options = {}) {
  const now = options.now ?? performance.now();

  // Keep rendering separate from simulation so future sprite work can change
  // presentation without changing movement, collision, scoring, or health.
  renderShapeGame(ctx, state, config, now);
}
