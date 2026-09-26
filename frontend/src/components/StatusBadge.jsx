export default function StatusBadge({ status }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return <span className={`badge badge-${status}`}>{label}</span>;
}
