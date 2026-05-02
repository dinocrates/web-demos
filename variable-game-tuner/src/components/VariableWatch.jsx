export function VariableWatch({ config }) {
  const variableRows = Object.entries(config).map(([key, value]) => ({
    key,
    value: typeof value === "boolean" ? String(value) : value,
  }));

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
      <h2 className="text-xl font-bold">Variable Watch</h2>
      <p className="mt-1 text-sm text-slate-400">These are the values currently stored by the game.</p>
      <div className="mt-4 space-y-2">
        {variableRows.map((row) => (
          <div key={row.key} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm">
            <span className="text-cyan-200">{row.key}</span>
            <span className="text-emerald-200">{String(row.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
