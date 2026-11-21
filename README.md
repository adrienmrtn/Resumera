# Resumera

Resumera tailors a résumé to one specific job posting. You add your résumé and the posting; it rewrites the résumé in the posting's vocabulary without inventing anything, scores the match before and after, lists the keywords you are still missing, writes a matching cover letter, and exports ATS-friendly PDFs.

## What is in this repo

| Path | What it does |
|---|---|
| `app/page.tsx`, `app/landing.css` | Landing page |
| `app/app/` | The tool: upload or paste a résumé, paste the posting, edit the result, download |
| `app/api/tailor/route.ts` | The one API route: reads the résumé (PDF, .docx or text) and calls Claude |
| `lib/schema.ts` | Shape of the AI output, and the match score calculation |
| `lib/prompt.ts` | Instructions given to the model |
| `lib/pdf.tsx` | PDF layout for the résumé and the cover letter |
| `lib/sample.ts` | Sample result used in demo mode |
| `lib/ratelimit.ts` | Per-IP hourly limit (10 requests), held in memory |

## Run it

```bash
npm install
```

```bash
cp .env.example .env.local
```

Put your Anthropic API key in `.env.local` as `ANTHROPIC_API_KEY`, then:

```bash
npm run dev
```

Without a key the site still runs, in **demo mode**: the tool returns a fixed sample result and says so in a banner.

## Deploy

Any host that runs Next.js works. On Vercel: import the repository, add the `ANTHROPIC_API_KEY` environment variable, deploy. The API route allows up to 300 seconds per request (`maxDuration`); a tailoring request normally finishes well under a minute.

## How the score works

The model lists 10 to 20 keywords from the posting, marks each as must-have or nice-to-have, and says whether it appears in the original résumé and in the tailored one. The score is the weighted share of keywords present (must-haves count double), out of 100. Editing the résumé by hand afterwards does not recompute it.

## Known limits

- No accounts and no payments. History is kept in the browser's local storage only.
- The rate limit is per server instance, so on serverless hosting it slows abuse down but does not cap spend. Set a spend limit on the API key.
- The paid plans and the browser extension shown on the landing page are marked "Coming soon" and are not built.
- Scanned (image-only) Word files are not read; PDFs are sent to the model as documents, so scanned PDFs generally work.
