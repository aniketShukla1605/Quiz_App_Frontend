import { useState, useEffect, useCallback } from "react";
import { getAllQuestions, getQuestionsByCategory, addQuestion } from "../../services/questionService";
import Loader, { Skeleton } from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { EmptyState, ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";
import { CATEGORIES, DIFFICULTIES } from "../../utils/Categories";

const BLANK = { questionTitle: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "", difficultyLevel: "Medium", category: "" };
const L = ["A", "B", "C", "D"];

function Row({ q, i }) {
  const [open, setOpen] = useState(false);
  return (
    <li style={{ borderTop: "1px solid var(--border)" }}>
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex items-center gap-4 w-full" style={{ background: "none", border: 0, font: "inherit", color: "var(--text)", padding: "var(--s4) 0", textAlign: "left" }}>
        <span style={{ width: 28, color: "var(--text-3)" }}>{i + 1}</span>
        <span style={{ flex: 1, fontWeight: 500 }}>{q.questionTitle}</span>
        {q.category && <span className="badge">{q.category}</span>}
        {q.difficultyLevel && <span className="badge badge-accent">{q.difficultyLevel}</span>}
      </button>
      {open && (
        <div style={{ padding: "0 0 var(--s4) 44px", display: "grid", gap: "var(--s2)", animation: "fadeUp .2s" }}>
          {L.map((l) => { const v = q[`option${l}`], ok = v === q.correctAnswer; return (
            <div key={l} className="flex items-center gap-2" style={{ color: ok ? "var(--green)" : "var(--text-2)", fontWeight: ok ? 600 : 400 }}>
              <span style={{ width: 20 }}>{ok ? <Icon name="check" size={16} /> : l}</span>{v}{ok && <span className="badge badge-green">Correct</span>}
            </div>); })}
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>Question ID {q.id}</span>
        </div>
      )}
    </li>
  );
}

export default function QuestionBank() {
  const [qs, setQs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [cat, setCat] = useState("");
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const load = useCallback(() => {
    setStatus("loading");
    (cat ? getQuestionsByCategory(cat) : getAllQuestions())
      .then((r) => { setQs(r.data || []); setStatus("ready"); })
      .catch((e) => { setError(explain(e, "load the question bank")); setStatus("error"); });
  }, [cat]);
  useEffect(() => { load(); }, [load]);

  const shown = qs.filter((q) => !search || q.questionTitle?.toLowerCase().includes(search.toLowerCase()));

  const save = async (e) => {
    e.preventDefault();
    if (!form.questionTitle.trim() || !form.category || !L.every((l) => form[`option${l}`].trim())) return setFormErr("Fill in the question, all four options and a subject.");
    if (!L.some((l) => form[`option${l}`] === form.correctAnswer)) return setFormErr("Choose which option is correct.");
    setSaving(true); setFormErr("");
    try { await addQuestion(form); setForm(BLANK); setAdding(false); load(); }
    catch (err) { setFormErr(explain(err, "save the question")); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="flex justify-between items-end flex-wrap gap-4" style={{ marginBottom: "var(--s6)" }}>
        <div><h1 style={{ fontSize: 40 }}>Question bank</h1>
          {status === "ready" && <p style={{ color: "var(--text-2)" }}>{qs.length} {qs.length === 1 ? "question" : "questions"}{cat && ` in ${cat}`}</p>}</div>
        <button className={`btn ${adding ? "btn-ghost" : "btn-primary"}`} onClick={() => setAdding(!adding)}>{adding ? "Cancel" : <><Icon name="plus" size={16} />Add question</>}</button>
      </div>

      {adding && (
        <form onSubmit={save} noValidate style={{ display: "grid", gap: "var(--s4)", padding: "var(--s5) 0 var(--s6)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", marginBottom: "var(--s6)", animation: "fadeUp .25s" }}>
          {formErr && <ErrorState message={formErr} />}
          <div><label className="input-label">Question</label><textarea className="input" rows={2} value={form.questionTitle} onChange={(e) => setForm({ ...form, questionTitle: e.target.value })} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s3)" }}>
            {L.map((l) => <div key={l}><label className="input-label">Option {l}</label><input className="input" value={form[`option${l}`]} onChange={(e) => setForm({ ...form, [`option${l}`]: e.target.value })} /></div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--s3)" }}>
            <div><label className="input-label">Correct answer</label><select className="input" value={form.correctAnswer} onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}><option value="">Choose</option>{L.filter((l) => form[`option${l}`]).map((l) => <option key={l} value={form[`option${l}`]}>{l}: {form[`option${l}`]}</option>)}</select></div>
            <div><label className="input-label">Subject</label><select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Choose</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="input-label">Difficulty</label><select className="input" value={form.difficultyLevel} onChange={(e) => setForm({ ...form, difficultyLevel: e.target.value })}>{DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}</select></div>
          </div>
          <div><button className="btn btn-primary" disabled={saving}>{saving ? <Loader size="sm" /> : "Save question"}</button></div>
        </form>
      )}

      <div className="flex gap-3 flex-wrap" style={{ marginBottom: "var(--s5)" }}>
        <input className="input" style={{ maxWidth: 300 }} type="search" aria-label="Search questions" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 220 }} aria-label="Subject" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All subjects</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>

      {status === "loading" && <Skeleton count={6} h={52} />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}
      {status === "ready" && shown.length === 0 && (qs.length === 0
        ? <EmptyState icon="book" title={cat ? `No ${cat} questions yet` : "Your question bank is empty"} body="Add questions here, then use them to build quizzes." action={<button className="btn btn-primary" onClick={() => setAdding(true)}>Add the first question</button>} />
        : <EmptyState icon="search" title="No matches" body={`Nothing matches "${search}". Try fewer words or another subject.`} action={<button className="btn btn-ghost" onClick={() => { setSearch(""); setCat(""); }}>Clear filters</button>} />)}
      {status === "ready" && shown.length > 0 && <ul style={{ listStyle: "none" }}>{shown.map((q, i) => <Row key={q.id ?? i} q={q} i={i} />)}</ul>}
    </div>
  );
}