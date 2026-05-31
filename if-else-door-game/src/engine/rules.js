export function compare(left, operator, right) {
  switch (operator) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">":
      return left > right;
    case ">=":
      return left >= right;
    case "<":
      return left < right;
    case "<=":
      return left <= right;
    default:
      return false;
  }
}

export function evaluateDoorRule(rule, stats) {
  const left = Number(stats[rule.variable] ?? 0);
  const right = Number(rule.value);
  const result = compare(left, rule.operator, right);
  return {
    result,
    expression: `${rule.variable} ${rule.operator} ${right}`,
    substituted: `${left} ${rule.operator} ${right}`,
    branch: result ? "if" : "else",
  };
}

export function ladderBranchData(ladder, name) {
  if (name === "gold") {
    return {
      name: "gold",
      door: "G",
      action: "openGoldDoor();",
      condition: `coins >= ${ladder.gold}`,
    };
  }

  return {
    name: "silver",
    door: "S",
    action: "openSilverDoor();",
    condition: `coins >= ${ladder.silver}`,
  };
}

export function evaluateLadder(ladder, stats) {
  const coins = Number(stats.coins ?? 0);
  const first = ladderBranchData(ladder, ladder.first);
  const second = ladderBranchData(ladder, ladder.second);

  if (coins >= Number(ladder[first.name])) {
    return {
      result: true,
      door: first.door,
      branch: first.name,
      expression: first.condition,
      substituted: `${coins} >= ${ladder[first.name]}`,
      action: first.action,
    };
  }

  if (coins >= Number(ladder[second.name])) {
    return {
      result: true,
      door: second.door,
      branch: second.name,
      expression: second.condition,
      substituted: `${coins} >= ${ladder[second.name]}`,
      action: second.action,
    };
  }

  return {
    result: true,
    door: "N",
    branch: "bronze / else",
    expression: "else",
    substituted: "no earlier condition was true",
    action: "openBronzeDoor();",
  };
}
