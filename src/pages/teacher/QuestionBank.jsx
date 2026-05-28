import { useState, useEffect } from "react";
import { getAllQuestions, getQuestionsByCategory, addQuestion } from "../../services/questionService";
import Loader from "../../components/common/Loader";

const CATEGORIES = [
  "Java","Python","JavaScript","React","Spring Boot","Database",
  "Algorithms","Data Structures","Operating Systems","Networking",
  "Linux","Docker","Math","Science","English","History","General Knowledge",
];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const BLANK = {
  questionTitle: "", optionA: "", optionB: "", optionC: "", optionD: "",
  correctAnswer: "", difficultyLevel: "Medium", category: "",
};

function QuestionRow({ q, index }) {
  const [open, setOpen] = useState(false);
  const diffColor = q.difficultyLevel === "Easy" ? "var(--green)" : q.difficultyLevel === "Hard" ? "var(--red)" : "var(--amber)";

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.2s",
        borderColor: open ? "var(--accent)" : "var(--border)",
      }}
    >
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: 28, height: 28, borderRadius: 7, flexShrink: 0,
            background: "var(--surface)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 11,
            color: "var(--text-3)",
          }}
        >
          {index + 1}
        </span>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
          {q.questionTitle}
        </span>
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          {q.category && (
            <span className="badge badge-accent" style={{ fontSize: 10 }}>{q.category}</span>
          )}
          {q.difficultyLevel && (
            <span
              className="badge"
              style={{
                fontSize: 10,
                background: `${diffColor}18`,
                color: diffColor,
                border: `1px solid ${diffColor}40`,
              }}
            >
              {q.difficultyLevel}
            </span>
          )}
          <span style={{ color: "var(--text-3)", fontSize: 12, marginLeft: 4 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {["A", "B", "C", "D"].map((key) => {
              const val = q[`option${key}`];
              const isCorrect = val === q.correctAnswer;
              return (
                <div
                  key={key}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${isCorrect ? "rgba(34,197,94,0.5)" : "var(--border)"}`,
                    background: isCorrect ? "rgba(34,197,94,0.08)" : "var(--surface)",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      background: isCorrect ? "var(--green)" : "var(--surface-2)",
                      color: isCorrect ? "white" : "var(--text-3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 10,
                    }}
                  >
                    {key}
                  </span>
                  <span style={{ fontSize: 13, color: isCorrect ? "var(--green)" : "var(--text-2)" }}>{val}</span>
                  {isCorrect && <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--green)" }}>✓ correct</span>}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>
            Question ID: <span style={{ fontFamily: "monospace", color: "var(--text-2)" }}>{q.id}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  const fetchQuestions = (cat = "") => {
    setLoading(true);
    const req = cat ? getQuestionsByCategory(cat) : getAllQuestions();
    req
      .then((res) => setQuestions(res.data || []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(catFilter); }, [catFilter]);

  const filtered = questions.filter((q) =>
    !search || q.questionTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setSaveError(""); setSaveSuccess("");
    if (!form.questionTitle || !form.optionA || !form.optionB || !form.optionC || !form.optionD || !form.correctAnswer || !form.category) {
      setSaveError("All fields are required.");
      return;
    }
    const opts = [form.optionA, form.optionB, form.optionC, form.optionD];
    if (!opts.includes(form.correctAnswer)) {
      setSaveError("Correct answer must exactly match one of the options.");
      return;
    }
    setSaving(true);
    try {
      await addQuestion(form);
      setSaveSuccess("Question added successfully!");
      setForm(BLANK);
      // refresh
      fetchQuestions(catFilter);
      setTimeout(() => { setSaveSuccess(""); setShowAdd(false); }, 2000);
    } catch (err) {
      setSaveError(err.response?.data || "Failed to add question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 2 }}>
            Question Bank
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14 }}>
            {questions.length} question{questions.length !== 1 ? "s" : ""}
            {catFilter ? ` in ${catFilter}` : " across all categories"}
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className={`btn ${showAdd ? "btn-ghost" : "btn-primary"}`}
        >
          {showAdd ? "✕ Cancel" : "+ Add Question"}
        </button>
      </div>

      {/* Add question form */}
      {showAdd && (
        <div className="card" style={{ padding: 28, marginBottom: 24, borderColor: "var(--accent)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>
            Add New Question
          </h2>

          {saveSuccess && (
            <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--green)", fontSize: 13, marginBottom: 16 }}>
              ✓ {saveSuccess}
            </div>
          )}
          {saveError && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13, marginBottom: 16 }}>
              {saveError}
            </div>
          )}

          <form onSubmit={handleAddQuestion} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="input-label">Question Title *</label>
              <textarea
                className="input" rows={2} placeholder="Enter the question…"
                value={form.questionTitle}
                onChange={(e) => setForm({ ...form, questionTitle: e.target.value })}
                style={{ resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["A", "B", "C", "D"].map((key) => (
                <div key={key}>
                  <label className="input-label">Option {key} *</label>
                  <input
                    className="input" type="text" placeholder={`Option ${key}`}
                    value={form[`option${key}`]}
                    onChange={(e) => setForm({ ...form, [`option${key}`]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label className="input-label">Correct Answer *</label>
                <select
                  className="input" style={{ cursor: "pointer" }}
                  value={form.correctAnswer}
                  onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
                >
                  <option value="">Select…</option>
                  {["A", "B", "C", "D"].map((key) =>
                    form[`option${key}`] ? (
                      <option key={key} value={form[`option${key}`]}>
                        {key}: {form[`option${key}`]}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
              <div>
                <label className="input-label">Category *</label>
                <select
                  className="input" style={{ cursor: "pointer" }}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="input-label">Difficulty</label>
                <select
                  className="input" style={{ cursor: "pointer" }}
                  value={form.difficultyLevel}
                  onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}
                >
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Loader size="sm" /> : "Add Question"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setForm(BLANK); setSaveError(""); }}>
                Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          className="input"
          type="text"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select
          className="input"
          style={{ maxWidth: 200, cursor: "pointer" }}
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(catFilter || search) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setCatFilter(""); setSearch(""); }}
          >
            Clear filters
          </button>
        )}
        <span style={{ fontSize: 13, color: "var(--text-3)", marginLeft: "auto" }}>
          Showing {filtered.length} of {questions.length}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 56, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            {questions.length === 0 ? "No questions yet" : "No results found"}
          </h2>
          <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 20 }}>
            {questions.length === 0
              ? "Start by adding questions to the bank above."
              : "Try a different search or filter."}
          </p>
          {questions.length === 0 && (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">
              + Add First Question
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((q, i) => (
            <QuestionRow key={q.id ?? i} q={q} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}