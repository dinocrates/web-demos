import { RetroWindow } from "./RetroWindow";

export function ChallengePanel({ challenges }) {
  return (
    <RetroWindow title="Try This" subtitle="Change one variable, predict the effect, then apply and test.">
      <div className="mt-4 space-y-3">
        {challenges.map((challenge, index) => (
          <div key={index} className="retro-list-item text-sm leading-5 text-slate-900">
            <span className="mr-2 font-black text-emerald-800">{index + 1}.</span>
            {challenge}
          </div>
        ))}
      </div>
      <div className="retro-inset-panel mt-4 text-sm leading-5 text-slate-900">
        <p className="font-bold">Teaching note</p>
        <p className="mt-1">A variable gives a value a name. The game engine uses those names later to decide how the game behaves.</p>
      </div>
    </RetroWindow>
  );
}
