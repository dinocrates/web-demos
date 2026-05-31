import { languageDefinitions } from "../data/languageDefinitions";
import { HighlightedCodeEditor } from "./HighlightedCodeEditor";
import { MiniButton } from "./MiniButton";

export function RuleEditor({
  appliedCode,
  code,
  language,
  onCodeChange,
  onApply,
  onLanguageChange,
  onResetCode,
  onUseLadderOrder,
  room,
}) {
  const languageInfo = languageDefinitions[language];

  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Room Rule</h2>
          <p className="text-xs text-slate-400">
            {languageInfo.fileName} - applied rule:{" "}
            <span className="font-mono text-amber-200">{appliedCode}</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {Object.entries(languageDefinitions).map(([key, definition]) => (
            <MiniButton key={key} active={key === language} onClick={() => onLanguageChange(key)}>
              {definition.label}
            </MiniButton>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        <HighlightedCodeEditor code={code} language={languageInfo.label} onCodeChange={onCodeChange} />

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-red-300 bg-red-500/20 px-3 py-2 text-sm font-black text-red-100 hover:bg-red-500/30"
            onClick={onApply}
          >
            Apply Rule
          </button>
          <MiniButton onClick={onResetCode}>Reset Code</MiniButton>
        </div>

        {room.mode === "ladder" && (
          <div className="grid grid-cols-2 gap-2">
            <MiniButton onClick={() => onUseLadderOrder("gold")}>
              Correct order
            </MiniButton>
            <MiniButton onClick={() => onUseLadderOrder("silver")}>
              Buggy order
            </MiniButton>
          </div>
        )}
      </div>
    </section>
  );
}
