import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg)", textAlign: "center", padding: 24 }}>
      <div style={{ fontSize: 80, marginBottom: 16, opacity: 0.3, fontFamily: "Syne, sans-serif", fontWeight: 800 }}>404</div>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 28, marginBottom: 12 }}>Page not found</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32, fontSize: 15 }}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn btn-primary">← Go Home</Link>
    </div>
  );
}