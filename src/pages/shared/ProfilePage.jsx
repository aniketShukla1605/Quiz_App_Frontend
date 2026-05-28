import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from "../../services/profileService";
import Loader from "../../components/common/Loader";

export default function ProfilePage() {
  const { updateProfile: ctxUpdate } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    getProfile().then((res) => {
      setProfile(res.data);
      setForm({ displayName: res.data.displayName || "", bio: res.data.bio || "" });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(""); setSuccess("");
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      ctxUpdate(res.data);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    setUploading(true);
    try {
      const res = await uploadAvatar(fd);
      setProfile(res.data);
      ctxUpdate(res.data);
    } catch {
      setError("Avatar upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setUploading(true);
    try {
      const res = await deleteAvatar();
      setProfile(res.data);
      ctxUpdate(res.data);
    } catch {
      setError("Failed to remove avatar.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 4, letterSpacing: "-0.02em" }}>My Profile</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32, fontSize: 14 }}>Manage your account details and avatar</p>

      {success && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "12px 16px", color: "var(--green)", fontSize: 14, marginBottom: 20 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "var(--red)", fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Avatar</h2>
        <div className="flex items-center gap-6">
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: "2px solid var(--border)", overflow: "hidden", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--accent-2)" }}>
                {profile?.displayName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input type="file" accept="image/*" ref={fileRef} onChange={handleAvatarUpload} style={{ display: "none" }} />
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader size="sm" /> : "Upload photo"}
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteAvatar} disabled={uploading}>Remove</button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 32 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 24 }}>Account Details</h2>
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label className="input-label">Display Name</label>
            <input className="input" type="text" placeholder="Your name"
              value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Bio</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Tell us a bit about yourself..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          <div style={{ padding: "14px 16px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 4 }}>User ID</div>
            <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-2)", wordBreak: "break-all" }}>{profile?.userId || "—"}</div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={saving}>
            {saving ? <Loader size="sm" /> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}