import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getProfile } from "../services/profileService";
import { logout as logoutApi, refresh } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { role, email }
  const [profile, setProfile] = useState(null); // profile service data
  const [loading, setLoading] = useState(true);

  // Try to restore session on mount via refresh token
  useEffect(() => {
    refresh()
      .then((res) => {
        setUser({ role: res.data.role, email: res.data.email });
        return getProfile();
      })
      .then((res) => setProfile(res.data))
      .catch(() => {
        setUser(null);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    setUser({ role: userData.role, email: userData.email });
    // Fetch profile after login
    getProfile()
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {}
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback((profileData) => {
    setProfile((prev) => ({ ...prev, ...profileData }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}