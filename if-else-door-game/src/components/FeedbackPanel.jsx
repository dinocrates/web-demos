export function FeedbackPanel({ errors, status, warnings }) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
      <h2 className="text-xl font-black">Compiler-ish Feedback</h2>
      <p className="mt-2 text-sm text-slate-300">{status}</p>

      {errors.length > 0 && (
        <div className="mt-3 rounded-2xl border border-red-300/50 bg-red-500/10 p-3 text-red-100">
          <p className="font-bold">Errors</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-300/50 bg-amber-300/10 p-3 text-amber-100">
          <p className="font-bold">Notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
