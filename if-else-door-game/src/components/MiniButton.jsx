export function MiniButton({ children, onClick, active = false, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-bold transition ${
        active
          ? "border-red-300 bg-red-500/20 text-red-100"
          : "border-slate-600 bg-slate-950 text-slate-200 hover:bg-slate-800"
      } ${className}`}
    >
      {children}
    </button>
  );
}
