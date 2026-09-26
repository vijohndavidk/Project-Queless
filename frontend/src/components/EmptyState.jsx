export default function EmptyState({ title = "Nothing here yet", hint }) {
  return (
    <div className="empty-state">
      <p style={{ fontWeight: 600, color: "var(--color-text)" }}>{title}</p>
      {hint && <p>{hint}</p>}
    </div>
  );
}
