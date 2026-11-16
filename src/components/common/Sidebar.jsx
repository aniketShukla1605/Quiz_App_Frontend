import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./Icon";

const student = [
  ["/student/dashboard", "home", "Overview"], ["/student/quizzes", "target", "Take a quiz"],
  ["/student/history", "list", "History"], ["/student/analytics", "chart", "Progress"], ["/profile", "user", "Profile"],
];
const teacher = [
  ["/teacher/dashboard", "home", "Overview"], ["/teacher/create-quiz", "bolt", "Quick quiz"],
  ["/teacher/create-custom", "plus", "Write a quiz"], ["/teacher/questions", "book", "Question bank"],
  ["/teacher/leaderboard", "trophy", "Rankings"], ["/profile", "user", "Profile"],
];

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const links = user?.role === "TEACHER" ? teacher : student;
  return (
    <nav aria-label="Main" style={{ width: 220, padding: "var(--s5) var(--s3)", display: "grid", gap: "var(--s1)", alignContent: "start", height: "100%", borderRight: "1px solid var(--border)" }}>
      {links.map(([to, icon, label]) => (
        <NavLink key={to} to={to} onClick={onClose}
          style={({ isActive }) => ({ display: "flex", alignItems: "center", gap: "var(--s3)", padding: "var(--s2) var(--s3)", borderRadius: "var(--radius)", fontWeight: isActive ? 600 : 500, color: isActive ? "var(--accent)" : "var(--text-2)", background: isActive ? "var(--accent-bg)" : "transparent", transition: "background .15s,color .15s", textDecoration: "none" })}>
          <Icon name={icon} size={18} />{label}
        </NavLink>
      ))}
    </nav>
  );
}