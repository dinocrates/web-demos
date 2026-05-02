export function normalizeType(type, language) {
  if (language === "java") {
    if (type === "String") return "string";
    if (type === "boolean") return "bool";
  }

  if (type === "string") return "string";
  if (type === "bool") return "bool";
  if (type === "int") return "int";
  if (type === "double") return "double";
  if (type === "char") return "char";
  return null;
}
