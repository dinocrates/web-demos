import { useMemo, useState } from "react";

const typeWords = new Set(["int", "double", "string", "bool", "char", "String", "boolean"]);
const keywordWords = new Set(["public", "private", "protected", "class", "static"]);
const boolWords = new Set(["true", "false"]);
const variableNames = new Set([
  "playerName",
  "playerIcon",
  "playerHealth",
  "playerSpeed",
  "coinValue",
  "coinCount",
  "enemyCount",
  "enemySpeed",
  "enemyHealth",
  "swordEnabled",
  "swordDamage",
  "swordRange",
  "attackCooldown",
  "shieldEnabled",
]);

const tokenRegex = /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|-?\d+(?:\.\d+)?|\b[A-Za-z_][A-Za-z0-9_]*\b|[=;{}]/g;

function findCommentStart(line) {
  let quote = null;

  for (let index = 0; index < line.length - 1; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    const escaped = index > 0 && line[index - 1] === "\\";

    if ((char === "\"" || char === "'") && !escaped) {
      quote = quote === char ? null : quote || char;
    }

    if (!quote && char === "/" && next === "/") {
      return index;
    }
  }

  return -1;
}

function tokenClass(token) {
  if (token.startsWith("//")) return "text-slate-500 italic";
  if (token.startsWith("\"") || token.startsWith("'")) return "text-amber-300";
  if (typeWords.has(token)) return "text-cyan-300";
  if (keywordWords.has(token)) return "text-violet-300";
  if (boolWords.has(token)) return "text-rose-300";
  if (variableNames.has(token)) return "text-emerald-200";
  if (/^-?\d+(?:\.\d+)?$/.test(token)) return "text-yellow-200";
  if (/^[=;{}]$/.test(token)) return "text-slate-400";
  return "text-slate-100";
}

function highlightCodeSegment(segment, keyPrefix) {
  const pieces = [];
  let lastIndex = 0;

  for (const match of segment.matchAll(tokenRegex)) {
    const token = match[0];
    const index = match.index;

    if (index > lastIndex) {
      pieces.push(segment.slice(lastIndex, index));
    }

    pieces.push(
      <span key={`${keyPrefix}-${index}`} className={tokenClass(token)}>
        {token}
      </span>
    );
    lastIndex = index + token.length;
  }

  if (lastIndex < segment.length) {
    pieces.push(segment.slice(lastIndex));
  }

  return pieces;
}

function highlightLine(line, lineIndex) {
  const commentStart = findCommentStart(line);

  if (commentStart === -1) {
    return highlightCodeSegment(line, lineIndex);
  }

  return [
    ...highlightCodeSegment(line.slice(0, commentStart), lineIndex),
    <span key={`${lineIndex}-comment`} className="text-slate-500 italic">
      {line.slice(commentStart)}
    </span>,
  ];
}

function highlightCode(code) {
  return code.split("\n").map((line, index, lines) => (
    <span key={index}>
      {highlightLine(line, index)}
      {index < lines.length - 1 ? "\n" : null}
    </span>
  ));
}

export function HighlightedCodeEditor({ code, language, onCodeChange }) {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const highlightedCode = useMemo(() => highlightCode(code), [code]);

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-slate-700 bg-black">
      <pre
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-0 min-h-full whitespace-pre p-4 font-mono text-sm leading-6"
        style={{ transform: `translate(${-scroll.left}px, ${-scroll.top}px)` }}
      >
        <code>{highlightedCode}</code>
      </pre>
      <textarea
        value={code}
        wrap="off"
        onChange={(event) => onCodeChange(event.target.value)}
        onScroll={(event) => {
          setScroll({
            left: event.currentTarget.scrollLeft,
            top: event.currentTarget.scrollTop,
          });
        }}
        spellCheck="false"
        className="code-editor-input relative h-full w-full resize-none overflow-auto whitespace-pre bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-emerald-100 outline-none ring-cyan-300/0 transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-300/10"
        aria-label={`Editable ${language} variable declarations`}
      />
    </div>
  );
}
