export function ChallengePanel({ challenges }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl">
      <h2 className="text-xl font-bold">Try This</h2>
      <p className="mt-1 text-sm text-slate-400">Change one variable, predict the effect, then apply and test.</p>
      <div className="mt-4 space-y-3">
        {challenges.map((challenge, index) => (
          <div key={index} className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
            <span className="mr-2 font-bold text-cyan-300">{index + 1}.</span>
            {challenge}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-950/30 p-3 text-sm text-cyan-50">
        <p className="font-bold">Teaching note</p>
        <p className="mt-1">A variable gives a value a name. The game engine uses those names later to decide how the game behaves.</p>
      </div>
    </div>
  );
}
