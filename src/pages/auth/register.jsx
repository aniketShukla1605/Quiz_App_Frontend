import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { register, googleLogin } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

const RULES = [
  ["At least 8 characters", (p) => p.length >= 8],
  ["One lowercase letter", (p) => /[a-z]/.test(p)],
  ["One uppercase letter", (p) => /[A-Z]/.test(p)],
  ["One number", (p) => /\d/.test(p)],
];
const ROLES = [["STUDENT", "Student", "I take quizzes"], ["TEACHER", "Teacher", "I set quizzes"]];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: ctxLogin } = useAuth();
  const [params] = useSearchParams();
  const initial = params.get("role") === "TEACHER" ? "TEACHER" : "STUDENT";
  const [form, setForm] = useState({ email: "", password: "", role: initial });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const ok = RULES.every(([, f]) => f(form.password));

  const submit = async (e) => {
    e.preventDefault();
    if (!ok) return setError("Your password doesn't meet all the requirements below yet.");
    setError(""); setLoading(true);
    try { await register(form); setSent(true); }
    catch (err) { setError(explain(err, "create your account")); }
    finally { setLoading(false); }
  };

  const google = async (c) => {
    setError(""); setLoading(true);
    try {
      const d = (await googleLogin({ idToken: c.credential, role: form.role })).data;
      ctxLogin({ role: d.role, email: d.email });
      navigate(d.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err) { setError(explain(err, "sign you up with Google")); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(320px,520px) 1fr" }}>
      <div style={{ padding: "var(--s7)", display: "grid", alignContent: "center" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--text)", marginBottom: "var(--s8)" }}>
          <img src="/favicon.svg" alt="" width="28" height="28" /><b style={{ fontFamily: "var(--display)", fontSize: 20 }}>Quizzy</b>
        </Link>

        {sent ? (
          <div className="rise">
            <span style={{ color: "var(--accent)" }}><Icon name="inbox" size={36} /></span>
            <h1 style={{ fontSize: 40, margin: "var(--s3) 0" }}>Check your email</h1>
            <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>
              We sent a verification link to <b style={{ color: "var(--text)" }}>{form.email}</b>. Open it to activate your account, then sign in. The link expires in 24 hours.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">Go to sign in</Link>
          </div>
        ) : (
          <>
            <h1 className="rise" style={{ fontSize: 44, marginBottom: "var(--s2)" }}>Create your account</h1>
            <p className="rise" style={{ "--i": 1, color: "var(--text-2)", marginBottom: "var(--s6)" }}>Free for teachers and students.</p>
            {error && <div style={{ marginBottom: "var(--s4)" }}><ErrorState message={error} /></div>}

            <form onSubmit={submit} style={{ display: "grid", gap: "var(--s5)" }}>
              <fieldset style={{ border: 0 }}>
                <legend className="input-label">I am a</legend>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s3)" }}>
                  {ROLES.map(([r, label, hint]) => (
                    <button key={r} type="button" aria-pressed={form.role === r} onClick={() => setForm({ ...form, role: r })}
                      className="option-btn" style={{ display: "block", ...(form.role === r ? { borderColor: "var(--accent)", background: "var(--accent-bg)" } : {}) }}>
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      <div style={{ fontSize: 13, color: "var(--text-2)" }}>{hint}</div>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div><label className="input-label" htmlFor="email">Email</label>
                <input id="email" className="input" type="email" autoComplete="email" placeholder="name@school.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
              <div><label className="input-label" htmlFor="pw">Password</label>
                <input id="pw" className="input" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s1) var(--s3)", marginTop: "var(--s3)" }}>
                  {RULES.map(([label, f]) => {
                    const pass = f(form.password);
                    return (
                      <li key={label} style={{ display: "flex", alignItems: "center", gap: "var(--s2)", fontSize: 13, color: pass ? "var(--green)" : "var(--text-3)", transition: "color .2s" }}>
                        <Icon name="check" size={14} style={{ opacity: pass ? 1 : .25, transition: "opacity .2s" }} />{label}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <Loader size="sm" /> : "Create account"}</button>
            </form>

            <p style={{ margin: "var(--s5) 0", color: "var(--text-3)", fontSize: 14, textAlign: "center" }}>or</p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin onSuccess={google} onError={() => setError("Google sign-up was cancelled or blocked. Try again, or use your email.")} shape="rectangular" size="large" width="320" text="signup_with" />
            </div>
            <p style={{ marginTop: "var(--s6)", color: "var(--text-2)" }}>Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link></p>
          </>
        )}
      </div>
      <img className="photo" src="/photos/register.jpg" alt="Students collaborating around a table" style={{ height: "100vh", borderRadius: 0 }} />
    </main>
  );
}