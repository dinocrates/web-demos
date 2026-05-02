import { CANVAS_HEIGHT, CANVAS_WIDTH, HUD_HEIGHT } from "../game/constants";
import { getAttackHitbox } from "../game/collision";

export function renderShapeGame(ctx, state, config, now = performance.now()) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const floorGradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  floorGradient.addColorStop(0, "#172033");
  floorGradient.addColorStop(1, "#25152d");
  ctx.fillStyle = floorGradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  for (let x = 0; x < CANVAS_WIDTH; x += 35) {
    ctx.fillRect(x, HUD_HEIGHT, 1, CANVAS_HEIGHT - HUD_HEIGHT);
  }
  for (let y = HUD_HEIGHT; y < CANVAS_HEIGHT; y += 35) {
    ctx.fillRect(0, y, CANVAS_WIDTH, 1);
  }

  ctx.fillStyle = "rgba(0,0,0,0.32)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);

  ctx.fillStyle = "#f8fafc";
  ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillText(`${config.playerName}  HP: ${state.player.health}/${config.playerHealth}  Score: ${state.score}`, 14, 26);

  const shieldLabel = config.shieldEnabled ? (state.player.shieldUsed ? "Shield: used" : "Shield: ready") : "Shield: off";
  ctx.textAlign = "right";
  ctx.fillText(`${shieldLabel}  Time: ${state.elapsed.toFixed(1)}s`, CANVAS_WIDTH - 14, 26);
  ctx.textAlign = "left";

  state.coins.forEach((coin) => {
    ctx.save();
    ctx.translate(coin.x, coin.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "#facc15";
    ctx.fillRect(-coin.radius, -coin.radius, coin.radius * 2, coin.radius * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.strokeRect(-coin.radius, -coin.radius, coin.radius * 2, coin.radius * 2);
    ctx.restore();
  });

  if (config.swordEnabled && now < state.attack.activeUntil) {
    const hitbox = getAttackHitbox(state.player, config, state.attack.direction);
    ctx.fillStyle = "rgba(226, 232, 240, 0.35)";
    ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
  }

  state.enemies.forEach((enemy) => {
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#fecaca";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#111827";
    ctx.font = "bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", enemy.x, enemy.y + 1);

    if (config.enemyHealth > 1) {
      ctx.fillStyle = "#fee2e2";
      ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(String(enemy.health), enemy.x, enemy.y - 20);
    }
  });

  const flicker = now < state.player.invincibleUntil && Math.floor(now / 120) % 2 === 0;
  if (!flicker) {
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
    ctx.fillStyle = config.shieldEnabled && !state.player.shieldUsed ? "#22c55e" : "#38bdf8";
    ctx.fill();
    ctx.strokeStyle = "#e0f2fe";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (config.shieldEnabled && !state.player.shieldUsed) {
      ctx.beginPath();
      ctx.arc(state.player.x, state.player.y, state.player.radius + 7, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.playerIcon, state.player.x, state.player.y + 1);
  }

  if (state.gameOver || state.win || !state.running) {
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
}
