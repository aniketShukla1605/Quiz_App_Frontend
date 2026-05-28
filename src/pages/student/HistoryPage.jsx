import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyHistory, syncMyResults } from "../../services/resultService";
import Loader from "../../components/common/Loader";

function ScoreBadge({ pct }) {
  const cls = pct >= 75 ? "badge-green" : pct >= 50 ? "badge-accent" : "badge-red";
  return <span className={`badge ${cls}`}>{pct}%</span>;
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = () => {
    getMyHistory()
      .then((res) => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await syncMyResults();
      setHistory(res.data || []);
    } catch {} finally {
      setSyncing(false);
    }
  };

  const filtered = history.filter((h) => {
    if (filter === "all") return true;
    const pct = h.percentage ?? 0;
    if (filter === "pass") return pct >= 60;
    if (filter === "fail") return pct < 60;
    return true;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 2 }}>Quiz History</h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>{history.length} attempt{history.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button onClick={handleSync} className="btn btn-ghost" disabled={syncing}>
          {syncing ? <Loader size="sm" /> : "↻ Sync"}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        {["all", "pass", "fail"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="btn btn-ghost btn-sm"
            style={{
              background: filter === f ? "var(--accent)" : "transparent",
              color: filter === f ? "white" : "var(--text-2)",
              border: filter === f ? "none" : "1px solid var(--border)",
            }}
          >
            {f === "all" ? "All" : f === "pass" ? "≥60% Pass" : "<60% Fail"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 56, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No attempts yet</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24, fontSize: 14 }}>Take your first quiz to see your history here.</p>
          <Link to="/student/quizzes" className="btn btn-primary">Take a Quiz →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((h, i) => {
            const pct = h.percentage ?? Math.round((h.score / h.maxScore) * 100) ?? 0;
            return (
              <div
                key={h.id || h.attemptId || i}
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: pct >= 75 ? "rgba(34,197,94,0.12)" : pct >= 50 ? "rgba(124,92,252,0.12)" : "rgba(239,68,68,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 14,
                      color: pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--accent-2)" : "var(--red)",
                    }}
                  >
                    {pct >= 75 ? "🏆" : pct >= 50 ? "👍" : "📚"}
                  </div>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                      Quiz #{h.quizId}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {h.submittedAt ? new Date(h.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      {h.submissionMethod && (
                        <span style={{ marginLeft: 8, color: h.submissionMethod === "AUTO" ? "var(--amber)" : "var(--text-3)" }}>
                          · {h.submissionMethod === "AUTO" ? "⏱ Auto-submitted" : "✅ Manual"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>
                      {h.score ?? "—"} / {h.maxScore ?? "—"}
                    </div>
                    <ScoreBadge pct={pct} />
                  </div>
                  {h.attemptId && (
                    <Link
                      to={`/student/quiz/${h.quizId}/result`}
                      className="btn btn-ghost btn-sm"
                      style={{ textDecoration: "none" }}
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}