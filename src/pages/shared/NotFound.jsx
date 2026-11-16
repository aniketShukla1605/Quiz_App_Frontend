import { Link, useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="wrap" style={{ minHeight: "100vh", display: "grid", alignContent: "center", gap: "var(--s5)" }}>
      <h1 className="rise" style={{ fontSize: "clamp(96px,22vw,260px)", fontWeight: 800, letterSpacing: "-.06em", lineHeight: .85, color: "var(--accent)" }}>404</h1>
      <div className="rise" style={{ "--i": 1, maxWidth: 480 }}>
        <h2 style={{ fontSize: 32, marginBottom: "var(--s3)" }}>This question has no answer.</h2>
        <p style={{ color: "var(--text-2)" }}>The page you asked for doesn't exist or has moved. Check the address, or head back to somewhere that does.</p>
      </div>
      <div className="rise" style={{ "--i": 2, display: "flex", gap: "var(--s3)" }}>
        <Link to="/" className="btn btn-primary"><Icon name="home" size={18} />Go to home</Link>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>Go back</button>
      </div>
    </main>
  );
}