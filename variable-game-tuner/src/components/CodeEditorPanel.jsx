import { FeedbackPanel } from "./FeedbackPanel";
import { HighlightedCodeEditor } from "./HighlightedCodeEditor";

export function CodeEditorPanel({
  code,
  errors,
  fileName,
  language,
  onApply,
  onCodeChange,
  onResetCode,
  status,
  warnings,
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
      <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">Code Window</h2>
          <p className="text-sm text-slate-400">Editing: {fileName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onApply} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-300">
            Apply Variables
          </button>
          <button onClick={onResetCode} className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-100 hover:bg-slate-700">
            Reset Code
          </button>
        </div>
      </div>

      <HighlightedCodeEditor
        code={code}
        language={language}
        onCodeChange={onCodeChange}
      />

      <FeedbackPanel status={status} errors={errors} warnings={warnings} />
    </section>
  );
}
