# Orient TN — Agent Guide

## Project Overview

Orient TN is a **login-free, stateless** career orientation web app for the Tunisian job market. It turns a CV into a concrete job search: profile extraction, portal matching, CV tailoring, cover letter, interview prep, gap roadmap, and a local application tracker. No database, no auth, no server sessions.

**Stack:** Vanilla Node.js (ESM), static HTML/CSS/JS. No framework. Vercel-ready.

**Live:** http://localhost:4180 (dev) · Deployed via Vercel (`vercel --prod`)

## Directory Structure

```
orient-tn/
├── api/                    # Vercel serverless handlers (thin wrappers)
│   ├── analyze.js          # POST /api/analyze
│   ├── jobs.js             # POST /api/jobs
│   ├── cv.js               # POST /api/cv
│   ├── extract.js          # POST /api/extract
│   ├── cover-letter.js     # POST /api/cover-letter
│   ├── interview-prep.js   # POST /api/interview-prep
│   ├── gap-roadmap.js      # POST /api/gap-roadmap
│   └── health.js           # GET  /api/health
├── lib/                    # Core logic (pure functions, Vercel-safe)
│   ├── profile.mjs         # CV extraction (heuristic, no LLM)
│   ├── jobs.mjs            # Job scoring + Tunisia portal links
│   ├── ai.mjs              # Optional Claude enrichment (structured output)
│   ├── cv.mjs              # Tailored CV generator (A4 HTML)
│   ├── career.mjs          # Cover letter, interview prep, gap roadmap
│   └── handlers.mjs        # Shared request handlers + validation
├── public/                 # Static frontend
│   ├── index.html          # Single-page app (landing + studio)
│   ├── app.js              # All frontend logic (i18n, state, events)
│   ├── styles.css          # Design system + components
│   └── favicon.svg         # Favicon
├── design-system/          # Design tokens (reference)
├── server.mjs              # Local dev server (Node HTTP)
├── vercel.json             # Vercel routes + builds
├── package.json            # Scripts: start, dev, check
└── README.md               # User-facing docs
```

## Key Commands

```bash
npm start          # Run local server (port 4180, or PORT= env)
npm run dev        # Auto-reload dev mode
npm run check      # Syntax check all files (node --check)
vercel --prod      # Deploy to Vercel
```

## Architecture

### Data Flow
1. User uploads/pastes CV → `POST /api/analyze` → `analyzeProfile()` extracts profile (heuristic)
2. Profile stored in `localStorage` (`orient-tn-profile`), returned to browser
3. User clicks "Voir mes opportunités" → `POST /api/jobs` → `scoreJob()` + portal links
4. User pastes JD → `POST /api/cv` → `generateTailoredCV()` → A4 HTML CV
5. Cover letter / prep / gap → `POST /api/cover-letter|/api/interview-prep|/api/gap-roadmap`

### No AI Required
- `hasAI()` checks for `ANTHROPIC_API_KEY` or `ANTHROPIC_AUTH_TOKEN`
- Without key: all features use heuristics (verified working)
- With key: Claude enriches profile via structured output (beta API), falls back to heuristic on failure
- Model: `claude-sonnet-4-5-20250929` via `client.beta.messages.create`

### State Management
- All state in browser `localStorage`: profile (`orient-tn-profile`), tracker (`orient-tn-tracker-v1`), CV versions (`orient-tn-cv-versions-v1`)
- No server sessions, no database
- "Restart" / "Clear local data" buttons wipe localStorage

## Code Conventions

### JavaScript
- ES modules (`"type": "module"`)
- `$` = `querySelector` (single element), `$$` = `querySelectorAll` (array)
- i18n via `t(key)` function with `I18N` object (fr/en/ar)
- All user-facing strings must have 3 language variants
- No external dependencies beyond `@anthropic-ai/sdk`, `pdf-parse`, `mammoth`

### CSS
- CSS custom properties in `:root` (design tokens)
- `.reveal` class for scroll animations (opacity 0 → 1)
- `[hidden]` uses `display:none !important`
- RTL support via `[dir="rtl"]` selectors

### API Handlers
- Shared logic in `lib/handlers.mjs`
- Vercel wrappers in `api/*.js` (thin, just call handler + set status)
- All endpoints validate input (422 on bad input)
- Body parser disabled in Vercel (`bodyParser: false`), handlers use `readBody`

## Common Pitfalls

1. **`$` vs `$$`**: `$` returns single element, `$$` returns array. Calling `.forEach` on `$()` crashes. Always use `$$()` for lists.
2. **File input `hidden`**: Using `hidden` attribute (`display:none`) can prevent `input.click()`. Use visually-hidden class instead.
3. **Reveal animations**: `.reveal` starts at `opacity:0`. Content inside `.reveal` is invisible until scrolled into view. Remove `reveal` from critical above-the-fold content.
4. **Server restart**: After editing `lib/*.mjs`, restart the dev server (it doesn't auto-reload unless using `npm run dev`).
5. **localStorage stale data**: After extraction improvements, users with saved profiles need to re-analyze their CV.

## Testing

```bash
npm run check                          # syntax check all files
curl http://localhost:4180/api/health   # health check
```

No automated test suite. Manual smoke test:
1. Upload/paste CV → analyze → profile renders
2. Click "Voir mes opportunités" → jobs + portals render
3. Paste JD → generate CV → preview + download + print
4. Generate cover letter / prep / gap → results render
5. Save CV version → reload → load version
6. Export/import tracker → verify
7. Switch FR/EN/AR → all labels update
8. Clear local data → everything resets

## Deployment

### Vercel
```bash
npm i -g vercel
vercel login
vercel link
vercel env add ANTHROPIC_API_KEY production   # optional
vercel --prod
```

### Environment Variables
- `ANTHROPIC_API_KEY` — enables AI CV analysis (optional, falls back to heuristic)
- `ANTHROPIC_AUTH_TOKEN` — alternative auth (also accepted)
- `PORT` — local dev server port (default: 4180)

### Vercel Config (`vercel.json`)
- `api/*.js` → `@vercel/node`
- `public/**` → `@vercel/static`
- Routes map `/api/*` to handlers, `/` to index.html, `/*` to static files

## Git

- Remote: `https://github.com/chekerh/orienttn.git`
- Branch: `main`
- No CI/CD — deploy manually via `vercel --prod`

## Design

- Design tokens in `design-system/orient-tn/MASTER.md`
- Color palette: navy `#1E3A5F`, blue `#2563EB`, green `#16A34A`
- Fonts: Crimson Pro (headings), Work Sans (body), Noto Sans Arabic (RTL)
- Loading animation: orient.tn branded (orbit + bars + wordmark)

## Security Notes

- No auth, no database, no server sessions
- CV files read into memory, analyzed, never written to disk
- Profile stored only in browser localStorage
- CV text sent to Anthropic ONLY when API key configured
- Nothing auto-submitted to employers
- Input validation on all API endpoints (422 on bad input)
- File size limit: 3.5 MB
- Request body limit: 4 MB (Vercel)