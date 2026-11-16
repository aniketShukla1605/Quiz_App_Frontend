import { Link } from "react-router-dom";
import Icon from "../../components/common/Icon";

const features = [
  ["bolt", "Build in minutes", "Pick a subject and a length. Quizzy pulls random questions from your bank, or write your own."],
  ["clock", "Timer that holds up", "The clock runs on the server. If a student's wifi drops, answers are saved and the quiz submits itself on time."],
  ["chart", "Results as they land", "Scores, averages and each student's history appear the moment someone submits."],
  ["trophy", "Rankings per quiz", "See who finished first and who scored highest, by quiz title."],
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="wrap" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 72 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--text)" }}>
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, letterSpacing: "-.03em" }}>Quizzy</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "var(--s5)" }}>
          <Link to="/login" className="navlink">Sign in</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Create account</Link>
        </nav>
      </header>

      <main>
        <section className="wrap hero">
          <div>
            <h1 className="rise" style={{ "--i": 0 }}>Quizzes that<br />run themselves.</h1>
            <p className="rise" style={{ "--i": 1, fontSize: 20, color: "var(--text-2)", maxWidth: 480, margin: "var(--s5) 0 var(--s6)" }}>
              Set a quiz, share its ID, and watch scores arrive. Quizzy handles the timer, the marking and the leaderboard.
            </p>
            <div className="rise" style={{ "--i": 2, display: "flex", gap: "var(--s3)", flexWrap: "wrap" }}>
              <Link to="/register?role=TEACHER" className="btn btn-primary btn-lg">Set a quiz</Link>
              <Link to="/register?role=STUDENT" className="btn btn-ghost btn-lg">Take a quiz</Link>
            </div>
          </div>
          {/* Add public/photos/hero.jpg (e.g. a classroom photo from unsplash.com) */}
          <img className="photo rise" style={{ "--i": 3, aspectRatio: "4/5" }} src="/photos/hero.jpg" alt="Students working at laptops in a bright classroom" />
        </section>

        <section className="wrap" style={{ padding: "var(--s8) 0" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", maxWidth: 640, marginBottom: "var(--s7)" }}>Less time setting up, more time teaching.</h2>
          {features.map(([icon, title, body]) => (
            <div className="row" key={title}>
              <span style={{ color: "var(--accent)" }}><Icon name={icon} size={28} /></span>
              <h3 style={{ fontSize: 22 }}>{title}</h3>
              <p style={{ color: "var(--text-2)", maxWidth: 560 }}>{body}</p>
            </div>
          ))}
        </section>

        <section className="wrap" style={{ padding: "0 var(--s5) var(--s8)" }}>
          <img className="photo" style={{ aspectRatio: "21/9" }} src="/photos/study.jpg" alt="A student writing answers at a desk" />
        </section>

        <section className="wrap" style={{ padding: "var(--s7) 0 var(--s9)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s6)", flexWrap: "wrap", borderTop: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,44px)", maxWidth: 520 }}>Your first quiz takes about two minutes.</h2>
          <Link to="/register" className="btn btn-primary btn-lg">Create a free account <Icon name="arrow" size={18} /></Link>
        </section>
      </main>
      <footer className="wrap" style={{ padding: "var(--s5) 0", color: "var(--text-3)", fontSize: 14, borderTop: "1px solid var(--border)" }}>
        © 2025 Quizzy
      </footer>
    </div>
  );
}