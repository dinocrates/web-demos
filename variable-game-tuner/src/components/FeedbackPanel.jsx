export function FeedbackPanel({ status, errors, warnings }) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950 p-4">
      <h3 className="font-bold text-slate-100">Compiler-ish Feedback</h3>
      <p className="mt-1 text-sm text-slate-300">{status}</p>

      {errors.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-950/40 p-3">
          <p className="font-bold text-red-200">Errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-100">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-950/30 p-3">
          <p className="font-bold text-amber-200">Notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-100">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
