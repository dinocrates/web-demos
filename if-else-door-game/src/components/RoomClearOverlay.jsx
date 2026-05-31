export function RoomClearOverlay({ complete, isFinalRoom, message, onContinue, onReplay, trace }) {
  if (!complete) return null;

  const resultLabel =
    trace?.kind === "ladder" ? trace.branch.toUpperCase() : trace?.branch === "if" ? "TRUE" : "ACCESS GRANTED";

  return (
    <div className="absolute inset-3 flex items-center justify-center rounded-2xl border border-emerald-300/60 bg-black/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-emerald-300/50 bg-slate-950/95 p-5 text-center shadow-2xl shadow-emerald-950/40">
        <div className="text-sm font-black uppercase tracking-[0.35em] text-emerald-200">
          {isFinalRoom ? "Module Clear" : "Room Clear"}
        </div>
        <div className="mt-3 text-3xl font-black text-white">{resultLabel}</div>
        {trace && (
          <div className="mx-auto mt-4 grid max-w-sm gap-2 text-left font-mono text-sm">
            <div className="rounded-xl border border-slate-700 bg-black p-3 text-amber-200">{trace.expression}</div>
            <div className="rounded-xl border border-slate-700 bg-black p-3 text-amber-200">{trace.substituted}</div>
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/10 p-3 text-emerald-100">
              {trace.branch} branch ran
            </div>
          </div>
        )}
        <p className="mt-4 text-sm text-slate-300">{message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {!isFinalRoom && (
            <button
              className="rounded-2xl border border-emerald-300 bg-emerald-500/20 px-5 py-3 font-black text-emerald-100 hover:bg-emerald-500/30"
              onClick={onContinue}
            >
              Continue: Space / Enter
            </button>
          )}
          <button
            className="rounded-2xl border border-slate-500 bg-slate-900 px-5 py-3 font-black text-slate-100 hover:bg-slate-800"
            onClick={onReplay}
          >
            Replay Room: R
          </button>
        </div>
      </div>
    </div>
  );
}
