import { useState, useEffect } from "react";
import { getMyHistory, getMyScoreSummary } from "../../services/resultService";
import Loader from "../../components/common/Loader";
import { Link } from "react-router-dom";

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12, minWidth: 36, color: "var(--text-2)" }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function LineChart({ data, color = "var(--accent)" }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-3)", fontSize: 13 }}>
      Not enough data yet
    </div>
  );

  const W = 480, H = 120, pad = 20;
  const maxV = Math.max(...data.map(d => d.y), 100);
  const pts = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
    y: pad + (1 - d.y / maxV) * (H - pad * 2),
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 120, overflow: "visible" }}>
      <defs>
        <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#area-grad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="var(--bg)" strokeWidth="2">
          <title>{data[i].label}: {data[i].y}%</title>
        </circle>
      ))}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyHistory(), getMyScoreSummary()])
      .then(([h, s]) => {
        setHistory(h.data || []);
        setSummary(s.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;

  const hasData = history.length > 0;

  // Performance over time (last 10)
  const last10 = [...history].reverse().slice(-10);
  const trendData = last10.map((h, i) => ({
    label: `Quiz #${h.quizId}`,
    y: h.percentage ?? Math.round(((h.score ?? 0) / (h.maxScore || 1)) * 100),
  }));

  // Score distribution buckets
  const buckets = { "90-100": 0, "75-89": 0, "60-74": 0, "40-59": 0, "0-39": 0 };
  history.forEach((h) => {
    const p = h.percentage ?? Math.round(((h.score ?? 0) / (h.maxScore || 1)) * 100);
    if (p >= 90) buckets["90-100"]++;
    else if (p >= 75) buckets["75-89"]++;
    else if (p >= 60) buckets["60-74"]++;
    else if (p >= 40) buckets["40-59"]++;
    else buckets["0-39"]++;
  });

  const avgPct = summary?.averagePercentage ?? 0;
  const streak = (() => {
    let s = 0;
    for (const h of history) {
      const p = h.percentage ?? 0;
      if (p >= 60) s++; else break;
    }
    return s;
  })();

  const submissionMethods = { MANUAL: 0, AUTO: 0 };
  history.forEach((h) => { if (h.submissionMethod) submissionMethods[h.submissionMethod]++; });

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>Analytics</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 32 }}>Your performance insights and trends</p>

      {!hasData ? (
        <div className="card" style={{ padding: 56, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 8 }}>No data yet</h2>
          <p style={{ color: "var(--text-2)", marginBottom: 24 }}>Complete some quizzes to see your analytics.</p>
          <Link to="/student/quizzes" className="btn btn-primary">Take a Quiz</Link>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Total Quizzes", value: history.length, icon: "📝", color: "var(--accent)" },
              { label: "Average Score", value: `${avgPct}%`, icon: "📊", color: "var(--cyan)" },
              { label: "Best Score", value: `${summary?.bestPercentage ?? 0}%`, icon: "🏆", color: "var(--amber)" },
              { label: "Pass Streak", value: `${streak} 🔥`, icon: "💪", color: "var(--green)" },
            ].map((s) => (
              <div key={s.label} className="stat-card" style={{ borderLeft: `3px solid ${s.color}` }}>
                <div className="flex justify-between items-center mb-1">
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</span>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text)" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Performance trend */}
          <div className="card" style={{ padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Performance Trend</h2>
            <LineChart data={trendData} />
            <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 8, textAlign: "center" }}>
              Last {last10.length} quiz attempts (oldest → newest)
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
            {/* Score distribution */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Score Distribution</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.entries(buckets).map(([range, count]) => {
                  const colors = { "90-100": "var(--green)", "75-89": "var(--cyan)", "60-74": "var(--accent-2)", "40-59": "var(--amber)", "0-39": "var(--red)" };
                  return (
                    <div key={range}>
                      <div className="flex justify-between mb-1">
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{range}%</span>
                        <span style={{ fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, color: colors[range] }}>{count}</span>
                      </div>
                      <MiniBar value={count} max={history.length} color={colors[range]} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submission methods + totals */}
            <div className="card" style={{ padding: 24 }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Submission Breakdown</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Manual Submit", count: submissionMethods.MANUAL, icon: "✅", color: "var(--green)" },
                  { label: "Auto-Submit (time up)", count: submissionMethods.AUTO, icon: "⏱", color: "var(--amber)" },
                ].map((m) => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{m.label}</div>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 20, color: m.color }}>{m.count}</div>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                      {history.length > 0 ? `${Math.round((m.count / history.length) * 100)}%` : "—"}
                    </span>
                  </div>
                ))}

                <div style={{ padding: "14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 4 }}>Total Points Earned</div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 24 }}>
                    {summary?.totalScore ?? 0}
                    <span style={{ fontSize: 14, color: "var(--text-3)", fontWeight: 400 }}> / {summary?.totalMaxScore ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent table */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Recent Attempts</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Quiz", "Score", "Percentage", "Method", "Date"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, color: "var(--text-3)", fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "1px solid var(--border)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 8).map((h, i) => {
                    const pct = h.percentage ?? Math.round(((h.score ?? 0) / (h.maxScore || 1)) * 100);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>#{h.quizId}</td>
                        <td style={{ padding: "10px 12px", fontSize: 13 }}>{h.score}/{h.maxScore}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span className={`badge ${pct >= 75 ? "badge-green" : pct >= 50 ? "badge-accent" : "badge-red"}`}>{pct}%</span>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: h.submissionMethod === "AUTO" ? "var(--amber)" : "var(--text-3)" }}>
                          {h.submissionMethod || "—"}
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--text-3)" }}>
                          {h.submittedAt ? new Date(h.submittedAt).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}