export function clamp(value, min, max) {
  if (min !== null && value < min) return min;
  if (max !== null && value > max) return max;
  return value;
}

export function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function getAttackHitbox(player, config, direction) {
  const range = config.swordRange;
  const width = 28;

  if (direction === "up") {
    return { x: player.x - width / 2, y: player.y - player.radius - range, width, height: range };
  }
  if (direction === "down") {
    return { x: player.x - width / 2, y: player.y + player.radius, width, height: range };
  }
  if (direction === "left") {
    return { x: player.x - player.radius - range, y: player.y - width / 2, width: range, height: width };
  }
  return { x: player.x + player.radius, y: player.y - width / 2, width: range, height: width };
}

export function circleIntersectsRect(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}
