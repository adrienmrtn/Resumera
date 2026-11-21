"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Resume, TailorResult } from "@/lib/schema";

type Saved = { id: string; date: string; result: TailorResult };
const STORE = "resumera.history.v1";
const WAIT_LINES = [
  "Reading your résumé…",
  "Picking out what the recruiter is screening for…",
  "Rewording your experience in the posting's vocabulary…",
  "Checking that nothing was invented…",
  "Scoring the match…",
];

function loadHistory(): Saved[] {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved[]) : [];
  } catch {
    return [];
  }
}
function saveHistory(items: Saved[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(items.slice(0, 20)));
  } catch {
    /* storage unavailable: history is a convenience only */
  }
}

function resumeToText(r: Resume): string {
  const out: string[] = [r.name, r.headline, r.contact.join(" | "), ""];
  if (r.summary) out.push("SUMMARY", r.summary, "");
  if (r.experience.length) {
    out.push("EXPERIENCE");
    for (const e of r.experience) {
      out.push(`${[e.role, e.company].filter(Boolean).join(", ")} | ${e.dates}`);
      if (e.location) out.push(e.location);
      for (const b of e.bullets) out.push(`- ${b}`);
      out.push("");
    }
  }
  if (r.education.length) {
    out.push("EDUCATION");
    for (const e of r.education) out.push(`${[e.degree, e.school].filter(Boolean).join(", ")} | ${e.dates}${e.details ? `\n${e.details}` : ""}`);
    out.push("");
  }
  if (r.skills.length) out.push("SKILLS", r.skills.join(", "), "");
  for (const x of r.extras) if (x.items.length) out.push(x.title.toUpperCase(), x.items.join(", "), "");
  return out.join("\n").trim();
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s: string) => s.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "resume";

