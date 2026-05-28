import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAttemptResult, syncMyResults } from "../../services/resultService";
import Loader from "../../components/common/Loader";

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Try session storage first (immediate result after submit)
    const stored = sessionStorage.getItem(`quiz-result-${id}`);
    if (stored) {
      const data = JSON.parse(stored);
      sessionStorage.removeItem(`quiz-result-${id}`);
      // this is SubmitResponse shape - adapt
      setResult({
        score: data.score,
        maxScore: data.maxScore,
        submittedAt: data.submittedAt,
        submissionMethod: data.submissionMethod,
        state: data.state,
        attemptId: data.attemptId,
      });
      setLoading(false);
      return;
    }
    // Otherwise fetch from results service
    syncMyResults()
      .then((res) => {
        const history = res.data;
        const match = history?.find((h) => String(h.quizId) === String(id));
        if (match) {
          setResult(match);
        } else {
          setError("Result not found. It may still be processing.");
        }
      })
      .catch(() => setError("Failed to load result."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage />;

  const pct = result?.maxScore > 0
    ? Math.round((result.score / result.maxScore) * 100)
    : result?.percentage || 0;

  const grade = pct >= 90 ? { label: "Excellent", color: "var(--green)", icon: "🏆" }
    : pct >= 75 ? { label: "Great", color: "var(--cyan)", icon: "🌟" }
    : pct >= 60 ? { label: "Good", color: "var(--accent-2)", icon: "👍" }
    : pct >= 40 ? { label: "Fair", color: "var(--amber)", icon: "📚" }
    : { label: "Keep Trying", color: "var(--red)", icon: "💪" };

  const circleR = 54;
  const circumference = 2 * Math.PI * circleR;
  const strokeDash = circumference - (pct / 100) * circumference;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Quiz Complete!
      </h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32, fontSize: 14 }}>
        Here's how you did on Quiz #{id}
      </p>

      {error ? (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <p style={{ color: "var(--text-2)", marginBottom: 20 }}>{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="btn btn-ghost">Retry</button>
            <Link to="/student/history" className="btn btn-primary">View History</Link>
          </div>
        </div>
      ) : (
        <>
          {/* Score card */}
          <div className="card" style={{ padding: 40, textAlign: "center", marginBottom: 20 }}>
            {/* Circle progress */}
            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 24px" }}>
              <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="70" cy="70" r={circleR} fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r={circleR} fill="none"
                  stroke={grade.color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDash}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease" }}
                />
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 28, }}>{grade.icon}</span>
                <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24, color: grade.color, lineHeight: 1 }}>
                  {pct}%
                </span>
              </div>
            </div>

            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, marginBottom: 4, color: grade.color }}>
              {result?.score} / {result?.maxScore}
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{grade.label}!</div>
            <p style={{ color: "var(--text-2)", fontSize: 14 }}>
              You answered {result?.score} out of {result?.maxScore} questions correctly.
            </p>
          </div>

          {/* Details */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Details</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                ["Score", `${result?.score} / ${result?.maxScore}`],
                ["Percentage", `${pct}%`],
                ["Submission", result?.submissionMethod === "AUTO" ? "⏱ Auto (time expired)" : "✅ Manual"],
                ["Submitted At", result?.submittedAt ? new Date(result.submittedAt).toLocaleString() : "—"],
                ["Status", result?.state || "GRADED"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "Syne, sans-serif" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/student/quizzes" className="btn btn-ghost btn-lg" style={{ flex: 1, textDecoration: "none" }}>Take Another Quiz</Link>
            <Link to="/student/history" className="btn btn-primary btn-lg" style={{ flex: 1, textDecoration: "none" }}>View History →</Link>
          </div>
        </>
      )}
    </div>
  );
}