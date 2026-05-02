export function parseValue(rawValue, expectedType, lineNumber) {
  const value = rawValue.trim();

  if (expectedType === "string") {
    const match = value.match(/^"(.*)"$/);
    if (!match) {
      return { error: `Line ${lineNumber}: strings need double quotes, like "Ada".` };
    }
    return { value: match[1].slice(0, 18) || "Player" };
  }

  if (expectedType === "char") {
    const match = value.match(/^'(.)'$/);
    if (!match) {
      return { error: `Line ${lineNumber}: chars need single quotes and exactly one character, like '@'.` };
    }
    return { value: match[1] };
  }

  if (expectedType === "bool") {
    if (value === "true") return { value: true };
    if (value === "false") return { value: false };
    return { error: `Line ${lineNumber}: bool/boolean values must be true or false.` };
  }

  if (expectedType === "int") {
    if (!/^-?\d+$/.test(value)) {
      return { error: `Line ${lineNumber}: int values must be whole numbers.` };
    }
    return { value: Number.parseInt(value, 10) };
  }

  if (expectedType === "double") {
    if (!/^-?\d+(\.\d+)?$/.test(value)) {
      return { error: `Line ${lineNumber}: double values must be numbers, like 4.0 or 2.5.` };
    }
    return { value: Number.parseFloat(value) };
  }

  return { error: `Line ${lineNumber}: unsupported value type.` };
}
