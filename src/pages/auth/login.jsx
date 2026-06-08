import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "../../services/authService";
import Loader from "../../components/common/Loader";

export default function LoginPage() {
  const { login: ctxLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await googleLogin({ idToken: credentialResponse.credential });
      ctxLogin({ role: res.data.role, email: res.data.email });
      if (res.data.role === "TEACHER") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data || "Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form);
      ctxLogin({ role: res.data.role, email: res.data.email });
      if (res.data.role === "TEACHER") navigate("/teacher/dashboard");
      else navigate("/student/dashboard");
    } catch (err) {
      setError(err.response?.data || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "10%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,252,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: 400, animation: "fadeUp 0.4s ease" }}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            style={{
              width: 40, height: 40,
              background: "var(--accent)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}
          >⚡</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.02em" }}>
            QuizApp
          </span>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Welcome back
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 28 }}>
            Sign in to continue your learning journey
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8, padding: "10px 14px",
                color: "var(--red)", fontSize: 13, marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ marginTop: 8, width: "100%" }}
              disabled={loading}
            >
              {loading ? <Loader size="sm" /> : "Sign In"}
            </button>

            <div style={{ margin: "16px 0", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>or</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed. Please try again.")}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="320"
              />
            </div>
          </form>


          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-2)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--accent-2)", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--text-3)" }}>
          <Link to="/" style={{ color: "var(--text-3)", textDecoration: "none" }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}