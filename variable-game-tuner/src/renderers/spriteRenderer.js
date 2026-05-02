import { renderShapeGame } from "./shapeRenderer";
import { CANVAS_HEIGHT, CANVAS_WIDTH, HUD_HEIGHT } from "../game/constants";
import { getAttackHitbox } from "../game/collision";
import { spriteManifest } from "./spriteManifest";

const spriteCache = {
  status: "idle",
  images: new Map(),
};

function spriteUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function manifestPaths() {
  return [
    ...spriteManifest.player.animations.down,
    ...spriteManifest.player.animations.up,
    ...spriteManifest.player.animations.side,
    ...spriteManifest.goblin.animations.down,
    ...spriteManifest.goblin.animations.up,
    ...spriteManifest.goblin.animations.side,
    ...spriteManifest.coin.animations.spin,
    spriteManifest.sword.image,
    spriteManifest.tiles.background,
    spriteManifest.tiles.floor,
  ];
}

function loadSprite(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve([path, image]);
    image.onerror = () => reject(new Error(`Could not load sprite: ${path}`));
    image.src = spriteUrl(path);
  });
}

function beginLoadingSprites() {
  if (spriteCache.status !== "idle") return;

  spriteCache.status = "loading";
  Promise.all(manifestPaths().map(loadSprite))
    .then((entries) => {
      spriteCache.images = new Map(entries);
      spriteCache.status = "ready";
    })
    .catch(() => {
      spriteCache.status = "failed";
    });
}

function getImage(path) {
  return spriteCache.images.get(path);
}

function animationFrame(paths, now, frameMs) {
  const index = Math.floor(now / frameMs) % paths.length;
  return getImage(paths[index]);
}

function stillFrame(paths) {
  return getImage(paths[0]);
}

function facingAnimation(animations, facing) {
  if (facing === "up") return animations.up;
  if (facing === "down") return animations.down;
  return animations.side;
}

function enemyFacing(enemy) {
  if (Math.abs(enemy.vy) > Math.abs(enemy.vx)) {
    return enemy.vy < 0 ? "up" : "down";
  }
  return enemy.vx < 0 ? "left" : "right";
}

function drawCenteredSprite(ctx, image, x, y, width, height, mirror = false) {
  ctx.save();
  ctx.translate(x, y);
  if (mirror) ctx.scale(-1, 1);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function drawTiledBackground(ctx) {
  const background = getImage(spriteManifest.tiles.background);
  const floor = getImage(spriteManifest.tiles.floor);

  if (background) {
    ctx.drawImage(background, 0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);
  } else {
    const floorPattern = ctx.createPattern(floor, "repeat");
    if (floorPattern) {
      ctx.fillStyle = floorPattern;
      ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);
    }
  }

  ctx.fillStyle = "rgba(6, 12, 24, 0.94)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.moveTo(0, HUD_HEIGHT - 0.5);
  ctx.lineTo(CANVAS_WIDTH, HUD_HEIGHT - 0.5);
  ctx.stroke();
}

function drawHud(ctx, state, config) {
  ctx.fillStyle = "#f8fafc";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(`${config.playerName}  HP: ${state.player.health}/${config.playerHealth}  Score: ${state.score}`, 14, 26);

  const shieldLabel = config.shieldEnabled ? (state.player.shieldUsed ? "Shield: used" : "Shield: ready") : "Shield: off";
  ctx.textAlign = "right";
  ctx.fillText(`${shieldLabel}  Time: ${state.elapsed.toFixed(1)}s`, CANVAS_WIDTH - 14, 26);
  ctx.textAlign = "left";
}

function drawCoin(ctx, coin, now) {
  const image = animationFrame(spriteManifest.coin.animations.spin, now, 120);
  drawCenteredSprite(ctx, image, coin.x, coin.y, spriteManifest.coin.displayWidth, spriteManifest.coin.displayHeight);
}

function drawSword(ctx, state, config, now) {
  if (!config.swordEnabled || now >= state.attack.activeUntil) return;

  const image = getImage(spriteManifest.sword.image);
  const hitbox = getAttackHitbox(state.player, config, state.attack.direction);
  const x = hitbox.x + hitbox.width / 2;
  const y = hitbox.y + hitbox.height / 2;
  const rotations = {
    up: 0,
    right: Math.PI / 2,
    down: Math.PI,
    left: -Math.PI / 2,
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotations[state.attack.direction] ?? 0);
  ctx.drawImage(
    image,
    -spriteManifest.sword.displayWidth / 2,
    -spriteManifest.sword.displayHeight / 2,
    spriteManifest.sword.displayWidth,
    Math.max(spriteManifest.sword.displayHeight, config.swordRange)
  );
  ctx.restore();
}

function drawEnemy(ctx, enemy, config, now) {
  const facing = enemyFacing(enemy);
  const paths = facingAnimation(spriteManifest.goblin.animations, facing);
  const image = animationFrame(paths, now + enemy.id * 83, 180);
  const mirror = spriteManifest.goblin.sideFaces === "left" ? facing === "right" : facing === "left";

  drawCenteredSprite(ctx, image, enemy.x, enemy.y, spriteManifest.goblin.displayWidth, spriteManifest.goblin.displayHeight, mirror);

  if (config.enemyHealth > 1) {
    ctx.fillStyle = "#fee2e2";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 3;
    ctx.font = "bold 10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(String(enemy.health), enemy.x, enemy.y - 24);
    ctx.fillText(String(enemy.health), enemy.x, enemy.y - 24);
  }
}

function drawPlayer(ctx, state, config, now) {
  const flicker = now < state.player.invincibleUntil && Math.floor(now / 120) % 2 === 0;
  if (flicker) return;

  const paths = facingAnimation(spriteManifest.player.animations, state.player.facing);
  const image = state.player.moving ? animationFrame(paths, now, 140) : stillFrame(paths);
  const mirror = state.player.facing === "left";

  if (config.shieldEnabled && !state.player.shieldUsed) {
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.radius + 13, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(74, 222, 128, 0.8)";
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawCenteredSprite(ctx, image, state.player.x, state.player.y, spriteManifest.player.displayWidth, spriteManifest.player.displayHeight, mirror);

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(config.playerIcon, state.player.x, state.player.y - 2);
}

function drawOverlay(ctx, state) {
  if (!state.gameOver && !state.win && state.running) return;

  ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
  ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, CANVAS_HEIGHT - HUD_HEIGHT);
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.font = "bold 30px ui-sans-serif, system-ui, sans-serif";
  const title = state.win ? "You collected every coin!" : state.gameOver ? "Game Over" : "Paused";
  ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 18);
  ctx.font = "16px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("Change variables, apply, and test a new version.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16);
  ctx.textAlign = "left";
}

export function renderSpriteGame(ctx, state, config, now) {
  beginLoadingSprites();

  if (spriteCache.status !== "ready") {
    renderShapeGame(ctx, state, config, now);
    return;
  }

  try {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawTiledBackground(ctx);
    drawHud(ctx, state, config);
    state.coins.forEach((coin) => drawCoin(ctx, coin, now));
    drawSword(ctx, state, config, now);
    state.enemies.forEach((enemy) => drawEnemy(ctx, enemy, config, now));
    drawPlayer(ctx, state, config, now);
    drawOverlay(ctx, state);
  } catch {
    spriteCache.status = "failed";
    renderShapeGame(ctx, state, config, now);
  }
}
