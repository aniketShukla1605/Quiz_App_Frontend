import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);          // close drawer after navigating
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div style={{ background: "var(--bg)" }}>
      <a href="#content" className="skip">Skip to content</a>
      <Navbar onMenuClick={() => setOpen((v) => !v)} menuOpen={open} />
      <div className="shell">
        <div id="main-nav" className={`shell-nav ${open ? "open" : ""}`}>
          <Sidebar onClose={() => setOpen(false)} />
        </div>
        <div className={`scrim ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
        <main id="content" className="shell-main" key={pathname} style={{ animation: "fadeUp .3s var(--ease)", maxWidth: 1100, width: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}