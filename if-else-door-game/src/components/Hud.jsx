function StatPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-mono text-lg font-black text-slate-100">{value}</div>
    </div>
  );
}

export function Hud({ stats }) {
  return (
    <header className="rounded-3xl border border-red-500/30 bg-black/70 p-5 shadow-2xl shadow-red-950/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 text-sm font-bold text-red-100">
            Module 2 - Fixed-Screen If/Else Arena
          </div>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Keycard Logic Lab</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Change the condition, apply it, then play the room. The door tile is the exit tile:
            false blocks, true clears the screen.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatPill label="blue" value={stats.blueKeys} />
          <StatPill label="red" value={stats.redKeys} />
          <StatPill label="yellow" value={stats.yellowKeys} />
          <StatPill label="health" value={stats.health} />
          <StatPill label="coins" value={stats.coins} />
        </div>
      </div>
    </header>
  );
}
