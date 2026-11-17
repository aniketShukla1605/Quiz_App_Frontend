import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from "../../services/profileService";
import Loader, { Skeleton } from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

export default function ProfilePage() {
  const { updateProfile: ctxUpdate } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ displayName: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const load = () => {
    setLoading(true); setError("");
    getProfile().then((r) => { setProfile(r.data); setForm({ displayName: r.data.displayName || "", bio: r.data.bio || "" }); })
      .catch((e) => setError(explain(e, "load your profile"))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const apply = (d) => { setProfile(d); ctxUpdate(d); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.displayName.trim()) return setError("Your display name can't be empty. It's what teachers see on rankings.");
    setSaving(true); setError(""); setSaved(false);
    try { apply((await updateProfile(form)).data); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (err) { setError(explain(err, "save your profile")); }
    finally { setSaving(false); }
  };

  const photo = async (fn, arg) => {
    setPhotoBusy(true); setError("");
    try { apply((await fn(arg)).data); } catch (err) { setError(explain(err, "update your photo")); }
    finally { setPhotoBusy(false); }
  };

  const pick = (e) => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Choose an image file, such as a JPG or PNG.");
    if (f.size > 5 * 1024 * 1024) return setError("That image is over 5 MB. Choose a smaller one.");
    const fd = new FormData(); fd.append("file", f); photo(uploadAvatar, fd);
  };

  if (loading) return <div style={{ maxWidth: 600 }}><Skeleton count={4} h={64} /></div>;
  if (!profile) return <div style={{ maxWidth: 600 }}><ErrorState message={error} onRetry={load} /></div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Profile</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>This is how you appear to teachers and on rankings.</p>
      {error && <div style={{ marginBottom: "var(--s5)" }}><ErrorState message={error} /></div>}

      <div className="flex items-center gap-5" style={{ gap: "var(--s5)", paddingBottom: "var(--s6)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ width: 88, height: 88, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--accent-bg)", display: "grid", placeItems: "center", color: "var(--accent)", fontSize: 32, fontWeight: 700, position: "relative" }}>
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt="Your photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (profile.displayName || "?").charAt(0).toUpperCase()}
          {photoBusy && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.7)", display: "grid", placeItems: "center" }}><Loader /></div>}
        </div>
        <div className="flex gap-3">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={photoBusy}>Change photo</button>
          <button className="btn btn-danger btn-sm" onClick={() => photo(deleteAvatar)} disabled={photoBusy}>Remove</button>
        </div>
      </div>

      <form onSubmit={save} noValidate style={{ display: "grid", gap: "var(--s5)", paddingTop: "var(--s6)" }}>
        <div><label className="input-label" htmlFor="dn">Display name</label><input id="dn" className="input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></div>
        <div><label className="input-label" htmlFor="bio">About you</label><textarea id="bio" className="input" rows={3} placeholder="A line or two about you" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        <div className="flex items-center gap-4">
          <button className="btn btn-primary" disabled={saving}>{saving ? <Loader size="sm" /> : "Save changes"}</button>
          {saved && <span role="status" className="flex items-center gap-2" style={{ color: "var(--green)", animation: "fadeUp .2s" }}><Icon name="check" size={16} />Saved</span>}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-3)", wordBreak: "break-all" }}>Account ID: {profile.userId}</p>
      </form>
    </div>
  );
}