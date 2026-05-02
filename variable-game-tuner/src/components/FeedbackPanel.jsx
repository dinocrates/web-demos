import { RetroWindow } from "./RetroWindow";

export function FeedbackPanel({ status, errors, warnings }) {
  return (
    <RetroWindow title="Compiler-ish Feedback">
      <p className="retro-status-text">{status}</p>

      {errors.length > 0 && (
        <div className="retro-error-box mt-3">
          <p className="font-bold">Errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="retro-note-box mt-3">
          <p className="font-bold">Notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </RetroWindow>
  );
}
