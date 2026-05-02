# Variable Game Tuner Sprite Pack — First Pass

This is a first-pass sliced sprite pack generated from the AI-created fantasy RPG sprite sheet.

## How to use

Copy the contents of this folder into:

```text
variable-game-tuner/public/sprites/
```

For example, after copying, this should exist:

```text
variable-game-tuner/public/sprites/player/down_0.png
variable-game-tuner/public/sprites/goblin/down_0.png
variable-game-tuner/public/sprites/items/sword.png
variable-game-tuner/public/sprites/coin/spin_0.png
```

The included `spriteManifest.js` is a starting point for Codex. It assumes the files are served from `/sprites/...`.

## Important notes

- This is a first-pass slice, not a final professional asset pipeline.
- The original generated sprite sheet had a checkerboard background baked into the image.
- A simple edge-background removal pass was applied to make the backgrounds transparent.
- Some crops may need adjustment after you see them in-game.
- Keep the shape renderer as a fallback.

## Recommended Codex prompt

```text
I have added a first-pass sprite pack to public/sprites.

Please add a sprite renderer to the Variable Game Tuner while keeping the current shape renderer as a fallback.

Requirements:
- Load the individual PNG sprites from public/sprites.
- Use player down/up/side animations.
- Mirror side-facing player sprites for left movement.
- Use goblin down/up/side animations.
- Mirror side-facing goblin sprites for left movement.
- Animate coins using the four spin frames.
- Draw the sword sprite by rotating one sword image based on player facing direction.
- If any sprite fails to load, fall back to the current shape renderer.
- Do not change parser behavior or generated student code.
- Do not remove the shape renderer.
- Run npm run build when finished.
```
