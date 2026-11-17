import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyHistory, getMyScoreSummary } from "../../services/resultService";
import { Skeleton } from "../../components/common/Loader";
import { EmptyState, ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

const pctOf = (h) => Math.round(h.percentage ?? ((h.score ?? 0) / (h.maxScore || 1)) * 100);

function Trend({ data }) {
  if (data.length < 2) return <p style={{ color: "var(--text-2)" }}>Take at least two quizzes to see your trend.</p>;
  const W = 640, H = 160, pad = 16;
  const pts = data.map((d, i) => [pad + (i / (data.length - 1)) * (W - pad * 2), pad + (1 - d.y / 100) * (H - pad * 2)]);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label={`Scores over your last ${data.length} quizzes`}>
      {[0, 50, 100].map((v) => <line key={v} x1={pad} x2={W - pad} y1={pad + (1 - v / 100) * (H - pad * 2)} y2={pad + (1 - v / 100) * (H - pad * 2)} stroke="var(--border)" />)}
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" pathLength="1" strokeDasharray="1" style={{ animation: "draw 1s var(--ease) both" }} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill="var(--accent)"><title>{data[i].label}: {data[i].y}%</title></circle>)}
    </svg>
  );
}

export default function AnalyticsPage() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setStatus("loading");
    Promise.all([getMyHistory(), getMyScoreSummary()])
      .then(([h, s]) => { setHistory(h.data || []); setSummary(s.data); setStatus("ready"); })
      .catch((e) => { setError(explain(e, "load your progress")); setStatus("error"); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const bands = [["90–100%", 90, 101], ["75–89%", 75, 90], ["60–74%", 60, 75], ["40–59%", 40, 60], ["Under 40%", 0, 40]]
    .map(([label, lo, hi]) => [label, history.filter((h) => pctOf(h) >= lo && pctOf(h) < hi).length]);
  const streak = (() => { let s = 0; for (const h of history) { if (pctOf(h) >= 60) s++; else break; } return s; })();
  const auto = history.filter((h) => h.submissionMethod === "AUTO").length;
  const trend = [...history].reverse().slice(-10).map((h) => ({ label: `Quiz ${h.quizId}`, y: pctOf(h) }));

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Progress</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s7)" }}>How your scores are changing over time.</p>

      {status === "loading" && <Skeleton count={4} h={72} />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && history.length === 0 && (
        <EmptyState icon="chart" title="Nothing to chart yet" body="Finish a quiz and your trend, score spread and streak will appear here."
          action={<Link to="/student/quizzes" className="btn btn-primary">Take a quiz</Link>} />
      )}
      {status === "ready" && history.length > 0 && (
        <>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "var(--s6)", paddingBottom: "var(--s7)", borderBottom: "1px solid var(--border)" }}>
            {[["Quizzes taken", history.length], ["Average", `${Math.round(summary?.averagePercentage ?? 0)}%`], ["Best", `${Math.round(summary?.bestPercentage ?? 0)}%`], ["Passing streak", streak]].map(([k, v], i) => (
              <div key={k} className="rise" style={{ "--i": i }}><dd style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 40, letterSpacing: "-.04em", lineHeight: 1 }}>{v}</dd><dt style={{ fontSize: 14, color: "var(--text-2)", marginTop: "var(--s2)" }}>{k}</dt></div>
            ))}
          </dl>

          <section style={{ padding: "var(--s7) 0", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 24, marginBottom: "var(--s4)" }}>Last {trend.length} quizzes</h2>
            <Trend data={trend} />
          </section>

          <section style={{ padding: "var(--s7) 0", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 24, marginBottom: "var(--s4)" }}>Score spread</h2>
            {bands.map(([label, n]) => (
              <div key={label} className="flex items-center gap-4" style={{ padding: "var(--s2) 0" }}>
                <span style={{ width: 90, color: "var(--text-2)", fontSize: 14 }}>{label}</span>
                <div className="progress-bar" style={{ flex: 1 }}><div className="progress-fill" style={{ width: `${(n / history.length) * 100}%`, transition: "width .8s var(--ease)" }} /></div>
                <b style={{ width: 24, textAlign: "right" }}>{n}</b>
              </div>
            ))}
            <p style={{ color: "var(--text-2)", marginTop: "var(--s4)" }}>{auto === 0 ? "You've submitted every quiz yourself." : `${auto} of ${history.length} quizzes were auto-submitted because time ran out.`}</p>
          </section>

          <section style={{ paddingTop: "var(--s7)" }}>
            <h2 style={{ fontSize: 24, marginBottom: "var(--s4)" }}>Recent attempts</h2>
            {history.slice(0, 8).map((h, i) => (
              <div key={h.id ?? i} className="flex justify-between" style={{ padding: "var(--s3) 0", borderTop: "1px solid var(--border)" }}>
                <span><b>Quiz {h.quizId}</b> <span style={{ color: "var(--text-3)" }}>{h.submittedAt ? new Date(h.submittedAt).toLocaleDateString() : ""}</span></span>
                <span>{h.score}/{h.maxScore} <span className={`badge ${pctOf(h) >= 75 ? "badge-green" : pctOf(h) >= 50 ? "badge-accent" : "badge-red"}`}>{pctOf(h)}%</span></span>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}