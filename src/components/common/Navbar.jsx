import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials =
    profile?.displayName?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
        position: "sticky",
        top: 0,
        zIndex: 20,
        gap: 12,
      }}
    >
      {/* Left: hamburger (mobile) + logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-sm"
          style={{ display: "none" }}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          ☰
        </button>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              background: "var(--accent)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            ⚡
          </div>
          <span
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: "-0.02em",
            }}
          >
            QuizApp
          </span>
        </Link>
      </div>

      {/* Right: role badge + avatar + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user?.role && (
          <span
            className="badge badge-accent"
            style={{ fontSize: 11, textTransform: "capitalize" }}
          >
            {user.role.toLowerCase()}
          </span>
        )}

        <Link
          to="/profile"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            textDecoration: "none",
            flexShrink: 0,
          }}
          title="Profile"
        >
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <span
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--accent-2)",
              }}
            >
              {initials}
            </span>
          )}
        </Link>

        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          title="Logout"
          style={{ fontSize: 13 }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}