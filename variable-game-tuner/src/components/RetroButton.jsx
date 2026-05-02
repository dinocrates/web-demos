export function RetroButton({ children, onClick, variant = "default", type = "button" }) {
  return (
    <button type={type} onClick={onClick} className={`retro-button retro-button--${variant}`}>
      {children}
    </button>
  );
}
