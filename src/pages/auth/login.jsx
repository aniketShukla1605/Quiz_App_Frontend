import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, googleLogin, resendVerification } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

export default function LoginPage() {
  const { login: ctxLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [note, setNote] = useState("");

  const finish = (d) => {
    ctxLogin({ role: d.role, email: d.email });
    navigate(d.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
  };

  const run = async (fn) => {
    setError(""); setNote(""); setUnverified(false); setLoading(true);
    try { finish((await fn()).data); }
    catch (e) {
      setUnverified(e.response?.status === 403);
      setError(e.response?.status === 401 ? "That email and password don't match. Check both and try again." : explain(e, "sign you in"));
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try { await resendVerification(form.email); setNote(`We sent a new link to ${form.email}. It expires in 24 hours.`); }
    catch (e) { setNote(explain(e, "send the link")); }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(320px,520px) 1fr" }}>
      <div style={{ padding: "var(--s7)", display: "grid", alignContent: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--text)", marginBottom: "var(--s8)" }}>
          <img src="/favicon.svg" alt="" width="28" height="28" /><b style={{ fontFamily: "var(--display)", fontSize: 20 }}>Quizzy</b>
        </Link>
        <h1 className="rise" style={{ fontSize: 44, marginBottom: "var(--s2)" }}>Welcome back</h1>
        <p className="rise" style={{ "--i": 1, color: "var(--text-2)", marginBottom: "var(--s6)" }}>Sign in to pick up where you left off.</p>

        {error && <div style={{ marginBottom: "var(--s4)" }}><ErrorState message={error} /></div>}
        {unverified && (
          <div style={{ marginBottom: "var(--s4)" }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={resend}>Send a new verification link</button>
            {note && <p style={{ fontSize: 14, color: "var(--text-2)", marginTop: "var(--s2)" }}>{note}</p>}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); run(() => login(form)); }} style={{ display: "grid", gap: "var(--s4)" }}>
          <div><label className="input-label" htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" placeholder="name@school.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><label className="input-label" htmlFor="pw">Password</label>
            <input id="pw" className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <Loader size="sm" /> : "Sign in"}</button>
        </form>

        <p style={{ margin: "var(--s5) 0", color: "var(--text-3)", fontSize: 14, textAlign: "center" }}>or</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin onSuccess={(c) => run(() => googleLogin({ idToken: c.credential }))} onError={() => setError("Google sign-in was cancelled or blocked. Try again, or use your email.")} shape="rectangular" size="large" width="320" />
        </div>
        <p style={{ marginTop: "var(--s6)", color: "var(--text-2)" }}>New here? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link></p>
      </div>
      {/* Add public/photos/login.jpg */}
      <img className="photo" src="/photos/login.jpg" alt="A teacher helping a student at a desk" style={{ height: "100vh", borderRadius: 0 }} />
    </main>
  );
}