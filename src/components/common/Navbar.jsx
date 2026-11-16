import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Icon from "./Icon";

export default function Navbar({ onMenuClick, menuOpen }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const name = profile?.displayName || user?.email?.split("@")[0] || "Account";
  const home = user?.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";

  const signOut = async () => { await logout(); navigate("/login"); };

  return (
    <header style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 var(--s5)", borderBottom: "1px solid var(--border)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 40 }}>
      <div className="flex items-center gap-3">
        <button className="btn btn-ghost btn-sm menu-btn" onClick={onMenuClick} aria-label="Menu" aria-expanded={!!menuOpen} aria-controls="main-nav">
          <Icon name="list" size={18} />
        </button>
        <Link to={home} className="flex items-center gap-2" style={{ color: "var(--text)" }}>
          <img src="/favicon.svg" alt="" width="28" height="28" />
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, letterSpacing: "-.03em" }}>Quizzy</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/profile" className="flex items-center gap-3" style={{ color: "var(--text)" }} aria-label="Your profile">
          <span style={{ textAlign: "right", lineHeight: 1.25 }} className="nav-name">
            <span style={{ display: "block", fontWeight: 600, fontSize: 14 }}>{name}</span>
            <span style={{ display: "block", fontSize: 12, color: "var(--text-3)" }}>{user?.role === "TEACHER" ? "Teacher" : "Student"}</span>
          </span>
          <span style={{ width: 36, height: 36, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--accent-bg)", color: "var(--accent)", display: "grid", placeItems: "center", fontWeight: 700 }}>
            {profile?.avatarUrl
              ? <img src={profile.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              : name.charAt(0).toUpperCase()}
          </span>
        </Link>
        <button className="btn btn-ghost btn-sm" onClick={signOut}><Icon name="logout" size={16} />Sign out</button>
      </div>
    </header>
  );
}