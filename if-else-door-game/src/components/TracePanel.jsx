export function TracePanel({ trace }) {
  return (
    <section className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl">
      <h2 className="text-xl font-black">Trace</h2>
      {trace ? (
        <div className="mt-3 grid gap-3">
          <div className="rounded-2xl border border-slate-700 bg-black p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">condition checked</div>
            <div className="mt-1 font-mono text-lg text-amber-200">{trace.expression}</div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-black p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">substitute value</div>
            <div className="mt-1 font-mono text-lg text-amber-200">{trace.substituted}</div>
          </div>
          <div className="rounded-2xl border border-emerald-300/40 bg-emerald-500/10 p-3">
            <div className="text-xs uppercase tracking-wide text-emerald-200">branch selected</div>
            <div className="mt-1 text-lg font-black text-emerald-100">
              {trace.kind === "ladder" ? trace.branch : `${trace.branch} branch`}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 rounded-2xl border border-slate-700 bg-black p-3 text-sm text-slate-400">
          Walk into an edge door to see the condition evaluate.
        </p>
      )}
    </section>
  );
}
