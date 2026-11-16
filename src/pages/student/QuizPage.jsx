import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { startQuiz, syncQuiz, submitQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";
import { ErrorState } from "../../components/common/States";
import Icon from "../../components/common/Icon";
import { explain } from "../../utils/errors";

const KEYS = ["A", "B", "C", "D"];
const opt = (q, k) => ({ A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[k]);
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [fatal, setFatal] = useState("");
  const timerRef = useRef(null), syncRef = useRef(null), answersRef = useRef({}), done = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);

  const init = (data) => {
    setAttempt(data);
    setQuestions(data.questions || []);
    const secs = Math.max(0, Math.floor((new Date(data.expiryTime).getTime() - Date.now()) / 1000));
    setTimeLeft(secs);
    setTotal(Math.max(1, (data.durationMinutes || 30) * 60));
    setLoading(false);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(`quiz-attempt-${id}`);
    if (stored) { sessionStorage.removeItem(`quiz-attempt-${id}`); init(JSON.parse(stored)); return; }
    startQuiz(id).then((r) => init(r.data)).catch((e) => {
      if (typeof e.response?.data === "string" && e.response.data.includes("already submitted")) navigate(`/student/quiz/${id}/result`);
      else { setFatal(explain(e, "open this quiz")); setLoading(false); }
    });
  }, [id]);

  const entries = useCallback(() =>
    Object.entries(answersRef.current).map(([q, a]) => ({ questionId: parseInt(q), answer: a })), []);

  const stop = () => { clearInterval(timerRef.current); clearInterval(syncRef.current); };

  const doSync = useCallback(async () => {
    if (!attempt) return;
    try {
      const r = await syncQuiz(id, { attemptId: attempt.attemptId, currentAnswers: entries(), clientTime: new Date().toISOString() });
      if (["GRADED", "SUBMITTED"].includes(r.data.submissionStatus)) {
        done.current = true; stop();
        sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(r.data));
        navigate(`/student/quiz/${id}/result`);
      }
    } catch { /* next sync will retry; answers are also kept in memory */ }
  }, [attempt, id, entries, navigate]);

  const autoSubmit = useCallback(async () => {
    if (done.current) return;
    done.current = true; stop();
    await doSync();
    navigate(`/student/quiz/${id}/result`);
  }, [doSync, id, navigate]);

  useEffect(() => {
    if (timeLeft === null || done.current) return;
    if (timeLeft <= 0) { autoSubmit(); return; }
    timerRef.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft === null, timeLeft === 0]);

  useEffect(() => {
    if (!attempt) return;
    syncRef.current = setInterval(doSync, 30000);
    return () => clearInterval(syncRef.current);
  }, [attempt, doSync]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true); setError(""); done.current = true; stop();
    try {
      const r = await submitQuiz(id, { attemptId: attempt?.attemptId, answers: entries() });
      sessionStorage.setItem(`quiz-result-${id}`, JSON.stringify(r.data));
      navigate(`/student/quiz/${id}/result`);
    } catch (e) {
      if (e.response?.status === 409) return navigate(`/student/quiz/${id}/result`);
      setError(explain(e, "submit your answers") + " Your answers are still here, so you can submit again.");
      setSubmitting(false); setConfirming(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (fatal) return (
    <div style={{ maxWidth: 520, margin: "var(--s9) auto" }}>
      <ErrorState message={fatal} />
      <button className="btn btn-ghost" style={{ marginTop: "var(--s4)" }} onClick={() => navigate(-1)}>Go back</button>
    </div>
  );

  const q = questions[current];
  const answered = Object.keys(answers).length;
  const left = questions.length - answered;
  const low = timeLeft < 60, critical = timeLeft < 30;
  const tcolor = critical ? "var(--red)" : low ? "var(--amber)" : "var(--text)";

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* Time remaining is a bar that drains, so urgency is visible without reading digits */}
      <div style={{ position: "sticky", top: 0, background: "var(--bg)", paddingBottom: "var(--s4)", zIndex: 5 }}>
        <div className="flex justify-between items-center" style={{ padding: "var(--s3) 0" }}>
          <div>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 20 }}>Quiz {id}</div>
            <div style={{ fontSize: 14, color: "var(--text-2)" }}>{answered} of {questions.length} answered</div>
          </div>
          <div className="flex items-center gap-4">
            <div role="timer" aria-label="Time remaining" className="flex items-center gap-2"
              style={{ color: tcolor, fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, animation: critical ? "countdown-tick 1s infinite" : "none" }}>
              <Icon name="clock" size={20} />{fmt(timeLeft)}
            </div>
            <button className="btn btn-primary" onClick={() => setConfirming(true)} disabled={submitting}>Submit answers</button>
          </div>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(timeLeft / total) * 100}%`, background: tcolor, transition: "width 1s linear, background .3s" }} /></div>
      </div>

      {error && <div style={{ margin: "var(--s4) 0" }}><ErrorState message={error} /></div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "var(--s8)", marginTop: "var(--s6)" }}>
        <section key={current} style={{ animation: "fadeUp .3s var(--ease)" }} aria-live="polite">
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: "var(--s3)" }}>Question {current + 1} of {questions.length}</p>
          {q ? (
            <>
              <h1 style={{ fontSize: 30, lineHeight: 1.25, marginBottom: "var(--s6)", fontWeight: 600 }}>{q.questionTitle}</h1>
              <div style={{ display: "grid", gap: "var(--s3)" }}>
                {KEYS.map((k) => {
                  const v = opt(q, k); if (!v) return null;
                  const sel = answers[q.id] === v;
                  return (
                    <button key={k} className={`option-btn ${sel ? "selected" : ""}`} aria-pressed={sel}
                      onClick={() => setAnswers((p) => ({ ...p, [q.id]: v }))}>
                      <span style={{ width: 28, height: 28, borderRadius: "var(--radius)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 13, background: sel ? "var(--accent)" : "var(--bg-2)", color: sel ? "#fff" : "var(--text-2)", transition: "background .15s" }}>
                        {sel ? <Icon name="check" size={16} /> : k}
                      </span>
                      <span style={{ flex: 1 }}>{v}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : <p style={{ color: "var(--text-2)" }}>This quiz has no questions yet. Ask your teacher to add some.</p>}
          <div className="flex justify-between" style={{ marginTop: "var(--s7)" }}>
            <button className="btn btn-ghost" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>
            <button className="btn btn-ghost" disabled={current >= questions.length - 1} onClick={() => setCurrent((c) => c + 1)}>Next <Icon name="arrow" size={16} /></button>
          </div>
        </section>

        <aside style={{ borderLeft: "1px solid var(--border)", paddingLeft: "var(--s5)", alignSelf: "start", position: "sticky", top: 120 }}>
          <h2 style={{ fontSize: 16, marginBottom: "var(--s3)" }}>Jump to</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--s2)" }}>
            {questions.map((x, i) => {
              const a = answers[x.id] !== undefined, cur = i === current;
              return (
                <button key={x.id} onClick={() => setCurrent(i)} aria-label={`Question ${i + 1}${a ? ", answered" : ""}`} aria-current={cur}
                  style={{ aspectRatio: "1", borderRadius: "var(--radius)", fontWeight: 600, fontSize: 13, border: `1px solid ${cur ? "var(--accent)" : "var(--border)"}`, background: cur ? "var(--accent)" : a ? "var(--accent-bg)" : "transparent", color: cur ? "#fff" : a ? "var(--accent)" : "var(--text-3)", transition: "all .15s" }}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--s4)" }}>Filled = answered. Outlined = still to do.</p>
        </aside>
      </div>

      {confirming && (
        <div role="dialog" aria-modal="true" aria-labelledby="c-title" onClick={() => !submitting && setConfirming(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(26,29,36,.45)", display: "grid", placeItems: "center", zIndex: 50, animation: "fadeUp .2s" }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ padding: "var(--s6)", maxWidth: 420, width: "90%" }}>
            <h2 id="c-title" style={{ fontSize: 24, marginBottom: "var(--s3)" }}>Submit your answers?</h2>
            <p style={{ color: "var(--text-2)", marginBottom: "var(--s5)" }}>
              {left > 0 ? `${left} ${left === 1 ? "question is" : "questions are"} still unanswered. ` : "You've answered every question. "}You can't change answers after submitting.
            </p>
            <div className="flex gap-3" style={{ justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={submitting}>Keep working</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? <Loader size="sm" /> : "Submit now"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}