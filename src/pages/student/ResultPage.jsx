import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { syncMyResults } from "../../services/resultService";
import Loader from "../../components/common/Loader";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

const grade = (p) =>
  p >= 90 ? ["Excellent", "You've got this topic down."]
  : p >= 75 ? ["Strong result", "A few gaps left to close."]
  : p >= 60 ? ["Pass", "Solid base. Review what you missed."]
  : p >= 40 ? ["Needs work", "Go back over the material and try a similar quiz."]
  : ["Keep going", "This one was tough. Ask your teacher where to start."];

// Counts up from 0 so the score feels earned; skipped if the user prefers reduced motion.
function useCountUp(target, ms = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setN(target);
    let raf, t0;
    const step = (t) => {
      t0 ??= t;
      const k = Math.min(1, (t - t0) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export default function ResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-result-${id}`);
    if (stored) {
      sessionStorage.removeItem(`quiz-result-${id}`);
      setResult(JSON.parse(stored)); setLoading(false); return;
    }
    syncMyResults()
      .then((r) => {
        const m = r.data?.find((h) => String(h.quizId) === String(id));
        m ? setResult(m) : setError("We can't find a result for this quiz yet. Results can take a few seconds to appear, so try again shortly.");
      })
      .catch((e) => setError(explain(e, "load your result")))
      .finally(() => setLoading(false));
  }, [id]);

  const pct = result?.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : Math.round(result?.percentage || 0);
  const shown = useCountUp(loading || error ? 0 : pct);
  const [label, advice] = grade(pct);
  const R = 70, C = 2 * Math.PI * R;
  const tone = pct >= 60 ? "var(--accent)" : "var(--amber)";

  if (loading) return <Loader fullPage />;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s6)" }}>Quiz {id} results</h1>

      {error ? (
        <>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
          <Link to="/student/history" className="btn btn-ghost" style={{ marginTop: "var(--s4)" }}>Open your history</Link>
        </>
      ) : (
        <>
          <section className="flex items-center gap-8 flex-wrap" style={{ paddingBottom: "var(--s7)", borderBottom: "1px solid var(--border)" }}>
            <div style={{ position: "relative", width: 168, height: 168, flexShrink: 0 }}>
              <svg width="168" height="168" viewBox="0 0 168 168" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
                <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
                <circle cx="84" cy="84" r={R} fill="none" stroke={tone} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C - (shown / 100) * C} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontFamily: "var(--display)", fontWeight: 800, fontSize: 44, letterSpacing: "-.04em" }}>{shown}%</div>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <h2 style={{ fontSize: 36, marginBottom: "var(--s2)" }}>{label}</h2>
              <p style={{ color: "var(--text-2)", fontSize: 18 }}>
                You answered {result?.score} of {result?.maxScore} questions correctly. {advice}
              </p>
            </div>
          </section>

          <dl style={{ margin: "var(--s6) 0" }}>
            {[
              ["Score", `${result?.score} / ${result?.maxScore}`],
              ["Submitted", result?.submittedAt ? new Date(result.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not recorded"],
              ["How it ended", result?.submissionMethod === "AUTO" ? "Auto-submitted when time ran out" : "You submitted it"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between" style={{ padding: "var(--s3) 0", borderBottom: "1px solid var(--border)" }}>
                <dt style={{ color: "var(--text-2)" }}>{k}</dt><dd style={{ fontWeight: 600 }}>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex gap-3 flex-wrap">
            <Link to="/student/quizzes" className="btn btn-primary btn-lg">Take another quiz</Link>
            <Link to="/student/history" className="btn btn-ghost btn-lg">See all attempts</Link>
          </div>
        </>
      )}
    </div>
  );
}