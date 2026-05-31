import { operators, variableOptions } from "../data/rooms.js";

const conditionPattern = /\b(?:else\s+)?if\s*\(\s*([A-Za-z_][A-Za-z0-9_]*)\s*(==|!=|>=|<=|>|<)\s*(-?\d+)\s*\)/g;
const actionPattern = /\b(openGoldDoor|openSilverDoor|openBronzeDoor)\s*\(\s*\)\s*;/g;

function stripComments(code) {
  return code
    .split("\n")
    .map((line) => {
      const commentStart = line.indexOf("//");
      return commentStart === -1 ? line : line.slice(0, commentStart);
    })
    .join("\n");
}

function parseConditions(code) {
  return [...code.matchAll(conditionPattern)].map((match) => ({
    variable: match[1],
    operator: match[2],
    value: Number(match[3]),
  }));
}

function parseRewardActions(code) {
  return [...code.matchAll(actionPattern)].map((match) => match[1]);
}

function validateDoorCondition(condition) {
  const errors = [];

  if (!condition) {
    errors.push("Could not find an if condition like if (blueKeys >= 1).");
    return errors;
  }

  if (!variableOptions.includes(condition.variable)) {
    errors.push(`${condition.variable} is not a stat this room can read.`);
  }

  if (!operators.includes(condition.operator)) {
    errors.push(`${condition.operator} is not a supported comparison operator.`);
  }

  if (!Number.isFinite(condition.value)) {
    errors.push("The comparison value must be a number.");
  }

  return errors;
}

function parseDoorRule(cleanCode) {
  const conditions = parseConditions(cleanCode);
  const rule = conditions[0];
  const errors = validateDoorCondition(rule);
  const warnings = [];

  if (conditions.length > 1) {
    warnings.push("Only the first if condition controls this door room.");
  }

  return { errors, warnings, rule };
}

function parseLadderRule(cleanCode) {
  const conditions = parseConditions(cleanCode);
  const actions = parseRewardActions(cleanCode);
  const errors = [];
  const warnings = [];

  if (conditions.length < 2) {
    errors.push("Reward rooms need an if condition and an else-if condition.");
  }

  if (actions.length < 2) {
    errors.push("Could not find both reward actions: openGoldDoor(); and openSilverDoor();.");
  }

  const branchData = conditions.slice(0, 2).map((condition, index) => {
    const action = actions[index];
    const name = action === "openGoldDoor" ? "gold" : action === "openSilverDoor" ? "silver" : null;
    return { condition, name };
  });

  for (const { condition, name } of branchData) {
    if (!condition) continue;
    if (condition.variable !== "coins") {
      errors.push("Reward ladder conditions should compare coins.");
    }
    if (condition.operator !== ">=") {
      warnings.push("The reward ladder is designed around >= thresholds.");
    }
    if (!name) {
      errors.push("Only openGoldDoor(); and openSilverDoor(); should appear before the final else.");
    }
  }

  if (branchData[0]?.name && branchData[1]?.name && branchData[0].name === branchData[1].name) {
    errors.push("Gold and silver must each appear exactly once before the final else.");
  }

  const ladder = {
    first: branchData[0]?.name ?? "gold",
    second: branchData[1]?.name ?? "silver",
    gold: branchData.find((branch) => branch.name === "gold")?.condition.value ?? 3,
    silver: branchData.find((branch) => branch.name === "silver")?.condition.value ?? 2,
  };

  return { errors, warnings, ladder };
}

export function parseRuleCode(code, room) {
  const cleanCode = stripComments(code);
  if (room.mode === "ladder") return parseLadderRule(cleanCode);
  return parseDoorRule(cleanCode);
}
