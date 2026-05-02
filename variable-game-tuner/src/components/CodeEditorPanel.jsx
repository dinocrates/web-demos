import { FeedbackPanel } from "./FeedbackPanel";
import { HighlightedCodeEditor } from "./HighlightedCodeEditor";
import { RetroButton } from "./RetroButton";
import { RetroWindow } from "./RetroWindow";

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
    <section className="space-y-4">
      <RetroWindow
        title={fileName}
        subtitle="Code Window"
        actions={
          <>
            <RetroButton onClick={onApply} variant="primary">Apply Variables</RetroButton>
            <RetroButton onClick={onResetCode}>Reset Code</RetroButton>
          </>
        }
      >
        <HighlightedCodeEditor
          code={code}
          language={language}
          onCodeChange={onCodeChange}
        />
      </RetroWindow>
      <FeedbackPanel status={status} errors={errors} warnings={warnings} />
    </section>
  );
}
