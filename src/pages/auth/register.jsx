import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import Loader from "../../components/common/Loader";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "STUDENT" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg)", padding: 24, position: "relative", overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeUp 0.4s ease" }}>
        <div className="flex items-center justify-center gap-2 mb-8">
          <div style={{ width: 40, height: 40, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>QuizApp</span>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Create account</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 28 }}>Join and start your quiz journey</p>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="Min 8 chars with uppercase + number"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>Must contain uppercase, lowercase, and a number</p>
            </div>

            <div>
              <label className="input-label">I am a...</label>
              <div className="flex gap-3">
                {["STUDENT", "TEACHER"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    style={{
                      flex: 1, padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                      fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14,
                      border: `1.5px solid ${form.role === r ? "var(--accent)" : "var(--border)"}`,
                      background: form.role === r ? "rgba(124,92,252,0.1)" : "var(--bg-2)",
                      color: form.role === r ? "var(--accent-2)" : "var(--text-2)",
                      transition: "all 0.18s",
                    }}
                  >
                    {r === "STUDENT" ? "🎓 Student" : "👨‍🏫 Teacher"}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8, width: "100%" }} disabled={loading}>
              {loading ? <Loader size="sm" /> : "Create Account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-2)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent-2)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--text-3)" }}>
          <Link to="/" style={{ color: "var(--text-3)", textDecoration: "none" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}