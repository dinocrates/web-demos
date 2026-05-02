import { renderShapeGame } from "./shapeRenderer";

export function renderSpriteGame(ctx, state, config, now) {
  // Later this renderer can draw facing-aware player sprites, mirrored side
  // sprites, rotated sword art, and animated coins/enemies. For now it falls
  // back to the shape renderer so missing assets never break the teaching demo.
  renderShapeGame(ctx, state, config, now);
}
