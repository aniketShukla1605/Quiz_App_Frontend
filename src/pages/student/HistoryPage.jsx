import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyHistory, syncMyResults } from "../../services/resultService";
import { Skeleton } from "../../components/common/Loader";
import { EmptyState, ErrorState } from "../../components/common/States";
import Icon from "../../components/common/Icon";
import { explain } from "../../utils/errors";

const tone = (p) => (p >= 75 ? "badge-green" : p >= 50 ? "badge-accent" : "badge-red");

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const load = useCallback((fn = getMyHistory) => {
    setStatus("loading");
    return fn()
      .then((r) => { setHistory(r.data || []); setStatus("ready"); })
      .catch((e) => { setError(explain(e, "load your history")); setStatus("error"); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const sync = async () => { setSyncing(true); await load(syncMyResults); setSyncing(false); };

  return (
    <div>
      <div className="flex justify-between items-center mb-8" style={{ gap: "var(--s4)" }}>
        <div>
          <h1 style={{ fontSize: 40 }}>Your attempts</h1>
          {status === "ready" && <p style={{ color: "var(--text-2)" }}>{history.length} {history.length === 1 ? "quiz" : "quizzes"} completed</p>}
        </div>
        <button className="btn btn-ghost" onClick={sync} disabled={syncing || status === "loading"}>
          <Icon name="refresh" size={16} style={syncing ? { animation: "spin .7s linear infinite" } : undefined} />Refresh
        </button>
      </div>

      {status === "loading" && <Skeleton count={5} h={64} />}
      {status === "error" && <ErrorState message={error} onRetry={() => load()} />}
      {status === "ready" && history.length === 0 && (
        <EmptyState icon="target" title="No quizzes taken yet"
          body="Ask your teacher for a quiz ID, enter it on the Take a quiz page, and your first score will show up here."
          action={<Link to="/student/quizzes" className="btn btn-primary">Enter a quiz ID</Link>} />
      )}
      {status === "ready" && history.length > 0 && (
        <ul style={{ listStyle: "none" }}>
          {history.map((h, i) => {
            const pct = Math.round(h.percentage ?? (h.maxScore ? (h.score / h.maxScore) * 100 : 0));
            return (
              <li key={h.id ?? h.attemptId ?? i} className="rise" style={{ "--i": Math.min(i, 6), display: "grid", gridTemplateColumns: "1fr auto auto", gap: "var(--s5)", alignItems: "center", padding: "var(--s4) 0", borderTop: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Quiz {h.quizId}</div>
                  <div style={{ fontSize: 14, color: "var(--text-3)" }}>
                    {h.submittedAt ? new Date(h.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not submitted"}
                    {h.submissionMethod === "AUTO" && " (auto-submitted when time ran out)"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20 }}>{h.score ?? 0}/{h.maxScore ?? 0}</div>
                  <span className={`badge ${tone(pct)}`}>{pct}%</span>
                </div>
                {h.attemptId ? <Link to={`/student/quiz/${h.quizId}/result`} className="btn btn-ghost btn-sm">Details</Link> : <span />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}