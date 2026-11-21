import Link from "next/link";
import "./landing.css";

const STEPS = [
  ["Add your résumé", "Upload a PDF or Word file, or paste the text. Resumera reads your experience, skills and education."],
  ["Paste the job posting", "Drop in the full text of the ad. The skills and keywords the recruiter expects are picked out for you."],
  ["Download the tailored résumé", "Review it, edit anything, then export a clean PDF. The score shows what is still missing."],
];

const PLANS = [
  {
    name: "Free beta",
    price: "$0",
    per: "",
    desc: "Everything Resumera does today, while we are in beta.",
    items: ["Tailored résumés, with a fair-use limit", "Match score and missing keywords", "Matching cover letter", "ATS-friendly PDF export"],
    cta: "Tailor my résumé",
    live: true,
  },
  {
    name: "Active search",
    price: "$12",
    per: "/month",
    desc: "For applying every week. Cancel in one click.",
    items: ["Unlimited tailored résumés", "More templates, Word export", "Browser extension", "History synced across devices"],
    cta: "Coming soon",
    live: false,
  },
  {
    name: "Sprint",
    price: "$5",
    per: "/week",
    desc: "Seven days of full access. No renewal.",
    items: ["Everything in Active search", "One-time payment", "Your résumés stay available after"],
    cta: "Coming soon",
    live: false,
  },
];

const FAQ = [
  [
    "Does Resumera invent experience?",
    "No. The rewrite only uses what is already in your résumé. If the job asks for a skill you never mention, it shows up in the list of gaps, not in the résumé.",
  ],
  [
    "What does the match score measure?",
    "It compares the skills and keywords in the job posting with the ones found in your résumé, before and after tailoring. Must-have keywords count double. It is an indicator, not a promise of an interview.",
  ],
  [
    "Which formats can I use?",
    "You can upload a PDF or a Word (.docx) file, or paste plain text. The tailored résumé and the cover letter download as PDFs with real, selectable text.",
  ],
  [
    "What happens to my data?",
    "Your résumé and the job posting are sent to Anthropic's Claude API to produce the result. Resumera has no accounts and keeps no copy on its servers: your history is stored in your browser only, and you can clear it at any time.",
  ],
];

