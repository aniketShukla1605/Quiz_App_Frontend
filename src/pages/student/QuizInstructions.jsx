import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";

const RULES = [
  ["clock", "The quiz is timed", "When time runs out, your answers are submitted for you."],
  ["check", "One attempt only", "You can't retake a quiz once you've submitted it."],
  ["shield", "Answers are saved as you go", "We sync every 30 seconds, so a short disconnect won't lose your work."],
  ["alert", "Stay online", "If you're offline when time ends, your saved answers are submitted when you reconnect."],
];

export default function QuizInstructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setStarting(true); setError("");
    try {
      const res = await startQuiz(id);
      sessionStorage.setItem(`quiz-attempt-${id}`, JSON.stringify(res.data));
      navigate(`/student/quiz/${id}`);
    } catch (e) {
      setError(e.response?.status === 403 ? "You've already submitted this quiz. Open your history to see the result."
        : e.response?.status === 404 ? `Quiz ${id} doesn't exist. Check the ID with your teacher.`
        : explain(e, "start the quiz"));
      setStarting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "var(--s6)" }}>Back</button>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Quiz {id}</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>Read this before you begin.</p>

      {error && <div style={{ marginBottom: "var(--s5)" }}><ErrorState message={error} /></div>}

      <ul style={{ listStyle: "none", marginBottom: "var(--s7)" }}>
        {RULES.map(([icon, title, body]) => (
          <li key={title} style={{ display: "flex", gap: "var(--s4)", padding: "var(--s4) 0", borderTop: "1px solid var(--border)" }}>
            <span style={{ color: "var(--accent)", marginTop: 2 }}><Icon name={icon} /></span>
            <div><div style={{ fontWeight: 600 }}>{title}</div><div style={{ color: "var(--text-2)" }}>{body}</div></div>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <button className="btn btn-ghost btn-lg" onClick={() => navigate(-1)}>Not yet</button>
        <button className="btn btn-primary btn-lg" onClick={start} disabled={starting} style={{ flex: 1 }}>
          {starting ? <Loader size="sm" /> : "Start the timer and begin"}
        </button>
      </div>
    </div>
  );
}