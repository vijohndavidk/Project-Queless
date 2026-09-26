export default function Loading({ label = "Loading..." }) {
  return (
    <div className="flex gap-8" style={{ alignItems: "center", padding: "24px 0" }}>
      <span className="loading-spinner" />
      <span className="text-muted">{label}</span>
    </div>
  );
}
