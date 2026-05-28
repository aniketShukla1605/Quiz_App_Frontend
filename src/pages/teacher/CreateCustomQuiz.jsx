import { useState } from "react";
import { createQuizWithQuestions } from "../../services/questionService";
import Loader from "../../components/common/Loader";

const CATEGORIES = ["Java", "Python", "JavaScript", "React", "Spring Boot", "Database", "Algorithms", "Data Structures", "Operating Systems", "Networking", "Linux", "Docker", "Math", "Science", "English", "History", "General Knowledge"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const BLANK_Q = () => ({ questionTitle: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "", difficultyLevel: "Medium", category: "" });

export default function CreateCustomQuiz() {
  const [meta, setMeta] = useState({ quizTitle: "", category: "", duration: 30 });
  const [questions, setQuestions] = useState([BLANK_Q()]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [expandedQ, setExpandedQ] = useState(0);

  const updateQ = (i, field, val) => {
    setQuestions((qs) => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  };

  const addQuestion = () => {
    setQuestions((qs) => [...qs, { ...BLANK_Q(), category: meta.category }]);
    setExpandedQ(questions.length);
  };

  const removeQuestion = (i) => {
    if (questions.length === 1) return;
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
    setExpandedQ((e) => Math.min(e, questions.length - 2));
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionTitle.trim()) return `Question ${i + 1}: Title is required.`;
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) return `Question ${i + 1}: All 4 options are required.`;
      if (!q.correctAnswer) return `Question ${i + 1}: Correct answer is required.`;
      const opts = [q.optionA, q.optionB, q.optionC, q.optionD];
      if (!opts.includes(q.correctAnswer)) return `Question ${i + 1}: Correct answer must match one of the options.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!meta.quizTitle.trim() || !meta.category) { setError("Title and category are required."); return; }
    const qError = validateQuestions();
    if (qError) { setError(qError); return; }

    // ensure all questions inherit the quiz category
    const qs = questions.map((q) => ({ ...q, category: meta.category }));

    setLoading(true);
    try {
      await createQuizWithQuestions({ quizTitle: meta.quizTitle, category: meta.category, questions: qs });
      setSuccess(`Custom quiz "${meta.quizTitle}" with ${questions.length} questions created!`);
      setMeta({ quizTitle: "", category: "", duration: 30 });
      setQuestions([BLANK_Q()]);
      setExpandedQ(0);
    } catch (err) {
      setError(err.response?.data || "Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>Custom Quiz Builder</h1>
      <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 32 }}>Write your own questions and build a fully custom quiz</p>

      {success && <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "14px 18px", color: "var(--green)", fontSize: 14, marginBottom: 24 }}>✓ {success}</div>}
      {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "14px 18px", color: "var(--red)", fontSize: 14, marginBottom: 24 }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Meta */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Quiz Settings</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label className="input-label">Quiz Title *</label>
                <input className="input" type="text" placeholder="My Custom Quiz"
                  value={meta.quizTitle} onChange={(e) => setMeta({ ...meta, quizTitle: e.target.value })} required />
              </div>
              <div>
                <label className="input-label">Category *</label>
                <select className="input" style={{ cursor: "pointer" }}
                  value={meta.category} onChange={(e) => { setMeta({ ...meta, category: e.target.value }); setQuestions((qs) => qs.map((q) => ({ ...q, category: e.target.value }))); }}>
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ maxWidth: 200 }}>
              <label className="input-label">Duration (minutes)</label>
              <input className="input" type="number" min={5} max={180}
                value={meta.duration} onChange={(e) => setMeta({ ...meta, duration: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {questions.map((q, i) => {
            const isOpen = expandedQ === i;
            const isValid = q.questionTitle && q.optionA && q.optionB && q.optionC && q.optionD && q.correctAnswer;
            return (
              <div key={i} className="card" style={{ overflow: "hidden", borderColor: isOpen ? "var(--accent)" : "var(--border)" }}>
                {/* Accordion header */}
                <div
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                  onClick={() => setExpandedQ(isOpen ? -1 : i)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        width: 28, height: 28, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
                        background: isValid ? "rgba(34,197,94,0.15)" : "var(--surface-2)",
                        color: isValid ? "var(--green)" : "var(--text-3)",
                        border: `1px solid ${isValid ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                      }}
                    >
                      {isValid ? "✓" : i + 1}
                    </span>
                    <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14 }}>
                      {q.questionTitle ? q.questionTitle.slice(0, 60) + (q.questionTitle.length > 60 ? "…" : "") : `Question ${i + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {questions.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                        className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: "4px 10px" }}>Remove</button>
                    )}
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label className="input-label">Question *</label>
                      <textarea className="input" rows={2} placeholder="Enter your question here…"
                        value={q.questionTitle} onChange={(e) => updateQ(i, "questionTitle", e.target.value)}
                        style={{ resize: "vertical" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {["A", "B", "C", "D"].map((opt) => (
                        <div key={opt}>
                          <label className="input-label">Option {opt} *</label>
                          <input className="input" type="text" placeholder={`Option ${opt}`}
                            value={q[`option${opt}`]} onChange={(e) => updateQ(i, `option${opt}`, e.target.value)} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label className="input-label">Correct Answer *</label>
                        <select className="input" style={{ cursor: "pointer" }}
                          value={q.correctAnswer} onChange={(e) => updateQ(i, "correctAnswer", e.target.value)}>
                          <option value="">Select…</option>
                          {["A", "B", "C", "D"].map((opt) => q[`option${opt}`] && (
                            <option key={opt} value={q[`option${opt}`]}>{opt}: {q[`option${opt}`]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="input-label">Difficulty</label>
                        <select className="input" style={{ cursor: "pointer" }}
                          value={q.difficultyLevel} onChange={(e) => updateQ(i, "difficultyLevel", e.target.value)}>
                          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" onClick={addQuestion} className="btn btn-ghost" style={{ alignSelf: "flex-start" }}>
          + Add Question
        </button>

        {/* Summary bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, color: "var(--text-2)" }}>
            <strong style={{ color: "var(--text)", fontFamily: "Syne, sans-serif" }}>{questions.length}</strong> question{questions.length !== 1 ? "s" : ""} ·
            <strong style={{ color: "var(--text)", fontFamily: "Syne, sans-serif", marginLeft: 4 }}>{meta.duration}</strong> min ·
            {meta.category && <span style={{ marginLeft: 4 }}>{meta.category}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader size="sm" /> : "🛠 Create Custom Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}