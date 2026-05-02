import { variableRules } from "../data/variableRules";
import { normalizeType } from "./normalizeType";
import { parseValue } from "./parseValue";

function clamp(value, min, max) {
  if (min !== null && value < min) return min;
  if (max !== null && value > max) return max;
  return value;
}

export function parseVariableFile(source, language, previousConfig) {
  const nextConfig = { ...previousConfig };
  const errors = [];
  const warnings = [];
  const seen = new Set();
  const allowedTypes = language === "java" ? "int|double|String|char|boolean" : "int|double|string|char|bool";
  const declarationRegex =
    language === "java"
      ? new RegExp(`^(?:public +|private +|protected +)?(?:static +)?(${allowedTypes}) +([A-Za-z_][A-Za-z0-9_]*) *= *(.+);$`)
      : new RegExp(`^(${allowedTypes}) +([A-Za-z_][A-Za-z0-9_]*) *= *(.+);$`);

  source.split("\n").forEach((originalLine, index) => {
    const lineNumber = index + 1;
    const line = originalLine.trim();

    if (!line || line.startsWith("//")) return;

    if (language === "java" && (line === "public class GameVariables {" || line === "class GameVariables {" || line === "}")) return;

    if (!line.endsWith(";")) {
      errors.push(`Line ${lineNumber}: this declaration needs a semicolon at the end.`);
      return;
    }

    const match = line.match(declarationRegex);
    if (!match) {
      const example = language === "java" ? "static int coinValue = 10;" : "int coinValue = 10;";
      errors.push(`Line ${lineNumber}: this tool only supports simple variable declarations like ${example}`);
      return;
    }

    const [, writtenType, variableName, rawValue] = match;
    const normalizedType = normalizeType(writtenType, language);
    const rule = variableRules[variableName];

    if (!rule) {
      errors.push(`Line ${lineNumber}: '${variableName}' is not one of the variables this game engine uses.`);
      return;
    }

    if (normalizedType !== rule.type) {
      const expectedType = language === "java" && rule.type === "string" ? "String" : language === "java" && rule.type === "bool" ? "boolean" : rule.type;
      errors.push(`Line ${lineNumber}: '${variableName}' should be declared as ${expectedType}, not ${writtenType}.`);
      return;
    }

    const parsed = parseValue(rawValue, rule.type, lineNumber);
    if (parsed.error) {
      errors.push(parsed.error);
      return;
    }

    let finalValue = parsed.value;
    if (typeof finalValue === "number") {
      const clamped = clamp(finalValue, rule.min, rule.max);
      if (clamped !== finalValue) {
        warnings.push(`Line ${lineNumber}: '${variableName}' was set to ${finalValue}, but the game limits it to ${clamped}.`);
        finalValue = clamped;
      }
    }

    nextConfig[variableName] = finalValue;
    seen.add(variableName);
  });

  Object.keys(variableRules).forEach((name) => {
    if (!seen.has(name)) {
      warnings.push(`'${name}' was not declared, so the game kept its previous value.`);
    }
  });

  return { config: nextConfig, errors, warnings };
}
