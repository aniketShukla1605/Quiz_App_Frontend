import { useState } from "react";
import { createQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";

const CATEGORIES = ["Java", "Python", "JavaScript", "React", "Spring Boot", "Database", "Algorithms", "Data Structures", "Operating Systems", "Networking", "Linux", "Docker", "Math", "Science", "English", "History", "General Knowledge"];

export default function CreateQuiz() {
  const [form, setForm] = useState({ category: "", numOfQ: 10, title: "", duration: 30 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.title.trim()) { setError("Please enter a quiz title."); return; }
    setLoading(true);
    try {
      await createQuiz({ category: form.category, numOfQ: Number(form.numOfQ), title: form.title, duration: Number(form.duration) });
      setSuccess(`Quiz "${form.title}" created successfully! Share the quiz ID with your students.`);
      setForm({ category: "", numOfQ: 10, title: "", duration: 30 });
    } catch (err) {
      setError(err.response?.data || "Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>Create Quiz</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 32 }}>Generate a quiz automatically from existing questions in a category</p>

      {success && (
        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "14px 18px", color: "var(--green)", fontSize: 14, marginBottom: 24 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 18px", color: "var(--red)", fontSize: 14, marginBottom: 24 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="input-label">Quiz Title *</label>
            <input className="input" type="text" placeholder="e.g. Java Basics Quiz"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="input-label">Category *</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              style={{ cursor: "pointer" }}
            >
              <option value="">Select a category…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label">Number of Questions</label>
              <input
                className="input" type="number" min={1} max={50}
                value={form.numOfQ}
                onChange={(e) => setForm({ ...form, numOfQ: e.target.value })}
              />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>1–50 questions</p>
            </div>
            <div>
              <label className="input-label">Duration (minutes)</label>
              <input
                className="input" type="number" min={5} max={180}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
              />
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>5–180 minutes</p>
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: 16, background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8, fontFamily: "Syne, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Preview</div>
            <div style={{ fontSize: 14 }}>
              {form.title || <span style={{ color: "var(--text-3)" }}>No title yet</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
              {form.category && `${form.category} · `}{form.numOfQ} questions · {form.duration} min
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <Loader size="sm" /> : "⚡ Create Quiz"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 20, marginTop: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text-2)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>ℹ How it works</h2>
        <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>
          Questions are randomly selected from the question bank for the chosen category. After creation, a quiz ID is assigned — share it with your students so they can join.
        </div>
      </div>
    </div>
  );
}