import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const actions = [
  { icon: "⚡", label: "Create Quiz", desc: "Generate a quiz from existing questions", href: "/teacher/create-quiz", color: "var(--accent)" },
  { icon: "🛠", label: "Custom Quiz", desc: "Build a quiz with your own questions", href: "/teacher/create-custom", color: "var(--cyan)" },
  { icon: "📚", label: "Question Bank", desc: "Browse and add questions", href: "/teacher/questions", color: "var(--amber)" },
  { icon: "🏆", label: "Leaderboard", desc: "View quiz rankings and scores", href: "/teacher/leaderboard", color: "var(--green)" },
];

const tips = [
  "Share quiz IDs with your students so they can join.",
  "Use the Question Bank to add questions before creating quizzes.",
  "Custom quizzes let you pick specific questions and set a duration.",
  "Leaderboards show top scores per quiz — great for classroom motivation!",
];

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 4 }}>{greeting} 👋</p>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em" }}>
            {profile?.displayName || "Teacher"}
          </h1>
        </div>
        <Link to="/teacher/create-quiz" className="btn btn-primary">+ Create Quiz</Link>
      </div>

      {/* Quick action grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {actions.map((a, i) => (
          <Link
            key={a.href}
            to={a.href}
            className="card card-interactive"
            style={{
              padding: 28, textDecoration: "none", display: "block",
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
              borderTop: `3px solid ${a.color}`,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>{a.icon}</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{a.label}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>{a.desc}</div>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 18 }}>💡 Teacher Tips</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}