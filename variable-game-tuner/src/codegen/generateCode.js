import { variableComments } from "./codeComments";
import { languageDefinitions } from "../data/languageDefinitions";

const variableGroups = [
  ["playerName", "playerIcon"],
  ["playerHealth", "playerSpeed"],
  ["coinValue", "coinCount", "winCondition"],
  ["enemyCount", "enemySpeed", "enemyHealth"],
  ["swordEnabled", "swordDamage", "swordRange", "attackCooldown"],
  ["shieldEnabled"],
];

const variableTypes = {
  playerName: "string",
  playerIcon: "char",
  playerHealth: "int",
  playerSpeed: "double",
  coinValue: "int",
  coinCount: "int",
  winCondition: "int",
  enemyCount: "int",
  enemySpeed: "double",
  enemyHealth: "int",
  swordEnabled: "bool",
  swordDamage: "int",
  swordRange: "double",
  attackCooldown: "double",
  shieldEnabled: "bool",
};

function formatValue(value, type, languageDefinition) {
  if (type === "string") return `"${value}"`;
  if (type === "char") return `'${value || "@"}'`;
  if (type === "bool") return value ? languageDefinition.trueValue : languageDefinition.falseValue;
  if (type === "double") return Number(value).toFixed(1);
  return String(value);
}

function generateDeclaration(config, languageDefinition, variableName, language) {
  const type = variableTypes[variableName];
  const keyword = language === "java" ? "    static " : "";
  const indent = language === "java" ? "    " : "";
  const line = `${keyword}${languageDefinition[type]} ${variableName} = ${formatValue(config[variableName], type, languageDefinition)};`;

  return `${indent}// ${variableComments[variableName]}\n${line}`;
}

function generateDeclarations(config, languageDefinition, language) {
  return variableGroups
    .map((group) => group.map((variableName) => generateDeclaration(config, languageDefinition, variableName, language)).join("\n"))
    .join("\n\n");
}

export function generateCode(config, language) {
  const t = languageDefinitions[language];
  const declarations = generateDeclarations(config, t, language);

  if (language === "java") {
    return `// ${t.fileName}
// This is not the whole game.
// Java does not use C++-style header files, so this version uses a small class.
// Imagine the larger game engine reads these static fields.
// Change the values below, then click Apply Variables.

public class GameVariables {
${declarations}
}`;
  }

  return `// ${t.fileName}
// This is not the whole game.
// Imagine this file is included by the larger game engine.
// Change the values below, then click Apply Variables.

${declarations}`;
}
