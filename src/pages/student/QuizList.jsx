import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/common/Icon";

const STEPS = [
  "Get a quiz ID from your teacher.",
  "Enter it here and read the instructions.",
  "Start when you're ready. The timer begins right away.",
  "Answer and submit before time runs out.",
];

export default function QuizList() {
  const navigate = useNavigate();
  const [quizId, setQuizId] = useState("");
  const [error, setError] = useState("");

  const go = (e) => {
    e.preventDefault();
    const n = Number(quizId);
    if (!quizId.trim() || !Number.isInteger(n) || n < 1) return setError("Quiz IDs are whole numbers, like 42. Check the ID your teacher gave you.");
    navigate(`/student/quiz/${n}/instructions`);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Take a quiz</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s7)" }}>Enter the quiz ID your teacher shared with you.</p>

      <form onSubmit={go} noValidate style={{ display: "flex", gap: "var(--s3)", alignItems: "flex-end", marginBottom: "var(--s2)" }}>
        <div style={{ flex: 1 }}>
          <label className="input-label" htmlFor="qid">Quiz ID</label>
          <input id="qid" className="input" inputMode="numeric" placeholder="For example, 42" value={quizId}
            aria-invalid={!!error} aria-describedby="qid-err"
            onChange={(e) => { setQuizId(e.target.value); setError(""); }} />
        </div>
        <button className="btn btn-primary" style={{ height: 46 }}>Continue <Icon name="arrow" size={16} /></button>
      </form>
      <p id="qid-err" role="alert" style={{ minHeight: 24, color: "var(--red)", fontSize: 14 }}>{error}</p>

      <ol style={{ listStyle: "none", marginTop: "var(--s7)" }}>
        {STEPS.map((s, i) => (
          <li key={s} className="rise" style={{ "--i": i, display: "flex", gap: "var(--s4)", padding: "var(--s4) 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontFamily: "var(--display)", fontWeight: 700, color: "var(--accent)", width: 24 }}>{i + 1}</span>
            <span style={{ color: "var(--text-2)" }}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}