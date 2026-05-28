import { useState } from "react";
import { getLeaderboard } from "../../services/resultService";
import Loader from "../../components/common/Loader";

const MEDALS = ["🥇", "🥈", "🥉"];

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span style={{ fontSize: 22, lineHeight: 1 }}>{MEDALS[rank - 1]}</span>
    );
  }
  return (
    <span
      style={{
        width: 28, height: 28, borderRadius: 8,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
        color: "var(--text-3)",
      }}
    >
      {rank}
    </span>
  );
}

function ScoreBar({ pct }) {
  const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--accent)" : "var(--amber)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, color, minWidth: 36 }}>
        {pct}%
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const [quizId, setQuizId] = useState("");
  const [limit, setLimit] = useState(10);
  const [entries, setEntries] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!quizId.trim() || isNaN(Number(quizId))) {
      setError("Please enter a valid quiz ID.");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const res = await getLeaderboard(quizId, limit);
      setEntries(res.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setEntries([]);
      } else {
        setError("Failed to load leaderboard. Please try again.");
        setEntries(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const topThree = entries?.slice(0, 3) || [];
  const rest = entries?.slice(3) || [];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>
        Leaderboard
      </h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 32 }}>
        View top scores for any quiz by entering its ID
      </p>

      {/* Search form */}
      <div className="card" style={{ padding: 28, marginBottom: 28 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label className="input-label">Quiz ID</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 42"
              value={quizId}
              onChange={(e) => { setQuizId(e.target.value); setError(""); }}
            />
          </div>
          <div style={{ minWidth: 120 }}>
            <label className="input-label">Top N</label>
            <select
              className="input"
              style={{ cursor: "pointer" }}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>Top {n}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 42 }}>
            {loading ? <Loader size="sm" /> : "View Rankings"}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && entries?.length === 0 && (
        <div className="card" style={{ padding: 56, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏁</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            No results yet
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            No one has completed Quiz #{quizId} yet, or the quiz doesn't exist.
          </p>
        </div>
      )}

      {/* Initial prompt */}
      {!loading && !searched && (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
            Enter a Quiz ID to see rankings
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            Type a quiz ID above and click "View Rankings" to see who topped the charts.
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && entries && entries.length > 0 && (
        <>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>
              Quiz #{quizId} — Top {entries.length}
            </h2>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>
              {entries.length} participant{entries.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Podium for top 3 */}
          {topThree.length >= 2 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 12,
                marginBottom: 32,
                padding: "0 20px",
              }}
            >
              {/* Reorder: 2nd, 1st, 3rd */}
              {[topThree[1], topThree[0], topThree[2]]
                .filter(Boolean)
                .map((entry, podiumIdx) => {
                  const realRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
                  const heights = { 1: 120, 2: 90, 3: 70 };
                  const h = heights[realRank];
                  const colors = {
                    1: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", text: "var(--amber)" },
                    2: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", text: "#94a3b8" },
                    3: { bg: "rgba(180,120,80,0.1)", border: "rgba(180,120,80,0.3)", text: "#b47850" },
                  };
                  const c = colors[realRank];
                  return (
                    <div
                      key={entry.rank}
                      style={{
                        flex: 1, maxWidth: 220,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: 28 }}>{MEDALS[realRank - 1]}</div>
                      <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "Syne, sans-serif", fontWeight: 600 }}>
                        {entry.studentId?.slice(0, 8)}…
                      </div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, color: c.text }}>
                        {entry.score}/{entry.maxScore}
                      </div>
                      <div
                        style={{
                          width: "100%", height: h,
                          background: c.bg,
                          border: `1.5px solid ${c.border}`,
                          borderRadius: "10px 10px 0 0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28,
                          color: c.text,
                        }}
                      >
                        #{realRank}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Full table */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Rank", "Student ID", "Score", "Percentage", "Submitted", "Method"].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: 11,
                          color: "var(--text-3)",
                          fontFamily: "Syne, sans-serif",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const pct = entry.percentage != null
                      ? Math.round(entry.percentage)
                      : entry.maxScore > 0
                      ? Math.round((entry.score / entry.maxScore) * 100)
                      : 0;
                    const isTop3 = entry.rank <= 3;
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: isTop3 ? "rgba(124,92,252,0.03)" : "transparent",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = isTop3 ? "rgba(124,92,252,0.03)" : "transparent"}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <RankBadge rank={entry.rank} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-2)" }}>
                            {entry.studentId?.slice(0, 13)}…
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>
                            {entry.score}
                            <span style={{ color: "var(--text-3)", fontWeight: 400, fontSize: 12 }}>
                              /{entry.maxScore}
                            </span>
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", minWidth: 160 }}>
                          <ScoreBar pct={pct} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                            {entry.submittedAt
                              ? new Date(entry.submittedAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span
                            className="badge"
                            style={{
                              fontSize: 10,
                              background: entry.submissionMethod === "AUTO" ? "rgba(245,158,11,0.12)" : "rgba(34,197,94,0.12)",
                              color: entry.submissionMethod === "AUTO" ? "var(--amber)" : "var(--green)",
                              border: `1px solid ${entry.submissionMethod === "AUTO" ? "rgba(245,158,11,0.3)" : "rgba(34,197,94,0.3)"}`,
                            }}
                          >
                            {entry.submissionMethod === "AUTO" ? "⏱ Auto" : "✅ Manual"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer stat */}
            {entries.length > 0 && (
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid var(--border)",
                  background: "var(--bg-2)",
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                }}
              >
                {[
                  { label: "Highest Score", value: `${entries[0]?.score}/${entries[0]?.maxScore}` },
                  {
                    label: "Average %",
                    value: `${Math.round(entries.reduce((a, e) => a + (e.percentage ?? 0), 0) / entries.length)}%`,
                  },
                  {
                    label: "Auto-submitted",
                    value: `${entries.filter((e) => e.submissionMethod === "AUTO").length}`,
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}