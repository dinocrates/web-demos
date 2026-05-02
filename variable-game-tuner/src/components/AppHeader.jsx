import { RetroButton } from "./RetroButton";

export function AppHeader({ language, languages, onLanguageChange }) {
  return (
    <header className="retro-app-header">
      <div className="retro-titlebar">
        <div>
          <h1 className="retro-window-title">Dungeon Dash: Variables Control the Game</h1>
          <p className="retro-window-subtitle">Variable Lab</p>
        </div>
      </div>
      <div className="grid gap-4 p-3 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="max-w-3xl text-sm font-semibold leading-6 text-slate-800 md:text-base">
            Edit the variable declarations, apply them, and play the mini-game. The game engine is already written; this file only stores the values the engine uses.
          </p>
        </div>
        <div className="retro-segmented-control">
          <p className="retro-label">Declaration Style</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(languages).map((key) => (
              <RetroButton
                key={key}
                onClick={() => onLanguageChange(key)}
                variant={language === key ? "active" : "default"}
              >
                {languages[key].label}
              </RetroButton>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
