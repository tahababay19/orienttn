# Orient TN — API Reference

Base URL: `http://localhost:4180` (dev) or your Vercel deployment URL.

All endpoints accept `POST` with `Content-Type: application/json` except `/api/health` (GET) and `/api/extract` (accepts multipart via JSON base64).

## GET /api/health

Returns engine and source availability.

**Response:**
```json
{
  "ok": true,
  "engines": ["heuristics", "pdf-parse", "mammoth"],
  "ai": false,
  "sources": ["RemoteOK", "Jobicy", "Remotive", "Tanitjobs", "Keejob", "ANETI", "LinkedIn", "LCF Talents"]
}
```

## POST /api/analyze

Extracts a profile from CV text or file.

**Body:**
```json
{ "text": "CV text...", "goals": { "targetRole": "Dev", "city": "Tunis", "contract": "CDI", "mode": "Hybride", "availability": "Immédiate" } }
```
or
```json
{ "file": { "name": "cv.pdf", "data": "base64..." }, "goals": { ... } }
```

**Response:**
```json
{ "profile": { "name": "...", "skills": [...], "experience": [...], "years": 3, "level": "mid", "completeness": 85, "engine": "heuristic", ... } }
```

**Errors:** 422 if text < 60 chars or file unreadable.

## POST /api/jobs

Scores jobs and returns portal links.

**Body:**
```json
{ "profile": { ... }, "contract": "CDI" }
```

**Response:**
```json
{ "links": [...], "jobs": [...], "liveCount": 24, "notice": "..." }
```

## POST /api/cv

Generates a tailored CV from a job description.

**Body:**
```json
{ "profile": { ... }, "jdText": "Job description...", "jdTitle": "Developer", "lang": "fr" }
```

**Response:**
```json
{ "html": "<!doctype html>...", "filename": "Name-CV-adapte-2026-01-01.html", "headline": "...", "summary": "...", "match": { "pct": 95, "matched": [...], "missing": [...] }, "skills": [...], "experience": [...], "evidence": [...], "guardrails": [...] }
```

**Errors:** 422 if jdText < 40 chars.

## POST /api/extract

Extracts text from an uploaded file.

**Body:**
```json
{ "file": { "name": "cv.pdf", "data": "base64..." } }
```
or
```json
{ "text": "Raw text..." }
```

**Response:**
```json
{ "ok": true, "text": "extracted text...", "chars": 1234 }
```

## POST /api/cover-letter

Generates a cover letter.

**Body:**
```json
{ "profile": { ... }, "jdText": "...", "jdTitle": "Developer", "company": "Acme", "lang": "fr" }
```

**Response:**
```json
{ "text": "...", "html": "<!doctype html>...", "subject": "Candidature — Developer", "matched": [...] }
```

## POST /api/interview-prep

Generates interview questions.

**Body:**
```json
{ "profile": { ... }, "jdText": "...", "jdTitle": "Developer", "lang": "fr" }
```

**Response:**
```json
{ "role": "Developer", "technical": [...], "behavioral": [...], "roleQuestions": [...], "gapsToPrepare": [...], "matched": [...], "missing": [...] }
```

## POST /api/gap-roadmap

Generates a learning roadmap for missing skills.

**Body:**
```json
{ "profile": { ... }, "jdText": "...", "lang": "fr" }
```

**Response:**
```json
{ "missing": [...], "roadmap": [{ "skill": "Docker", "action": "...", "resource": "...", "project": "...", "honest": "..." }] }
```