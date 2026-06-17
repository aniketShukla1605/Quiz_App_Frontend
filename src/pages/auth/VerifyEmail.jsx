import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerification } from "../../services/authService";
import Loader from "../../components/common/Loader";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data || "Email verified successfully!");
      })
      .catch((err) => {
        const code = err.response?.status;
        const msg = err.response?.data || "Verification failed.";
        setStatus(code === 410 ? "expired" : "error");
        setMessage(msg);
      });
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;
    setResending(true);
    setResendStatus("");
    try {
      const res = await resendVerification(resendEmail);
      setResendStatus(res.data || "If an account exists, a new link has been sent.");
    } catch {
      setResendStatus("Something went wrong. Please try again.");
    } finally {
      setResending(false);
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
      }}
    >
      <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp 0.4s ease" }}>
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

        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          {status === "loading" && (
            <>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
                <Loader size="lg" />
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
                Verifying your email…
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 14 }}>Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}><img src="/check.png" alt="Check" /></div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                Email verified!
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>{message}</p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                Sign in
              </Link>
            </>
          )}

          {(status === "error" || status === "expired") && (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {status === "expired" ? <img src="/time.png" alt="Expired" /> : <img src="/exclamation.png" alt="Warning" />}
              </div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                {status === "expired" ? "Link expired" : "Verification failed"}
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>{message}</p>

              <form onSubmit={handleResend} style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
                <div>
                  <label className="input-label">Email address</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={resending}>
                  {resending ? <Loader size="sm" /> : "Resend verification email"}
                </button>
              </form>

              {resendStatus && (
                <div
                  style={{
                    marginTop: 16, padding: "10px 14px",
                    background: "rgba(124,92,252,0.08)",
                    border: "1px solid rgba(124,92,252,0.25)",
                    borderRadius: 8, fontSize: 13, color: "var(--accent-2)",
                  }}
                >
                  {resendStatus}
                </div>
              )}
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13 }}>
            <Link to="/login" style={{ color: "var(--text-3)", textDecoration: "none" }}>← Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}