export default function Landing() {
  return (
    <main className="d5">
      <header className="nav w">
        <Link className="logo" href="/">Resumera</Link>
        <nav className="nav-l" aria-label="Sections">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link className="btn" href="/app">Try it free</Link>
      </header>

      <div className="hero w">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="float" src="/img/pencil.jpg" alt="" width={190} height={190} />
        <span className="badge"><b>Beta</b>Free while we are in beta</span>
        <h1>A résumé <i>tailored</i> to every job.</h1>
        <span className="hand">in about a minute!</span>
        <p className="lead">
          Paste a job posting. Resumera rewrites your résumé in the recruiter&apos;s words and shows your match score. Nothing invented, everything editable.
        </p>
        <div className="cta">
          <Link className="btn" href="/app">Tailor my résumé</Link>
          <a className="btn soft" href="#how">See how it works</a>
        </div>

        <div className="stage">
          <div className="app">
            <div className="app-bar"><span /><span /><span /><em>Resumera · Digital Marketing Manager, Nordlys</em></div>
            <div className="side">
              <p className="cap">My applications</p>
              <div className="offer on"><div><b>Nordlys</b><small>Digital Marketing Mgr</small></div><em>91</em></div>
              <div className="offer"><div><b>Atelier Mirabel</b><small>CRM Project Lead</small></div><em>84</em></div>
              <div className="offer"><div><b>Kobalt</b><small>Growth Manager</small></div><em>77</em></div>
            </div>
            <div className="doc cv">
              <p className="cv-n">Camille Roussel</p>
              <p className="cv-r">Digital Marketing Project Manager · Lyon</p>
              <p className="cv-h">Experience</p>
              <p className="cv-j">Digital Project Manager, Studio Lumen · 2022–2025</p>
              <ul>
                <li>Ran 4 <mark>B2B social</mark> accounts: +38% <mark>engagement</mark> in 6 months</li>
                <li>Rebuilt the <mark>acquisition</mark> funnel with the <mark>CRM</mark> team (HubSpot)</li>
                <li>Owned a €120k <mark>paid media</mark> budget, weekly <mark>reporting</mark> to leadership</li>
              </ul>
              <p className="cv-h">Skills</p>
              <p>SEO · HubSpot · Google Analytics 4 · Budget management · Notion</p>
            </div>
            <div className="insp">
              <p className="cap">Match</p>
              <div className="sc"><div className="ring"><b>91</b></div><p><strong>62 → 91 out of 100</strong>14 of 17 keywords</p></div>
              <p className="cap">Found in your résumé</p>
              <div className="kw"><span>acquisition</span><span>paid media</span><span>CRM</span><span>reporting</span><span>B2B</span></div>
              <p className="cap">Not in your background</p>
              <div className="kw miss"><span>marketing automation</span><span>ABM</span><span>German C1</span></div>
            </div>
          </div>
        </div>
        <p className="ex">Fictional example</p>
      </div>

      <section id="features"><div className="w">
        <div className="head"><h2>Everything you need to <i>answer the ad.</i></h2><p className="sub">From the job posting to the PDF you send, in one place.</p></div>
        <div className="bento">
          <article className="b b1"><h3>Match score</h3><p>What the posting asks for, and what your résumé still lacks</p>
            <div className="viz"><div className="sheet bleed"><div className="sc"><div className="ring"><b>91</b></div><p><strong>62 → 91 out of 100</strong>14 of 17 keywords</p></div>
              <div className="row"><span>paid media</span><em>Found</em></div><div className="row"><span>reporting</span><em>Found</em></div><div className="row"><span>marketing automation</span><em className="no">Missing</em></div><div className="row"><span>German C1</span><em className="no">Missing</em></div></div></div></article>
          <article className="b b2"><h3>Faithful rewrite</h3><p>Your own experience, reworded for this job</p>
            <div className="viz"><div className="stack"><div className="sheet s-a"><b>Before</b><s>In charge of social media.</s></div><div className="sheet s-b"><b>After</b>Ran 4 <mark>B2B social</mark> accounts: +38% <mark>engagement</mark> in 6 months.</div></div></div></article>
          <article className="b b3"><h3>Matching letter</h3><p>A cover letter written for this role, from the same facts</p>
            <div className="viz"><div className="sheet bleed"><span>Dear hiring team,</span>Your posting describes the job I have been doing for three years at Studio Lumen: driving acquisition, owning a budget and reporting every week…</div></div></article>
          <article className="b b4"><h3>ATS-friendly PDF</h3><p>One column, standard headings, real text</p>
            <div className="viz"><div className="stack" aria-hidden="true"><div className="tpl"><u /><u /><u /><u /><u /><u /><u /></div><div className="tpl"><u /><u /><u /><u /><u /><u /><u /></div><div className="tpl"><u /><u /><u /><u /><u /><u /><u /></div></div></div></article>
          <article className="b b5"><span className="soon">Coming soon</span><h3>Extension</h3><p>Tailor your résumé straight from the job page</p>
            <div className="viz"><div className="brow"><div className="brow-u">jobs.example.com/posting/marketing-manager</div><div className="brow-c"><b>Digital Marketing Manager</b><small>Nordlys · Lyon, hybrid</small><u /><u style={{ width: "70%" }} /><span className="btn" aria-hidden="true">Tailor with Resumera</span></div></div></div></article>
          <article className="b b6"><h3>History</h3><p>Every version kept with its job and its score, on your device</p>
            <div className="viz"><div className="stack"><div className="sheet s-c"><b>This week</b><div className="li">Kobalt<small>77</small></div><div className="li" style={{ ["--k" as string]: "var(--lilac)" }}>Atelier Mirabel<small>84</small></div><div className="li" style={{ ["--k" as string]: "var(--yel)" }}>Maison Orphée</div><div className="li">Verso</div></div><div className="sheet s-d"><b>Best matches</b><div className="li" style={{ ["--k" as string]: "var(--green)" }}>Nordlys<small>91</small></div><div className="li" style={{ ["--k" as string]: "var(--pink)" }}>Atelier Mirabel<small>84</small></div><div className="li" style={{ ["--k" as string]: "var(--green)" }}>Verso</div></div></div></div></article>
        </div>
      </div></section>

      <section id="how" style={{ paddingTop: 0 }}><div className="w">
        <div className="head"><h2>Three steps, <i>and it&apos;s sent.</i></h2></div>
        <ol className="steps">
          {STEPS.map(([title, text], i) => (
            <li className="step" key={title}><span className="step-n">{i + 1}</span><h3>{title}</h3><p>{text}</p></li>
          ))}
        </ol>
      </div></section>

      <section id="pricing" style={{ paddingTop: 0 }}><div className="w">
        <div className="head"><h2>Free to start, <i>simple after.</i></h2><p className="sub">The beta is free. Paid plans arrive later, for heavy job searches.</p></div>
        <div className="plans">
          {PLANS.map((p) => (
            <article className={`plan${p.live ? " pro" : ""}`} key={p.name}>
              {!p.live && <span className="soon">Coming soon</span>}
              <h3>{p.name}</h3>
              <p className="price"><b>{p.price}</b><span>{p.per}</span></p>
              <p className="plan-d">{p.desc}</p>
              <ul>{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
              {p.live ? <Link className="btn" href="/app">{p.cta}</Link> : <span className="btn" aria-disabled="true">{p.cta}</span>}
            </article>
          ))}
        </div>
      </div></section>

      <section id="faq" style={{ paddingTop: 0 }}><div className="w">
        <div className="head"><h2>Frequently asked <i>questions</i></h2></div>
        <div className="faq">
          {FAQ.map(([q, a], i) => (
            <details key={q} open={i === 0}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
      </div></section>

      <div className="w">
        <div className="end">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/plane.jpg" alt="" width={280} height={210} />
          <h2>Your next application <i>goes out tonight.</i></h2>
          <p>Free while in beta. No account, no credit card.</p>
          <Link className="btn" href="/app">Tailor my résumé</Link>
        </div>
        <footer className="foot"><span>© 2026 Resumera</span><span>Built for job seekers, not for keyword stuffing.</span></footer>
      </div>
    </main>
  );
}
