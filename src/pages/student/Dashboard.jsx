import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyScoreSummary } from "../../services/resultService";
import { getHistory } from "../../services/profileService";

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyScoreSummary(), getHistory()])
      .then(([sRes, hRes]) => {
        setSummary(sRes.data);
        setHistory(hRes.data?.slice(0, 5) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 4 }}>{greeting} 👋</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em" }}>
            {profile?.displayName || "Student"}
          </h1>
        </div>
        <Link to="/student/quizzes" className="btn btn-primary">
          Take a Quiz →
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Quizzes Done" value={loading ? "—" : summary?.quizzesAttempted ?? 0} icon="📝" color="var(--accent)" />
        <StatCard label="Avg Score" value={loading ? "—" : `${summary?.averagePercentage ?? 0}%`} sub="across all attempts" icon="📊" color="var(--cyan)" />
        <StatCard label="Best Score" value={loading ? "—" : `${summary?.bestPercentage ?? 0}%`} sub="your highest" icon="🏆" color="var(--amber)" />
        <StatCard label="Total Points" value={loading ? "—" : `${summary?.totalScore ?? 0}/${summary?.totalMaxScore ?? 0}`} icon="⭐" color="var(--green)" />
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Browse Quizzes", desc: "Find and take quizzes", href: "/student/quizzes", icon: "🎯" },
          { label: "View History", desc: "All past attempts", href: "/student/history", icon: "📋" },
          { label: "Analytics", desc: "Your performance data", href: "/student/analytics", icon: "📈" },
          { label: "Profile", desc: "Update your info", href: "/profile", icon: "👤" },
        ].map((item) => (
          <Link key={item.href} to={item.href} className="card card-interactive" style={{ padding: 20, textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{item.desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent attempts */}
      <div className="card" style={{ padding: 24 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16 }}>Recent Attempts</h2>
          <Link to="/student/history" style={{ fontSize: 13, color: "var(--accent-2)", textDecoration: "none" }}>View all →</Link>
        </div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text-3)", fontSize: 14 }}>
            No quiz attempts yet. <Link to="/student/quizzes" style={{ color: "var(--accent-2)" }}>Take your first quiz →</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((h) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Quiz #{h.quizId}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{new Date(h.attemptedAt).toLocaleDateString()}</div>
                </div>
                <span className="badge badge-accent">{h.resultPercentage}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}