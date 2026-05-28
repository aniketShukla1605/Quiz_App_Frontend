import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuiz, syncQuiz, submitQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";

const OPTION_KEYS = ["A", "B", "C", "D"];

function getOptionValue(q, key) {
  const map = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };
  return map[key];
}

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const timerRef = useRef(null);
  const syncRef = useRef(null);
  const answersRef = useRef({});

  // keep answersRef in sync for use in intervals
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load / resume quiz
  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-attempt-${id}`);
    if (stored) {
      const data = JSON.parse(stored);
      sessionStorage.removeItem(`quiz-attempt-${id}`);
      initFromAttempt(data);
    } else {
      startQuiz(id)
        .then((res) => initFromAttempt(res.data))
        .catch((err) => {
          const msg = err.response?.data;
          if (typeof msg === "string" && msg.includes("already submitted")) {
            navigate(`/student/quiz/${id}/result`);
          } else {
            setError("Failed to load quiz.");
            setLoading(false);
          }
        });
    }
  }, [id]);

  function initFromAttempt(data) {
    setAttempt(data);
    setQuestions(data.questions || []);

    // calc time left
    const expiry = new Date(data.expiryTime).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((expiry - now) / 1000));
    setTimeLeft(diff);
    setLoading(false);
  }

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft !== null]);

  // Sync every 30s
  useEffect(() => {
    if (!attempt) return;
    syncRef.current = setInterval(() => {
      doSync();
    }, 30000);
    return () => clearInterval(syncRef.current);
  }, [attempt]);

  const buildAnswerEntries = useCallback(() => {
    return Object.entries(answersRef.current).map(([qId, ans]) => ({
      questionId: parseInt(qId),
      answer: ans,
    }));
  }, []);

  const doSync = useCallback(async () => {
    if (!attempt) return;
    try {
      const res = await syncQuiz(id, {
        attemptId: attempt.attemptId,
        currentAnswers: buildAnswerEntries(),
        clientTime: new Date().toISOString(),
      });
      if (res.data.submissionStatus === "GRADED" || res.data.submissionStatus === "SUBMITTED") {
        clearInterval(timerRef.current);
        clearInterval(syncRef.current);
        sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(res.data));
        navigate(`/student/quiz/${id}/result`);
      }
    } catch {}
  }, [attempt, id, buildAnswerEntries]);

  const handleAutoSubmit = useCallback(async () => {
    if (autoSubmitted || submitting) return;
    setAutoSubmitted(true);
    clearInterval(timerRef.current);
    clearInterval(syncRef.current);
    await doSync();
    navigate(`/student/quiz/${id}/result`);
  }, [autoSubmitted, submitting, doSync, id]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    clearInterval(syncRef.current);
    try {
      const res = await submitQuiz(id, {
        attemptId: attempt?.attemptId,
        answers: buildAnswerEntries(),
      });
      sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(res.data));
      navigate(`/student/quiz/${id}/result`);
    } catch (err) {
      if (err.response?.status === 409) {
        navigate(`/student/quiz/${id}/result`);
      } else {
        setError("Failed to submit. Try again.");
        setSubmitting(false);
        clearInterval(timerRef.current); // restart timer? no, just let them retry
      }
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const handleAnswer = (qId, answer) => {
    setAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  if (loading) return <Loader fullPage />;
  if (error) return (
    <div style={{ maxWidth: 480, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
      <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, marginBottom: 12 }}>Something went wrong</h2>
      <p style={{ color: "var(--text-2)", marginBottom: 24 }}>{error}</p>
      <button onClick={() => navigate(-1)} className="btn btn-ghost">← Go back</button>
    </div>
  );

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const progress = total > 0 ? (answered / total) * 100 : 0;
  const isLowTime = timeLeft !== null && timeLeft < 60;
  const isCriticalTime = timeLeft !== null && timeLeft < 30;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", animation: "fadeUp 0.3s ease" }}>
      {/* Top bar */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, padding: "14px 20px",
          background: "var(--surface)", borderRadius: 14,
          border: "1px solid var(--border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 15 }}>
            Quiz #{id}
          </span>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>
            {answered}/{total} answered
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {timeLeft !== null && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8,
                background: isCriticalTime ? "rgba(239,68,68,0.15)" : isLowTime ? "rgba(245,158,11,0.15)" : "var(--bg-2)",
                border: `1px solid ${isCriticalTime ? "rgba(239,68,68,0.4)" : isLowTime ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                animation: isCriticalTime ? "countdown-tick 1s infinite" : "none",
              }}
            >
              <span style={{ fontSize: 14 }}>⏱</span>
              <span
                style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 16,
                  color: isCriticalTime ? "var(--red)" : isLowTime ? "var(--amber)" : "var(--text)",
                }}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? <Loader size="sm" /> : "Submit Quiz"}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 24 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20, alignItems: "start" }}>
        {/* Question card */}
        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span className="badge badge-accent">Q{current + 1} / {total}</span>
          </div>

          {q && (
            <>
              <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, marginBottom: 28 }}>
                {q.questionTitle}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {OPTION_KEYS.map((key) => {
                  const val = getOptionValue(q, key);
                  if (!val) return null;
                  const selected = answers[q.id] === val;
                  return (
                    <button
                      key={key}
                      className={`option-btn ${selected ? "selected" : ""}`}
                      onClick={() => handleAnswer(q.id, val)}
                    >
                      <span
                        style={{
                          width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                          background: selected ? "var(--accent)" : "var(--surface)",
                          border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
                          color: selected ? "white" : "var(--text-3)",
                        }}
                      >
                        {key}
                      </span>
                      <span style={{ flex: 1, textAlign: "left" }}>{val}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
            <button
              className="btn btn-ghost"
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
            >
              ← Previous
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              disabled={current === total - 1}
            >
              Next →
            </button>
          </div>
        </div>

        {/* Question palette */}
        <div className="card" style={{ padding: 20, position: "sticky", top: 88 }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, color: "var(--text-2)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Questions
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === current;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: "100%", aspectRatio: "1", borderRadius: 8, cursor: "pointer",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 12,
                    border: `1.5px solid ${isCurrent ? "var(--accent)" : isAnswered ? "rgba(34,197,94,0.5)" : "var(--border)"}`,
                    background: isCurrent ? "var(--accent)" : isAnswered ? "rgba(34,197,94,0.1)" : "var(--bg-2)",
                    color: isCurrent ? "white" : isAnswered ? "var(--green)" : "var(--text-3)",
                    transition: "all 0.15s",
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { color: "var(--accent)", label: "Current" },
              { color: "rgba(34,197,94,0.5)", label: "Answered", bg: "rgba(34,197,94,0.1)" },
              { color: "var(--border)", label: "Unanswered", bg: "var(--bg-2)" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.bg || item.color, border: `1.5px solid ${item.color}` }} />
                {item.label}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Progress</div>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 18 }}>
              {answered}/{total}
            </div>
            <div className="progress-bar" style={{ marginTop: 6 }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}