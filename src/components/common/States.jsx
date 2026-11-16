import Icon from "./Icon";

export function EmptyState({ icon = "inbox", title, body, action }) {
  return (
    <div style={{ padding: "var(--s8) 0", display: "grid", gap: "var(--s3)", justifyItems: "start", maxWidth: 440 }}>
      <span style={{ color: "var(--accent)" }}><Icon name={icon} size={32} /></span>
      <h2 style={{ fontSize: 24 }}>{title}</h2>
      <p style={{ color: "var(--text-2)" }}>{body}</p>
      {action}
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" style={{ padding: "var(--s5)", border: "1px solid var(--red)", borderRadius: "var(--radius)", display: "flex", gap: "var(--s4)", alignItems: "flex-start" }}>
      <span style={{ color: "var(--red)", marginTop: 2 }}><Icon name="alert" /></span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600 }}>{message}</p>
        {onRetry && <button className="btn btn-ghost btn-sm" style={{ marginTop: "var(--s3)" }} onClick={onRetry}><Icon name="refresh" size={14} />Try again</button>}
      </div>
    </div>
  );
}