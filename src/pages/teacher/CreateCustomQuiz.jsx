import { useState } from "react";
import { createQuizWithQuestions } from "../../services/questionService";
import Loader from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";
import { CATEGORIES, DIFFICULTIES } from "../../utils/Categories";

const blank = () => ({ questionTitle: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "", difficultyLevel: "Medium" });
const L = ["A", "B", "C", "D"];

export default function CreateCustomQuiz() {
  const [meta, setMeta] = useState({ quizTitle: "", category: "", duration: 30 });
  const [qs, setQs] = useState([blank()]);
  const [open, setOpen] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const upd = (i, k, v) => setQs((a) => a.map((q, j) => (j === i ? { ...q, [k]: v } : q)));
  const complete = (q) => q.questionTitle && L.every((l) => q[`option${l}`]) && q.correctAnswer;

  const problem = () => {
    if (!meta.quizTitle.trim() || !meta.category) return "Add a title and subject at the top first.";
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      if (!q.questionTitle.trim()) return `Question ${i + 1} needs its question text.`;
      if (!L.every((l) => q[`option${l}`].trim())) return `Question ${i + 1} needs all four options filled in.`;
      if (!L.some((l) => q[`option${l}`] === q.correctAnswer)) return `Question ${i + 1}: mark which option is correct.`;
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const p = problem(); if (p) { setError(p); return; }
    setError(""); setLoading(true);
    try {
      await createQuizWithQuestions({ quizTitle: meta.quizTitle.trim(), category: meta.category, duration: Number(meta.duration),
        questions: qs.map((q) => ({ ...q, category: meta.category })) });
      setDone(`"${meta.quizTitle.trim()}" is ready with ${qs.length} ${qs.length === 1 ? "question" : "questions"}.`);
      setMeta({ quizTitle: "", category: "", duration: 30 }); setQs([blank()]); setOpen(0);
    } catch (err) { setError(explain(err, "create the quiz")); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} noValidate style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Write a quiz</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>Write your own questions. They're also saved to your question bank.</p>
      {done && <div role="status" style={{ display: "flex", gap: "var(--s3)", padding: "var(--s4)", border: "1px solid var(--green)", borderRadius: "var(--radius)", color: "var(--green)", marginBottom: "var(--s5)" }}><Icon name="check" />{done}</div>}
      {error && <div style={{ marginBottom: "var(--s5)" }}><ErrorState message={error} /></div>}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--s4)", paddingBottom: "var(--s6)" }}>
        <div><label className="input-label" htmlFor="qt">Title</label><input id="qt" className="input" value={meta.quizTitle} onChange={(e) => setMeta({ ...meta, quizTitle: e.target.value })} /></div>
        <div><label className="input-label" htmlFor="qc">Subject</label>
          <select id="qc" className="input" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })}><option value="">Choose</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="input-label" htmlFor="qd">Minutes</label><input id="qd" className="input" type="number" min={5} max={180} value={meta.duration} onChange={(e) => setMeta({ ...meta, duration: e.target.value })} /></div>
      </div>

      {qs.map((q, i) => (
        <section key={i} style={{ borderTop: "1px solid var(--border)", padding: "var(--s4) 0" }}>
          <div className="flex justify-between items-center">
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex items-center gap-3" style={{ background: "none", border: 0, font: "inherit", color: "var(--text)", flex: 1, textAlign: "left", padding: "var(--s2) 0" }}>
              <span style={{ color: complete(q) ? "var(--green)" : "var(--text-3)", width: 20 }}>{complete(q) ? <Icon name="check" size={18} /> : i + 1}</span>
              <b>{q.questionTitle ? q.questionTitle.slice(0, 70) : `Question ${i + 1}`}</b>
            </button>
            {qs.length > 1 && <button type="button" className="btn btn-danger btn-sm" onClick={() => { setQs(qs.filter((_, j) => j !== i)); setOpen(0); }}>Remove</button>}
          </div>
          {open === i && (
            <div style={{ display: "grid", gap: "var(--s4)", padding: "var(--s4) 0 var(--s4) var(--s6)", animation: "fadeUp .25s" }}>
              <div><label className="input-label">Question</label><textarea className="input" rows={2} value={q.questionTitle} onChange={(e) => upd(i, "questionTitle", e.target.value)} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s3)" }}>
                {L.map((l) => <div key={l}><label className="input-label">Option {l}</label><input className="input" value={q[`option${l}`]} onChange={(e) => upd(i, `option${l}`, e.target.value)} /></div>)}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s3)" }}>
                <div><label className="input-label">Correct answer</label>
                  <select className="input" value={q.correctAnswer} onChange={(e) => upd(i, "correctAnswer", e.target.value)}><option value="">Choose</option>
                    {L.filter((l) => q[`option${l}`]).map((l) => <option key={l} value={q[`option${l}`]}>{l}: {q[`option${l}`]}</option>)}</select></div>
                <div><label className="input-label">Difficulty</label>
                  <select className="input" value={q.difficultyLevel} onChange={(e) => upd(i, "difficultyLevel", e.target.value)}>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></div>
              </div>
            </div>
          )}
        </section>
      ))}

      <div className="flex justify-between items-center flex-wrap gap-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--s5)" }}>
        <button type="button" className="btn btn-ghost" onClick={() => { setQs([...qs, blank()]); setOpen(qs.length); }}><Icon name="plus" size={16} />Add question</button>
        <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <Loader size="sm" /> : `Create quiz (${qs.length})`}</button>
      </div>
    </form>
  );
}