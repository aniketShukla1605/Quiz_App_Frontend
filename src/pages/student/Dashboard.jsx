import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyScoreSummary } from "../../services/resultService";
import { getHistory } from "../../services/profileService";
import { Skeleton } from "../../components/common/Loader";
import { EmptyState, ErrorState } from "../../components/common/States";
import Icon from "../../components/common/Icon";
import { explain } from "../../utils/errors";

const greet = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setStatus("loading");
    Promise.all([getMyScoreSummary(), getHistory()])
      .then(([s, h]) => { setSummary(s.data); setHistory((h.data || []).slice(0, 5)); setStatus("ready"); })
      .catch((e) => { setError(explain(e, "load your overview")); setStatus("error"); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const stats = [
    ["Quizzes taken", summary?.quizzesAttempted ?? 0],
    ["Average score", `${Math.round(summary?.averagePercentage ?? 0)}%`],
    ["Best score", `${Math.round(summary?.bestPercentage ?? 0)}%`],
    ["Points earned", `${summary?.totalScore ?? 0} of ${summary?.totalMaxScore ?? 0}`],
  ];

  return (
    <div>
      <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginBottom: "var(--s7)" }}>
        <div>
          <p style={{ color: "var(--text-2)" }}>{greet()}</p>
          <h1 style={{ fontSize: 44 }}>{profile?.displayName || "there"}</h1>
        </div>
        <Link to="/student/quizzes" className="btn btn-primary btn-lg">Take a quiz <Icon name="arrow" size={18} /></Link>
      </div>

      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "loading" && <Skeleton count={4} h={56} />}

      {status === "ready" && (
        <>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "var(--s6)", paddingBottom: "var(--s7)", borderBottom: "1px solid var(--border)" }}>
            {stats.map(([k, v], i) => (
              <div key={k} className="rise" style={{ "--i": i }}>
                <dd style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 40, letterSpacing: "-.04em", lineHeight: 1 }}>{v}</dd>
                <dt style={{ color: "var(--text-2)", fontSize: 14, marginTop: "var(--s2)" }}>{k}</dt>
              </div>
            ))}
          </dl>

          <section style={{ marginTop: "var(--s7)" }}>
            <div className="flex justify-between items-center" style={{ marginBottom: "var(--s4)" }}>
              <h2 style={{ fontSize: 24 }}>Recent attempts</h2>
              {history.length > 0 && <Link to="/student/history" style={{ fontWeight: 600 }}>See all</Link>}
            </div>
            {history.length === 0 ? (
              <EmptyState icon="target" title="Your scores will show up here"
                body="Take your first quiz and this page will start tracking your average and best result."
                action={<Link to="/student/quizzes" className="btn btn-primary">Enter a quiz ID</Link>} />
            ) : (
              <ul style={{ listStyle: "none" }}>
                {history.map((h) => (
                  <li key={h.id} className="flex justify-between items-center" style={{ padding: "var(--s4) 0", borderTop: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Quiz {h.quizId}</div>
                      <div style={{ fontSize: 14, color: "var(--text-3)" }}>{new Date(h.attemptedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</div>
                    </div>
                    <span className="badge badge-accent">{h.resultPercentage}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}