export const CANVAS_WIDTH = 560;
export const CANVAS_HEIGHT = 390;
export const HUD_HEIGHT = 42;
export const TARGET_FRAME_MS = 16.67;

// The prerendered room background includes stone walls around the walkable
// floor. These bounds keep actors on the floor while still leaving the art
// visible as collision context.
export const ROOM_BOUNDS = {
  left: 47,
  right: 513,
  top: HUD_HEIGHT + 49,
  bottom: HUD_HEIGHT + 292,
};
