import Icon from "./Icon";
// Spinner for buttons/inline; use <Skeleton/> for content areas.
export default function Loader({ size = "md", fullPage = false }) {
  const px = { sm: 16, md: 24, lg: 36 }[size] ?? 24;
  const spin = (
    <svg width={px} height={px} viewBox="0 0 24 24" fill="none" role="status" aria-label="Loading"
      style={{ animation: "spin .7s linear infinite" }}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  if (!fullPage) return <span style={{ display: "inline-flex" }}>{spin}</span>;
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--accent)" }}>
      <div style={{ display: "grid", gap: "var(--s3)", justifyItems: "center", color: "var(--text-2)" }}>
        <span style={{ color: "var(--accent)" }}>{spin}</span>
        <span style={{ fontSize: 14 }}>Loading your workspace</span>
      </div>
    </div>
  );
}
export const Skeleton = ({ h = 56, count = 1 }) => (
  <div style={{ display: "grid", gap: "var(--s3)" }} aria-busy="true">
    {Array.from({ length: count }, (_, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
  </div>
);