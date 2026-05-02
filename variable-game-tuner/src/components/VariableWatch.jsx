import { RetroWindow } from "./RetroWindow";

export function VariableWatch({ config }) {
  const variableRows = Object.entries(config).map(([key, value]) => ({
    key,
    value: typeof value === "boolean" ? String(value) : value,
  }));

  return (
    <RetroWindow title="Variable Watch" subtitle="Values currently stored by the game.">
      <div className="mt-4 space-y-2">
        {variableRows.map((row) => (
          <div key={row.key} className="retro-watch-row">
            <span className="text-sky-200">{row.key}</span>
            <span className="text-emerald-200">{String(row.value)}</span>
          </div>
        ))}
      </div>
    </RetroWindow>
  );
}
