import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail, resendVerification } from "../../services/authService";
import Loader from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { explain } from "../../utils/errors";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "" : "This link is missing its verification code. Open the link from your email again, or request a new one.");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((e) => {
        setStatus(e.response?.status === 410 ? "expired" : "error");
        setMessage(e.response?.status === 410 ? "This link has expired. Links work for 24 hours." : explain(e, "verify your email"));
      });
  }, [token]);

  const resend = async (e) => {
    e.preventDefault(); setSending(true); setNote("");
    try { await resendVerification(email); setNote(`If ${email} has an unverified account, a new link is on its way.`); }
    catch (err) { setNote(explain(err, "send a new link")); }
    finally { setSending(false); }
  };

  const view = {
    loading: [null, "Verifying your email", "This takes a second."],
    success: ["check", "Email verified", "Your account is active. You can sign in now."],
    expired: ["clock", "That link has expired", message],
    error: ["alert", "We couldn't verify your email", message],
  }[status];

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "var(--s5)" }}>
      <div className="rise" style={{ width: "100%", maxWidth: 440 }}>
        <Link to="/" className="flex items-center gap-2" style={{ color: "var(--text)", marginBottom: "var(--s7)" }}>
          <img src="/favicon.svg" alt="" width="28" height="28" /><b style={{ fontFamily: "var(--display)", fontSize: 20 }}>Quizzy</b>
        </Link>
        <div role="status" aria-live="polite">
          <span style={{ color: status === "success" ? "var(--green)" : status === "loading" ? "var(--accent)" : "var(--amber)" }}>{view[0] ? <Icon name={view[0]} size={36} /> : <Loader size="lg" />}</span>
          <h1 style={{ fontSize: 36, margin: "var(--s3) 0" }}>{view[1]}</h1>
          <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>{view[2]}</p>
        </div>
        {status === "success" && <Link to="/login" className="btn btn-primary btn-lg">Sign in</Link>}
        {(status === "error" || status === "expired") && (
          <form onSubmit={resend} style={{ display: "grid", gap: "var(--s4)" }}>
            <div><label className="input-label" htmlFor="re">Email address</label><input id="re" className="input" type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <button className="btn btn-primary" disabled={sending}>{sending ? <Loader size="sm" /> : "Send a new link"}</button>
            {note && <p role="status" style={{ fontSize: 14, color: "var(--text-2)" }}>{note}</p>}
          </form>
        )}
        <p style={{ marginTop: "var(--s6)" }}><Link to="/login" style={{ color: "var(--text-2)" }}>Back to sign in</Link></p>
      </div>
    </main>
  );
}