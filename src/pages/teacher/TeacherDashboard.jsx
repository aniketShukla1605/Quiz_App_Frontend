import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/common/Icon";

const ACTIONS = [
  ["bolt", "Quick quiz", "Pick a subject and length. We choose random questions from your bank.", "/teacher/create-quiz"],
  ["plus", "Write a quiz", "Write every question yourself and set the timer.", "/teacher/create-custom"],
  ["book", "Question bank", "Browse, search and add questions by subject.", "/teacher/questions"],
  ["trophy", "Rankings", "See who scored highest on any quiz.", "/teacher/leaderboard"],
];

export default function TeacherDashboard() {
  const { profile } = useAuth();
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginBottom: "var(--s7)" }}>
        <div>
          <p style={{ color: "var(--text-2)" }}>{greeting}</p>
          <h1 style={{ fontSize: 44 }}>{profile?.displayName || "there"}</h1>
        </div>
        <Link to="/teacher/create-quiz" className="btn btn-primary btn-lg"><Icon name="plus" size={18} />New quiz</Link>
      </div>

      <h2 style={{ fontSize: 24, marginBottom: "var(--s4)" }}>What would you like to do?</h2>
      <ul style={{ listStyle: "none" }}>
        {ACTIONS.map(([icon, title, body, to], i) => (
          <li key={to} className="rise" style={{ "--i": i }}>
            <Link to={to} className="navlink-row" style={{ display: "grid", gridTemplateColumns: "32px 200px 1fr 24px", gap: "var(--s5)", alignItems: "center", padding: "var(--s5) 0", borderTop: "1px solid var(--border)", color: "var(--text)" }}>
              <span style={{ color: "var(--accent)" }}><Icon name={icon} size={26} /></span>
              <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20 }}>{title}</span>
              <span style={{ color: "var(--text-2)" }}>{body}</span>
              <Icon name="arrow" size={18} className="row-arrow" />
            </Link>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: "var(--s6)", color: "var(--text-2)", maxWidth: 520 }}>
        After you create a quiz, share its ID with your students. They enter it on their Take a quiz page.
      </p>
    </div>
  );
}