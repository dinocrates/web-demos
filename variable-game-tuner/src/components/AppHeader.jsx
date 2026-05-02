export function AppHeader({ language, languages, onLanguageChange }) {
  return (
    <header className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">Variable Lab</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dungeon Dash: Variables Control the Game</h1>
          <p className="mt-2 max-w-3xl text-slate-300">
            Edit the variable declarations, apply them, and play the mini-game. The game engine is already written; this file only stores the values the engine uses.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950 p-2">
          <p className="mb-2 text-center text-xs uppercase tracking-wide text-slate-400">Declaration Style</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(languages).map((key) => (
              <button
                key={key}
                onClick={() => onLanguageChange(key)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  language === key
                    ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/40"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {languages[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
