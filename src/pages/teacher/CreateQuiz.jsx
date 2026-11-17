import { useState } from "react";
import { createQuiz } from "../../services/quizService";
import Loader from "../../components/common/Loader";
import Icon from "../../components/common/Icon";
import { ErrorState } from "../../components/common/States";
import { explain } from "../../utils/errors";
import { CATEGORIES } from "../../utils/Categories";

const BLANK = { category: "", numOfQ: 10, title: "", duration: 30 };

export default function CreateQuiz() {
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setDone(""); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(form.numOfQ), d = Number(form.duration);
    if (!form.title.trim()) return setError("Give the quiz a title so students and rankings can find it.");
    if (!form.category) return setError("Choose a subject to draw questions from.");
    if (n < 1 || n > 50) return setError("Choose between 1 and 50 questions.");
    if (d < 5 || d > 180) return setError("Set a time limit between 5 and 180 minutes.");
    setLoading(true);
    try {
      await createQuiz({ category: form.category, numOfQ: n, title: form.title.trim(), duration: d });
      setDone(form.title.trim()); setForm(BLANK);
    } catch (err) { setError(explain(err, "create the quiz")); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 40, marginBottom: "var(--s2)" }}>Quick quiz</h1>
      <p style={{ color: "var(--text-2)", marginBottom: "var(--s6)" }}>We pick random questions from your bank for the subject you choose.</p>

      {done && (
        <div role="status" style={{ display: "flex", gap: "var(--s3)", padding: "var(--s4)", border: "1px solid var(--green)", borderRadius: "var(--radius)", color: "var(--green)", marginBottom: "var(--s5)" }}>
          <Icon name="check" /><span><b>"{done}" is ready.</b> Look up its ID in Rankings by title, then share it with your students.</span>
        </div>
      )}
      {error && <div style={{ marginBottom: "var(--s5)" }}><ErrorState message={error} /></div>}

      <form onSubmit={submit} noValidate style={{ display: "grid", gap: "var(--s5)" }}>
        <div><label className="input-label" htmlFor="t">Title</label>
          <input id="t" className="input" placeholder="Java basics, week 3" value={form.title} onChange={set("title")} /></div>
        <div><label className="input-label" htmlFor="c">Subject</label>
          <select id="c" className="input" value={form.category} onChange={set("category")}>
            <option value="">Choose a subject</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s4)" }}>
          <div><label className="input-label" htmlFor="n">Questions</label>
            <input id="n" className="input" type="number" min={1} max={50} value={form.numOfQ} onChange={set("numOfQ")} />
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--s1)" }}>1 to 50</p></div>
          <div><label className="input-label" htmlFor="d">Time limit (minutes)</label>
            <input id="d" className="input" type="number" min={5} max={180} value={form.duration} onChange={set("duration")} />
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: "var(--s1)" }}>5 to 180</p></div>
        </div>
        <p style={{ color: "var(--text-2)", paddingTop: "var(--s4)", borderTop: "1px solid var(--border)" }}>
          {form.title || "Untitled quiz"}: {form.numOfQ} {form.category || "subject"} questions in {form.duration} minutes.
        </p>
        <button className="btn btn-primary btn-lg" disabled={loading}>{loading ? <Loader size="sm" /> : "Create quiz"}</button>
      </form>
    </div>
  );
}