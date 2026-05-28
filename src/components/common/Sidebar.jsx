import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const studentLinks = [
  { to: "/student/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/student/quizzes", icon: "🎯", label: "Take a Quiz" },
  { to: "/student/history", icon: "📋", label: "History" },
  { to: "/student/analytics", icon: "📈", label: "Analytics" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

const teacherLinks = [
  { to: "/teacher/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/teacher/create-quiz", icon: "⚡", label: "Create Quiz" },
  { to: "/teacher/create-custom", icon: "🛠", label: "Custom Quiz" },
  { to: "/teacher/questions", icon: "📚", label: "Question Bank" },
  { to: "/teacher/leaderboard", icon: "🏆", label: "Leaderboard" },
  { to: "/profile", icon: "👤", label: "Profile" },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const links = user?.role === "TEACHER" ? teacherLinks : studentLinks;

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 30,
            display: "none",
          }}
          id="sidebar-overlay"
        />
      )}

      <nav
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          padding: "16px 12px",
          gap: 4,
          overflowY: "auto",
          height: "100%",
        }}
      >
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 10,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              fontFamily: "Syne, sans-serif",
              color: isActive ? "var(--accent-2)" : "var(--text-2)",
              background: isActive ? "rgba(124,92,252,0.1)" : "transparent",
              border: isActive
                ? "1px solid rgba(124,92,252,0.2)"
                : "1px solid transparent",
              transition: "all 0.15s",
            })}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}