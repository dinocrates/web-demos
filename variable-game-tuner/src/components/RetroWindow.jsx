export function RetroWindow({ actions, children, subtitle, title }) {
  return (
    <section className="retro-window">
      <div className="retro-titlebar">
        <div className="min-w-0">
          <h2 className="retro-window-title">{title}</h2>
          {subtitle ? <p className="retro-window-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="retro-window-actions">{actions}</div> : null}
      </div>
      <div className="retro-window-body">{children}</div>
    </section>
  );
}
