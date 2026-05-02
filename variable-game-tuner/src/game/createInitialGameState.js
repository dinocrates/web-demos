import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./constants";

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createCoins(count) {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: randBetween(35, CANVAS_WIDTH - 35),
    y: randBetween(55, CANVAS_HEIGHT - 35),
    radius: 8,
  }));
}

function createEnemies(count, speed, health = 1) {
  return Array.from({ length: count }, (_, id) => {
    const angle = randBetween(0, Math.PI * 2);
    return {
      id,
      x: randBetween(45, CANVAS_WIDTH - 45),
      y: randBetween(65, CANVAS_HEIGHT - 45),
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
      y: CANVAS_HEIGHT / 2,
      radius: 15,
      health: config.playerHealth,
      invincibleUntil: 0,
      shieldUsed: false,
      facing: "down",
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
