# Orient TN

A standalone, login-free MVP that turns a CV into a concrete job search for the Tunisian market.

→ **http://localhost:4180** after `npm start`.

## What it does

1. Drop a PDF/DOCX/TXT/MD CV (max 3.5 MB) or paste the text, then set your goal: CDI, CDD, stage PFE, SIVP, CIVP, alternance or freelance — plus city, mode and availability.
2. The app reads your profile: skills, education, certificates, languages and level, a professional archetype, a completeness score and the gaps to close. **With an API key configured this is done by Claude inside the app**; without one it falls back to a deterministic local extractor, clearly labelled in the UI.
3. It generates pre-filled searches on **Tanitjobs, Keejob, ANETI/SIVP-CIVP, LinkedIn and LCF Talents**, then scores live offers against your profile with visible reasons. Filters: all / CDI / stage.
4. FR / AR / EN switch with full RTL support. Animated throughout, with a reduced-motion fallback. Nothing is ever auto-applied to — you apply yourself at the source.

## Run locally

```bash
cd orient-tn
npm install
npm start          # or: npm run dev  (auto-reload)
npm run check      # syntax check
```

Node 18+. Port can be changed with `PORT=5000 npm start`.

### Enable in-app AI analysis (optional)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

The server calls Claude with a strict JSON schema and a "no invented facts" instruction, then merges the result into the deterministic baseline. The UI shows an **"AI analysis"** badge when this path is used. If the key is missing, the API times out or the model refuses, the app silently falls back to the local extractor and shows a **"Local analysis"** badge plus a short notice — the user always gets a usable profile. `ANTHROPIC_AUTH_TOKEN` is also accepted.

## Deploy to Vercel

The app is fully stateless: the extracted profile is returned to the browser, kept in `localStorage` (`orient-tn-profile`) and POSTed back to `/api/jobs`. No sessions, no database — so it runs on serverless functions unchanged.

```bash
npm i -g vercel      # if not installed
vercel login
vercel link
vercel env add ANTHROPIC_API_KEY production   # omit to run in local-analysis mode
vercel --prod
```

`vercel.json` routes `api/*.js` to `@vercel/node` and `public/**` to static files. Set `ANTHROPIC_API_KEY` in the Vercel project (Settings → Environment Variables) to enable AI in production.

## API

| Route | Method | Body | Result |
| --- | --- | --- | --- |
| `/api/health` | GET | — | engine + source availability |
| `/api/analyze` | POST | `{ file?:{name,data}, text?, goals }` | `{ profile }` with `engine: 'ai' \| 'heuristic'` |
| `/api/jobs` | POST | `{ profile, contract }` | `{ links, jobs, liveCount, notice }` |

Request body is capped at 4 MB and CV files at 3.5 MB (below Vercel's body limit).

## Privacy & scope

- No login, no account, no database, no server sessions. CV files are read into memory, analysed and **never written to disk**.
- The extracted profile is stored only in your browser's `localStorage` so a refresh keeps your results; the restart button clears it.
- CV text is sent to Anthropic **only** when an API key is configured; otherwise extraction stays on the server/edge and no third-party LLM sees it.
- Nothing is submitted to any employer. The app only prepares searches and links.
- Live offers come from public RemoteOK / Jobicy / Remotive APIs (2 h cache, short timeouts). If they fail, the Tunisian portals still work.
- The Tunisia portals are matched **search links**, not a scraped local job board. Scores are indicative, not a guarantee — verify every offer at the source.

## Where the code came from

- `lib/profile.mjs` — archetype/gap heuristics from `career-ops/dashboard/ops.mjs`; PDF/DOCX extraction pattern from `UtopiaHire/server/src/routes/resume.ts`.
- `lib/jobs.mjs` — public feed fetchers from `career-ops/dashboard/server.mjs`; Tunisia channels from market research.
- `lib/ai.mjs` — Claude structured-output enrichment (`@anthropic-ai/sdk`), built with the `claude-api` skill.
- `design-system/orient-tn/MASTER.md` — generated with `ui-ux-pro-max`.

No framework: one Node HTTP server (plus thin Vercel functions), static HTML/CSS/JS.
