import { ladderBranchData } from "../engine/rules.js";

function indentBlock(code, spaces = 4) {
  const prefix = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function generateDoorRule(room, rule) {
  return `// ${room.title}
// Edit the condition, then click Apply Rule.
// The door runs the if branch only when the condition is true.

if (${rule.variable} ${rule.operator} ${rule.value}) {
    ${room.ifAction}
}
else {
    ${room.elseAction}
}`;
}

function generateLadderRule(room, ladder) {
  const first = ladderBranchData(ladder, ladder.first);
  const second = ladderBranchData(ladder, ladder.second);

  return `// ${room.title}
// In an else-if ladder, the first true branch wins.
// Try switching the order to create or fix the bug.

if (${first.condition}) {
    ${first.action}
}
else if (${second.condition}) {
    ${second.action}
}
else {
    openBronzeDoor();
}`;
}

export function generateRuleCode(room, language, rule, ladder) {
  const body = room.mode === "ladder" ? generateLadderRule(room, ladder) : generateDoorRule(room, rule);

  if (language === "java") {
    return `// RoomRule.java
// This is a tiny Java-style rule file for the logic lab.

public class RoomRule {
    public static void testRule() {
${indentBlock(body, 8)}
    }
}`;
  }

  return `// room_rule.cpp
// This is a tiny C++-style rule file for the logic lab.

${body}`;
}
