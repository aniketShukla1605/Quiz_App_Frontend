import { useState } from "react";
import { getLeaderboard } from "../../services/resultService";
import Loader, { Skeleton } from "../../components/common/Loader";
import { EmptyState, ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

const pctOf = (e) => Math.round(e.percentage ?? (e.maxScore > 0 ? (e.score / e.maxScore) * 100 : 0));

export default function Leaderboard() {
  const [title, setTitle] = useState("");
  const [limit, setLimit] = useState(10);
  const [entries, setEntries] = useState(null);
  const [asked, setAsked] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (e) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return setError("Enter a quiz title or ID to see its rankings.");
    setError(""); setLoading(true); setAsked(t);
    try { setEntries((await getLeaderboard(t, limit)).data || []); }
    catch (err) { if (err.response?.status === 404) setEntries([]); else { setError(explain(err, "load the rankings")); setEntries(null); } }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Rankings</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>Look up a quiz by its title or ID to see who scored highest.</p>

      <form onSubmit={search} noValidate className="flex gap-3 flex-wrap items-end" style={{ marginBottom: "var(--s6)" }}>
        <div style={{ flex: 1, minWidth: 200 }}><label className="input-label" htmlFor="lt">Quiz title or ID</label>
          <input id="lt" className="input" placeholder="Java basics, week 3" value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }} /></div>
        <div><label className="input-label" htmlFor="ln">Show</label>
          <select id="ln" className="input" value={limit} onChange={(e) => setLimit(Number(e.target.value))}>{[5, 10, 20, 50].map((n) => <option key={n} value={n}>Top {n}</option>)}</select></div>
        <button className="btn btn-primary" style={{ height: 46 }} disabled={loading}>{loading ? <Loader size="sm" /> : "Show rankings"}</button>
      </form>

      {error && <ErrorState message={error} />}
      {loading && <Skeleton count={5} h={60} />}
      {!loading && !error && entries === null && <EmptyState icon="trophy" title="Pick a quiz" body="Enter a title or ID above. Rankings sort by score, then by who finished first." />}
      {!loading && entries?.length === 0 && <EmptyState icon="inbox" title={`No results for "${asked}"`} body="Either nobody has submitted this quiz yet, or the title doesn't match. Check the spelling or try its ID." />}

      {!loading && entries?.length > 0 && (
        <>
          <div className="flex justify-between" style={{ marginBottom: "var(--s3)" }}>
            <h2 style={{ fontSize: 24 }}>{asked}</h2>
            <span style={{ color: "var(--text-3)" }}>{entries.length} {entries.length === 1 ? "student" : "students"}</span>
          </div>
          <ol style={{ listStyle: "none" }}>
            {entries.map((en, i) => {
              const p = pctOf(en), top = en.rank <= 3;
              return (
                <li key={i} className="rise" style={{ "--i": Math.min(i, 8), display: "grid", gridTemplateColumns: "56px 1fr 120px 110px", gap: "var(--s4)", alignItems: "center", padding: "var(--s4) 0", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: top ? 36 : 22, color: top ? "var(--accent)" : "var(--text-3)", letterSpacing: "-.04em" }}>{en.rank}</span>
                  <div><div style={{ fontWeight: 600 }}>{en.displayName || "Unknown student"}</div>
                    <div style={{ fontSize: 13, color: "var(--text-3)" }}>{en.submittedAt ? new Date(en.submittedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not recorded"}{en.submissionMethod === "AUTO" && " · auto-submitted"}</div></div>
                  <div className="progress-bar" aria-hidden="true"><div className="progress-fill" style={{ width: `${p}%`, transition: "width .8s var(--ease)" }} /></div>
                  <div style={{ textAlign: "right" }}><b>{en.score}/{en.maxScore}</b> <span style={{ color: "var(--text-3)" }}>{p}%</span></div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}