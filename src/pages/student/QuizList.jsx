import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/common/Loader";

// Since there's no "list all quizzes" endpoint, let students enter a quiz ID
export default function QuizList() {
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = (e) => {
    e.preventDefault();
    if (!quizId.trim() || isNaN(Number(quizId))) {
      setError("Please enter a valid quiz ID.");
      return;
    }
    navigate(`/student/quiz/${quizId}/instructions`);
  };

  const sampleIds = [1, 2, 3, 4, 5];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>Take a Quiz</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 36, fontSize: 14 }}>Enter a quiz ID provided by your teacher to get started</p>

      <div className="card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Enter Quiz ID</h2>
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}
        <form onSubmit={handleStart} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label className="input-label">Quiz ID</label>
            <input
              className="input"
              type="number"
              min="1"
              placeholder="e.g. 42"
              value={quizId}
              onChange={(e) => { setQuizId(e.target.value); setError(""); }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader size="sm" /> : "Start →"}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 16, color: "var(--text-2)" }}>
          💡 How it works
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["1", "Get a quiz ID from your teacher or class"],
            ["2", "Enter it above and click Start"],
            ["3", "Read the instructions and begin when ready"],
            ["4", "Answer questions before the timer runs out"],
          ].map(([num, text]) => (
            <div key={num} className="flex items-center gap-3">
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "Syne, sans-serif", fontWeight: 700, flexShrink: 0 }}>{num}</div>
              <span style={{ fontSize: 14, color: "var(--text-2)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}