/** Inline-editable text. Commits on blur; Enter commits instead of adding a line break. */
function E({ value, onChange, as: Tag = "span", className, multiline }: { value: string; onChange: (v: string) => void; as?: "span" | "p" | "li" | "b" | "div"; className?: string; multiline?: boolean }) {
  return (
    <Tag
      className={className}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(e) => {
        const next = (multiline ? e.currentTarget.innerText : e.currentTarget.textContent) ?? "";
        if (next !== value) onChange(next.trim());
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}

export default function Tailor() {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");
  const [letter, setLetter] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TailorResult | null>(null);
  const [currentId, setCurrentId] = useState("");
  const [tab, setTab] = useState<"resume" | "letter">("resume");
  const [history, setHistory] = useState<Saved[]>([]);
  const [waitLine, setWaitLine] = useState(0);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => setHistory(loadHistory()), []);

  useEffect(() => {
    if (status !== "loading") return;
    setWaitLine(0);
    const t = setInterval(() => setWaitLine((n) => Math.min(n + 1, WAIT_LINES.length - 1)), 6000);
    return () => clearInterval(t);
  }, [status]);

  const persist = useCallback((id: string, next: TailorResult) => {
    setHistory((prev) => {
      const existing = prev.find((h) => h.id === id);
      const item: Saved = { id, date: existing?.date ?? new Date().toISOString(), result: next };
      const items = [item, ...prev.filter((h) => h.id !== id)];
      saveHistory(items);
      return items.slice(0, 20);
    });
  }, []);

  const hasCv = mode === "file" ? !!file : cvText.trim().length >= 100;
  const ready = hasCv && jobText.trim().length >= 80;

  async function submit() {
    setError("");
    setStatus("loading");
    const body = new FormData();
    if (mode === "file" && file) body.set("file", file);
    else body.set("cvText", cvText);
    body.set("jobText", jobText);
    if (letter) body.set("letter", "1");
    try {
      const res = await fetch("/api/tailor", { method: "POST", body });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error || "Something went wrong. Please try again.");
      const id = crypto.randomUUID();
      setResult(data as TailorResult);
      setCurrentId(id);
      setTab("resume");
      setStatus("done");
      persist(id, data as TailorResult);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  function patch(fn: (r: Resume) => void) {
    if (!result) return;
    const next = structuredClone(result);
    fn(next.resume);
    setResult(next);
    persist(currentId, next);
  }
  function setLetterText(text: string) {
    if (!result) return;
    const next = { ...result, cover_letter: text };
    setResult(next);
    persist(currentId, next);
  }

  function flash(msg: string) {
    setNote(msg);
    setTimeout(() => setNote(""), 2500);
  }

  async function downloadPdf() {
    if (!result) return;
    try {
      const { resumePdf, letterPdf } = await import("@/lib/pdf");
      if (tab === "letter" && result.cover_letter) {
        download(await letterPdf(result.resume, result.cover_letter), `${slug(result.resume.name)}-cover-letter.pdf`);
      } else {
        download(await resumePdf(result.resume), `${slug(result.resume.name)}-resume.pdf`);
      }
    } catch {
      flash("The PDF could not be created. Try again.");
    }
  }

  async function copyText() {
    if (!result) return;
    const text = tab === "letter" ? result.cover_letter : resumeToText(result.resume);
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied");
    } catch {
      flash("Copy failed. Select the text and copy it manually.");
    }
  }

  function pick(f: File | null | undefined) {
    if (!f) return;
    setFile(f);
    setError("");
  }

  if (status === "loading") {
    return (
      <div className="w">
        <div className="wait" role="status" aria-live="polite">
          <div className="spin" />
          <h2>Tailoring your résumé</h2>
          <p>{WAIT_LINES[waitLine]}</p>
        </div>
        <p className="hint" style={{ margin: "18px auto 0" }}>This usually takes under a minute. Keep this tab open.</p>
      </div>
    );
  }

  if (status === "done" && result) {
    const r = result.resume;
    const found = result.keywords.filter((k) => k.in_tailored);
    const missing = result.keywords.filter((k) => !k.in_tailored);
    return (
      <div className="w">
        {result.demo && <p className="banner">Demo mode: no AI key is configured on this server, so this is a sample result, not your résumé.</p>}
        <div className="r-head">
          <div>
            <h1>{result.job.title || "Your tailored résumé"}</h1>
            <p>{result.job.company ? `Tailored for ${result.job.company}. ` : ""}Click any text to edit it before you download.</p>
          </div>
          <button className="btn soft" onClick={() => { setStatus("idle"); setResult(null); }}>Tailor another</button>
        </div>

        <div className="result">
          <div>
            {result.cover_letter && (
              <div className="tabs" role="tablist">
                <button role="tab" aria-selected={tab === "resume"} onClick={() => setTab("resume")}>Résumé</button>
                <button role="tab" aria-selected={tab === "letter"} onClick={() => setTab("letter")}>Cover letter</button>
              </div>
            )}

            {tab === "letter" && result.cover_letter ? (
              <div className="paper">
                <E as="div" multiline className="letter" value={result.cover_letter} onChange={setLetterText} />
              </div>
            ) : (
              <div className="paper">
                <E as="p" className="p-name" value={r.name} onChange={(v) => patch((x) => { x.name = v; })} />
                <E as="p" className="p-head" value={r.headline} onChange={(v) => patch((x) => { x.headline = v; })} />
                <E as="p" className="p-contact" value={r.contact.join("  |  ")} onChange={(v) => patch((x) => { x.contact = v.split("|").map((c) => c.trim()).filter(Boolean); })} />

                {r.summary && (<><p className="p-h">Summary</p><E as="p" value={r.summary} onChange={(v) => patch((x) => { x.summary = v; })} /></>)}

                {r.experience.length > 0 && <p className="p-h">Experience</p>}
                {r.experience.map((e, i) => (
                  <div className="p-job" key={i}>
                    <div className="p-row">
                      <b><E value={e.role} onChange={(v) => patch((x) => { x.experience[i].role = v; })} />, <E value={e.company} onChange={(v) => patch((x) => { x.experience[i].company = v; })} /></b>
                      <E value={e.dates} onChange={(v) => patch((x) => { x.experience[i].dates = v; })} />
                    </div>
                    {e.location && <E as="p" className="p-loc" value={e.location} onChange={(v) => patch((x) => { x.experience[i].location = v; })} />}
                    <ul>
                      {e.bullets.map((b, j) => (
                        <E as="li" key={`${j}-${b}`} value={b} onChange={(v) => patch((x) => { if (v) x.experience[i].bullets[j] = v; else x.experience[i].bullets.splice(j, 1); })} />
                      ))}
                    </ul>
                  </div>
                ))}

                {r.education.length > 0 && <p className="p-h">Education</p>}
                {r.education.map((e, i) => (
                  <div className="p-job" key={i}>
                    <div className="p-row">
                      <b><E value={e.degree} onChange={(v) => patch((x) => { x.education[i].degree = v; })} />, <E value={e.school} onChange={(v) => patch((x) => { x.education[i].school = v; })} /></b>
                      <E value={e.dates} onChange={(v) => patch((x) => { x.education[i].dates = v; })} />
                    </div>
                    {e.details && <E as="p" className="p-loc" value={e.details} onChange={(v) => patch((x) => { x.education[i].details = v; })} />}
                  </div>
                ))}

                {r.skills.length > 0 && (<><p className="p-h">Skills</p><E as="p" value={r.skills.join(", ")} onChange={(v) => patch((x) => { x.skills = v.split(",").map((s) => s.trim()).filter(Boolean); })} /></>)}

                {r.extras.map((x0, i) => x0.items.length > 0 && (
                  <div key={i}>
                    <p className="p-h">{x0.title}</p>
                    <E as="p" value={x0.items.join(", ")} onChange={(v) => patch((x) => { x.extras[i].items = v.split(",").map((s) => s.trim()).filter(Boolean); })} />
                  </div>
                ))}
              </div>
            )}
            <p className="edit-note">Edits are saved on this device. To remove a bullet, clear its text.</p>
          </div>

          <aside className="panel">
            <div className="box paint">
              <p className="cap">Match score</p>
              <div className="big-score"><s>{result.score.before}</s>{result.score.after}</div>
              <p>{result.score.found} of {result.score.total} keywords from the posting are in your résumé. Must-haves count double.</p>
            </div>

            <div className="box">
              <div className="actions">
                <button className="btn" onClick={downloadPdf}>Download {tab === "letter" ? "letter" : "résumé"} as PDF</button>
                <button className="btn soft" onClick={copyText}>Copy as text</button>
              </div>
              {note && <p className="hint" style={{ marginTop: 10 }} role="status">{note}</p>}
            </div>

            <div className="box">
              <p className="cap">Found in your résumé</p>
              <div className="kws">{found.map((k) => <span key={k.term} className={k.importance}>{k.term}</span>)}</div>
              {missing.length > 0 && (
                <>
                  <p className="cap">Missing from your background</p>
                  <div className="kws miss">{missing.map((k) => <span key={k.term} className={k.importance}>{k.term}</span>)}</div>
                  <p className="hint" style={{ textAlign: "left", marginTop: 12 }}>Resumera never adds these for you. If you do have one, add it to your résumé yourself.</p>
                </>
              )}
            </div>

            {result.changes.length > 0 && (
              <div className="box">
                <p className="cap">What changed</p>
                <ul className="changes">{result.changes.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="w">
      <h1>Tailor your <i>résumé</i></h1>
      <p className="lead">Add your résumé and the job posting. You get a tailored version, a match score and a PDF.</p>

      <div className="inputs">
        <section className="card">
          <div className="card-h"><span className="num">1</span><h2>Your résumé</h2></div>
          <div className="seg">
            <button aria-pressed={mode === "file"} onClick={() => setMode("file")}>Upload a file</button>
            <button aria-pressed={mode === "text"} onClick={() => setMode("text")}>Paste text</button>
          </div>
          {mode === "file" ? (
            <div
              className={`drop${over ? " over" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => input.current?.click()}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }}
              onDragOver={(e) => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
            >
              <input id="cv-file" ref={input} type="file" hidden accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={(e) => pick(e.target.files?.[0])} />
              {file ? (
                <>
                  <span className="file">{file.name}</span>
                  <span>Click to choose another file</span>
                </>
              ) : (
                <>
                  <strong>Drop your résumé here</strong>
                  <span>or click to choose a file. PDF or Word (.docx), up to 5 MB.</span>
                </>
              )}
            </div>
          ) : (
            <textarea id="cv-text" aria-label="Résumé text" placeholder="Paste the full text of your résumé…" value={cvText} onChange={(e) => setCvText(e.target.value)} />
          )}
        </section>

        <section className="card">
          <div className="card-h"><span className="num">2</span><h2>The job posting</h2></div>
          <textarea id="job-text" aria-label="Job posting" placeholder="Paste the full job description: responsibilities, requirements, nice-to-haves…" value={jobText} onChange={(e) => setJobText(e.target.value)} />
          <p className="count">{jobText.trim().length.toLocaleString("en-US")} characters</p>
        </section>
      </div>

      <div className="go">
        <label className="check"><input id="with-letter" type="checkbox" checked={letter} onChange={(e) => setLetter(e.target.checked)} />Also write a matching cover letter</label>
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn" disabled={!ready} onClick={submit}>Tailor my résumé</button>
        <p className="hint">{ready ? "Your documents are sent to the AI to produce the result and are not stored on our servers." : "Add your résumé and at least a few sentences of the job posting to continue."}</p>
      </div>

      {history.length > 0 && (
        <section className="history">
          <h2>Your applications</h2>
          <p>Saved in this browser only.</p>
          <div className="h-list">
            {history.map((h) => (
              <button className="h-item" key={h.id} onClick={() => { setResult(h.result); setCurrentId(h.id); setTab("resume"); setStatus("done"); window.scrollTo({ top: 0 }); }}>
                <span><b>{h.result.job.title || "Untitled role"}</b><small>{[h.result.job.company, new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })].filter(Boolean).join(" · ")}</small></span>
                <em>{h.result.score.after}</em>
              </button>
            ))}
          </div>
          <p className="center"><button className="link" onClick={() => { saveHistory([]); setHistory([]); }}>Clear history</button></p>
        </section>
      )}
    </div>
  );
}
