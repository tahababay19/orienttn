# Orient TN

A standalone, login-free web app that turns a CV into a concrete job search for the Tunisian market. Works entirely on local heuristics — no AI required. Optional Claude AI enrichment available.

→ **http://localhost:4180** after `npm start`.

## What it does

1. **Drop your CV** (PDF, DOCX, TXT, MD — max 3.5 MB) or paste the text. Set your goal: CDI, CDD, stage PFE, SIVP, CIVP, alternance or freelance — plus city, mode and availability.
2. **Profile extraction** — skills, education, certificates, languages, level, professional archetype, completeness score, and gaps. Works locally; with an API key, Claude enriches it.
3. **Job matching** — pre-filled searches on Tanitjobs, Keejob, ANETI/SIVP-CIVP, LinkedIn and LCF Talents, plus live offers scored against your profile. Filters: all / CDI / stage.
4. **CV tailoring** — paste a Job Description, get a tailored A4 CV with keyword match score, evidence, and guardrails. Download HTML or print/PDF.
5. **Cover letter** — auto-generated in FR or EN, matched to the JD.
6. **Interview prep** — technical, behavioral, and role-specific questions with STAR guidance.
7. **Gap roadmap** — learning plan for missing skills with resources and mini-projects.
8. **Application tracker** — save jobs, export/import JSON, runs in browser (localStorage).
9. **CV versions** — save, reload, delete tailored CVs locally.
10. **FR / AR / EN** — full language switch with RTL support. Loading animation on switch.

## Run locally

```bash
cd orient-tn
npm install
npm start          # or: npm run dev  (auto-reload)
npm run check      # syntax check
```

Node 18+. Port can be changed with `PORT=5000 npm start`.

### Enable AI analysis (optional)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

The app calls Claude with a strict JSON schema and a "no invented facts" rule, then merges into the heuristic baseline. Falls back to heuristic on any failure. `ANTHROPIC_AUTH_TOKEN` also accepted.

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel link
vercel env add ANTHROPIC_API_KEY production   # optional
vercel --prod
```

`vercel.json` routes `api/*.js` to `@vercel/node` and `public/**` to static files.

## Privacy & scope

- No login, no account, no database, no server sessions. CV files are read into memory and never written to disk.
- Profile stored only in browser `localStorage`. Restart/clear buttons wipe it.
- CV text sent to Anthropic **only** when an API key is configured.
- Nothing submitted to employers. Only search links and scored offers.
- Live offers from public RemoteOK / Jobicy / Remotive APIs (cached 2h). If they fail, Tunisian portals still work.
- Scores are indicative — verify every offer at the source.

## API

| Route | Method | Body | Result |
|---|---|---|---|
| `/api/health` | GET | — | engine + source availability |
| `/api/analyze` | POST | `{ file?:{name,data}, text?, goals }` | `{ profile }` with `engine: 'ai' \| 'heuristic'` |
| `/api/jobs` | POST | `{ profile, contract }` | `{ links, jobs, liveCount, notice }` |
| `/api/cv` | POST | `{ profile, jdText, jdTitle?, lang? }` | `{ html, filename, match, skills, evidence, guardrails }` |
| `/api/extract` | POST | `{ file:{name,data} }` or `{ text }` | `{ text, chars }` |
| `/api/cover-letter` | POST | `{ profile, jdText, jdTitle?, company?, lang? }` | `{ text, html, subject, matched }` |
| `/api/interview-prep` | POST | `{ profile, jdText, jdTitle?, lang? }` | `{ technical, behavioral, roleQuestions, gapsToPrepare }` |
| `/api/gap-roadmap` | POST | `{ profile, jdText, lang? }` | `{ missing, roadmap }` |

Body capped at 4 MB. CV files at 3.5 MB.

## Tech

- **No framework** — one Node HTTP server + thin Vercel functions, static HTML/CSS/JS
- **Heuristic engine** — regex-based extraction, no LLM needed
- **Optional AI** — Claude structured output via `@anthropic-ai/sdk` (beta API)
- **Design** — Crimson Pro + Work Sans + Noto Sans Arabic, dark navy/blue/green palette