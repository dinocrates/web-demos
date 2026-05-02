import { ROOM_BOUNDS, TARGET_FRAME_MS } from "./constants";
import { circleIntersectsRect, clamp, distance, getAttackHitbox } from "./collision";

export function updateGameState(state, config, keys, attackRequested, deltaMs, now) {
  if (!state.running || state.gameOver || state.win) return state;

  const deltaScale = deltaMs / TARGET_FRAME_MS;
  const next = {
    ...state,
    player: { ...state.player },
    enemies: state.enemies.map((enemy) => ({ ...enemy })),
    coins: [...state.coins],
    attack: { ...state.attack },
    elapsed: state.elapsed + deltaMs / 1000,
  };

  let dx = 0;
  let dy = 0;
  if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx -= 1;
  if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx += 1;
  if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy -= 1;
  if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy += 1;

  next.player.moving = dx !== 0 || dy !== 0;

  if (dx !== 0 || dy !== 0) {
    if (Math.abs(dx) > Math.abs(dy)) {
      next.player.facing = dx > 0 ? "right" : "left";
    } else {
      next.player.facing = dy > 0 ? "down" : "up";
    }

    const magnitude = Math.sqrt(dx * dx + dy * dy);
    next.player.x += (dx / magnitude) * config.playerSpeed * deltaScale;
    next.player.y += (dy / magnitude) * config.playerSpeed * deltaScale;
  }

  next.player.x = clamp(next.player.x, ROOM_BOUNDS.left + next.player.radius, ROOM_BOUNDS.right - next.player.radius);
  next.player.y = clamp(next.player.y, ROOM_BOUNDS.top + next.player.radius, ROOM_BOUNDS.bottom - next.player.radius);

  next.enemies.forEach((enemy) => {
    enemy.x += enemy.vx * deltaScale;
    enemy.y += enemy.vy * deltaScale;

    if (enemy.x < ROOM_BOUNDS.left + enemy.radius || enemy.x > ROOM_BOUNDS.right - enemy.radius) {
      enemy.vx *= -1;
      enemy.x = clamp(enemy.x, ROOM_BOUNDS.left + enemy.radius, ROOM_BOUNDS.right - enemy.radius);
    }
    if (enemy.y < ROOM_BOUNDS.top + enemy.radius || enemy.y > ROOM_BOUNDS.bottom - enemy.radius) {
      enemy.vy *= -1;
      enemy.y = clamp(enemy.y, ROOM_BOUNDS.top + enemy.radius, ROOM_BOUNDS.bottom - enemy.radius);
    }
  });

  if (attackRequested && config.swordEnabled && now >= next.attack.cooldownUntil) {
    next.attack.activeUntil = now + 160;
    next.attack.cooldownUntil = now + config.attackCooldown * 1000;
    next.attack.direction = next.player.facing;

    const hitbox = getAttackHitbox(next.player, config, next.attack.direction);
    next.enemies = next.enemies
      .map((enemy) => (circleIntersectsRect(enemy, hitbox) ? { ...enemy, health: enemy.health - config.swordDamage } : enemy))
      .filter((enemy) => enemy.health > 0);
  }

  const remainingCoins = [];
  next.coins.forEach((coin) => {
    if (distance(next.player, coin) < next.player.radius + coin.radius) {
      next.score += config.coinValue;
    } else {
      remainingCoins.push(coin);
    }
  });
  next.coins = remainingCoins;

  if (next.coins.length === 0) {
    next.win = true;
    next.running = false;
  }

  const isInvincible = now < next.player.invincibleUntil;
  const touchingEnemy = next.enemies.some((enemy) => distance(next.player, enemy) < next.player.radius + enemy.radius);

  if (touchingEnemy && !isInvincible && !next.win) {
    if (config.shieldEnabled && !next.player.shieldUsed) {
      next.player.shieldUsed = true;
      next.player.invincibleUntil = now + 1200;
    } else {
      next.player.health -= 1;
      next.player.invincibleUntil = now + 1200;
    }
  }

  if (next.player.health <= 0) {
    next.player.health = 0;
    next.gameOver = true;
    next.running = false;
  }

  return next;
}
