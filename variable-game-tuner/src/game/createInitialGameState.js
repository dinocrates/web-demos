import { CANVAS_WIDTH, ROOM_BOUNDS } from "./constants";

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createCoins(count) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: randBetween(ROOM_BOUNDS.left + 16, ROOM_BOUNDS.right - 16),
    y: randBetween(ROOM_BOUNDS.top + 16, ROOM_BOUNDS.bottom - 16),
    radius: 8,
  }));
}

function createEnemies(count, speed, health = 1) {
  return Array.from({ length: count }, (_, id) => {
    const angle = randBetween(0, Math.PI * 2);
    return {
      id,
      x: randBetween(ROOM_BOUNDS.left + 18, ROOM_BOUNDS.right - 18),
      y: randBetween(ROOM_BOUNDS.top + 18, ROOM_BOUNDS.bottom - 18),
      radius: 13,
      health,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  });
}

// Config is the editable student-facing data; game state is a fresh runtime
// snapshot created from that data each time the player applies variables.
export function createInitialGameState(config) {
  return {
    player: {
      x: CANVAS_WIDTH / 2,
      y: (ROOM_BOUNDS.top + ROOM_BOUNDS.bottom) / 2,
      radius: 15,
      health: config.playerHealth,
      invincibleUntil: 0,
      shieldUsed: false,
      facing: "down",
      moving: false,
    },
    enemies: createEnemies(config.enemyCount, config.enemySpeed, config.enemyHealth),
    coins: createCoins(config.coinCount),
    score: 0,
    elapsed: 0,
    attack: {
      activeUntil: 0,
      cooldownUntil: 0,
      direction: "down",
    },
    running: true,
    gameOver: false,
    win: false,
  };
}
