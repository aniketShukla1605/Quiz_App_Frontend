import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";

export default function QuizInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await startQuiz(id);
      // Store attempt data for quiz page
      sessionStorage.setItem(`quiz-attempt-${id}`, JSON.stringify(res.data));
      navigate(`/student/quiz/${id}`);
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === "string" && msg.includes("already submitted")) {
        setError(msg);
      } else if (err.response?.status === 403) {
        setError("You have already submitted this quiz.");
      } else {
        setError("Failed to start quiz. Please try again.");
      }
      setStarting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <div style={{ marginBottom: 32 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>← Back</button>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: "-0.02em", marginBottom: 4 }}>Quiz #{id}</h1>
        <p style={{ color: "var(--text-2)", fontSize: 14 }}>Read all instructions before starting</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "var(--red)", fontSize: 14, marginBottom: 24 }}>
          ⚠ {error}
        </div>
      )}

      <div className="card" style={{ padding: 32, marginBottom: 20 }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 24 }}>📋 Instructions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "⏱️", title: "Timed Quiz", desc: "The quiz has a time limit. It will be auto-submitted when time expires." },
            { icon: "✅", title: "One Attempt", desc: "You can only attempt each quiz once. Make sure you're ready before starting." },
            { icon: "💾", title: "Auto-Sync", desc: "Your answers are synced to the server periodically so you won't lose progress." },
            { icon: "📶", title: "Stay Connected", desc: "If you lose connection, the quiz may be auto-submitted when you reconnect." },
            { icon: "🏁", title: "Submit When Done", desc: "Click the Submit button when you've answered all questions." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4" style={{ padding: "14px 16px", background: "var(--bg-2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 10, marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: "var(--amber)", display: "flex", alignItems: "center", gap: 8 }}>
          <span>⚠️</span>
          <span>Once you click "Start Quiz", the timer begins immediately. Are you ready?</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-lg">Not yet</button>
        <button onClick={handleStart} className="btn btn-primary btn-lg" disabled={starting} style={{ flex: 1 }}>
          {starting ? <Loader size="sm" /> : "🚀 Start Quiz"}
        </button>
      </div>
    </div>
  );
}