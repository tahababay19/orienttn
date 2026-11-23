# Orient TN — Architecture

## Overview

Stateless single-page app. All user data lives in the browser (`localStorage`). The server is stateless — it receives input, processes it, and returns results. No sessions, no database, no auth.

## Request Flow

```
Browser → Vercel Edge → api/*.js → lib/handlers.mjs → lib/*.mjs → Response
```

### Local Dev
```
Browser → server.mjs (Node HTTP) → lib/handlers.mjs → lib/*.mjs → Response
```

## Module Responsibilities

### `lib/profile.mjs` — CV Extraction
- `extractText(buffer, filename)` — PDF/DOCX/TXT → plain text
- `sections(text)` — splits CV into named sections (FR + EN headers)
- `analyzeProfile(text, goals)` — heuristic profile extraction
  - Skills (30+ tech patterns + section parsing)
  - Formations, certifications, experience
  - Languages with levels
  - Years of experience, seniority level
  - Archetype + gaps
  - Name, email, phone, links
- `normalizeProfileFields(p)` — validates/normalizes profile shape
- `completeness(p)` — 0-100% score based on 9 checks

### `lib/jobs.mjs` — Job Matching
- `fetchLiveJobs()` — fetches from RemoteOK, Jobicy, Remotive (2h cache, timeouts)
- `scoreJob(job, profile)` — heuristic scoring (skill overlap, location, level)
- `buildPortalLinks(profile)` — 5 Tunisia portal links with pre-filled searches
- Tunisia portals: Tanitjobs, Keejob, ANETI, LinkedIn, LCF Talents

### `lib/ai.mjs` — Optional AI Enrichment
- `hasAI()` — checks for API key
- `analyzeWithAI(text, goals, baseline)` — Claude structured output
- `mergeAIProfile(ai, baseline)` — merges AI facts into heuristic baseline
- Model: `claude-sonnet-4-5-20250929` via `client.beta.messages.create`
- Falls back to heuristic on any failure

### `lib/cv.mjs` — CV Generator
- `jdKeywords(jdText)` — extracts tech keywords + weights (must-have/nice-to-have)
- `generateTailoredCV({ profile, jdText, jdTitle, lang })` — A4 HTML CV
- `matchScore(skill, jd)` — weighted keyword matching
- `buildMatch(profile, jd)` — match percentage + missing keywords
- `highlightExperience(experience, jd)` — reorders by relevance
- Evidence + guardrails included in output

### `lib/career.mjs` — Career Tools
- `extractKeywords(jdText)` — tech keywords with required/preferred weights
- `generateCoverLetter({ profile, jdText, jdTitle, company, lang })` — FR/EN
- `generateInterviewPrep({ profile, jdText, jdTitle, lang })` — STAR questions
- `generateGapRoadmap({ profile, jdText, lang })` — learning plans

### `lib/handlers.mjs` — Request Handlers
- `parseBody(req)` — JSON body parser
- `cvTextFrom(body)` — extracts text from file or body.text
- `analyzeRequest(req)` — profile extraction
- `jobsRequest(req)` — job scoring + portal links
- `cvRequest(req)` — CV generation
- `extractRequest(req)` — text extraction from file
- `coverLetterRequest(req)` — cover letter
- `interviewPrepRequest(req)` — interview prep
- `gapRoadmapRequest(req)` — gap roadmap

## Frontend Architecture

Single-page app in `public/index.html` + `public/app.js` + `public/styles.css`.

### State
- `profile` — extracted profile (from analyze or localStorage)
- `jobsData` — job results + portal links
- `fileData` — uploaded file (base64)
- `tracker` — application tracker items (localStorage)
- `cvVersions` — saved CV versions (localStorage)
- `lang` — current language (fr/en/ar)
- `filter` — job filter (Tous/CDI/Stage)

### Step Flow
1. **Step 1** — CV upload/paste + intake form
2. **Step 2** — Profile display + CV tailor section
3. **Step 3** — Jobs + portals

### i18n
- `I18N` object with `fr`/`en`/`ar` dictionaries
- `t(key)` — returns translated string
- `applyI18n(lang)` — updates all `[data-i18n]` elements
- RTL support via `dir="rtl"` on `<html>`

### Motion
- `.reveal` class → IntersectionObserver → `.in` class
- GSAP for hero animations (if loaded)
- `prefers-reduced-motion` fallback

## Data Flow: CV Tailoring

```
User pastes JD → jdKeywords() extracts tech patterns
  → splitSections() detects required/preferred headers
  → tokens[] + weights{} (required=2, preferred=1)
  → buildMatch() computes weighted percentage
  → matchScore() weights each skill match
  → generateTailoredCV() produces A4 HTML
  → renderCVResult() shows preview + download/print
```

## Security

- No auth, no sessions, no database
- Input validation on all endpoints (422 on bad input)
- File size limit: 3.5 MB
- Request body limit: 4 MB (Vercel)
- CV files read into memory, never written to disk
- CV text sent to Anthropic ONLY when API key configured
- Nothing auto-submitted to employers