import { Link } from "react-router-dom";

const features = [
  { icon: "⚡", title: "Instant Quizzes", desc: "Create and deploy quizzes in seconds with our intuitive interface." },
  { icon: "📊", title: "Live Analytics", desc: "Track performance, scores, and trends with beautiful dashboards." },
  { icon: "🏆", title: "Leaderboards", desc: "Foster healthy competition with real-time rankings and scores." },
  { icon: "🔒", title: "Secure Auth", desc: "JWT-based authentication with refresh tokens and Google OAuth." },
  { icon: "⏱️", title: "Timed Quizzes", desc: "Set custom durations with auto-submission when time expires." },
  { icon: "🎯", title: "Smart Scoring", desc: "Automatic grading with detailed result breakdowns." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", overflow: "hidden" }}>
      {/* Header */}
      <header style={{ padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, zIndex: 10, background: "rgba(10,10,15,0.9)", backdropFilter: "blur(20px)" }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: "-0.02em" }}>QuizApp</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 40px 80px", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: "0%", left: "50%", transform: "translateX(-50%)", width: 800, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,252,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="badge badge-accent" style={{ marginBottom: 20, display: "inline-flex" }}>
          🚀 Now with real-time sync & auto-submit
        </div>
        <h1
          style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(44px, 8vw, 80px)",
            lineHeight: 1.05, letterSpacing: "-0.03em",
            marginBottom: 24,
            background: "linear-gradient(135deg, var(--text) 0%, var(--accent-2) 60%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          Quiz smarter,<br />learn faster.
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-2)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          A full-stack quiz platform for teachers and students — with live timers, analytics, leaderboards, and instant feedback.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn btn-primary btn-lg">Start for free →</Link>
          <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-16" style={{ flexWrap: "wrap" }}>
          {[["10+", "Question Categories"], ["∞", "Quiz Attempts"], ["Real-time", "Score Sync"]].map(([val, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--accent-2)" }}>{val}</div>
              <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 40px 100px" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 32, fontWeight: 700, textAlign: "center", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Everything you need
        </h2>
        <p style={{ color: "var(--text-2)", textAlign: "center", marginBottom: 48, fontSize: 15 }}>Powerful features for educators and learners alike</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="card"
              style={{
                padding: 24,
                animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ borderTop: "1px solid var(--border)", padding: "80px 40px", textAlign: "center", background: "var(--bg-2)" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 36, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Ready to start quizzing?
        </h2>
        <p style={{ color: "var(--text-2)", marginBottom: 32, fontSize: 16 }}>Join as a student or teacher — it's completely free.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register?role=STUDENT" className="btn btn-primary btn-lg">Join as Student</Link>
          <Link to="/register?role=TEACHER" className="btn btn-ghost btn-lg">Join as Teacher</Link>
        </div>
      </section>

      <footer style={{ padding: "24px 40px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>© 2025 QuizApp · Built with Spring Boot + React</p>
      </footer>
    </div>
  );
}