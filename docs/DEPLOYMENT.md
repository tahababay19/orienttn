# Orient TN — Deployment Guide

## Prerequisites
- Node.js 18+
- npm
- Vercel account (free tier works)
- GitHub account (for auto-deploy, optional)

## Local Development

```bash
cd orient-tn
npm install
npm start          # http://localhost:4180
npm run dev        # auto-reload on file changes
npm run check      # syntax check
```

Change port: `PORT=5000 npm start`

## Enable AI (optional)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm start
```

Without key: heuristic mode (fully functional, no AI).

## Deploy to Vercel

### Option 1: CLI
```bash
npm i -g vercel
vercel login
vercel link          # links to your Vercel project
vercel env add ANTHROPIC_API_KEY production   # optional
vercel --prod
```

### Option 2: GitHub auto-deploy
1. Push to GitHub
2. Go to vercel.com → New Project → Import from GitHub
3. Select `orienttn` repo
4. Framework: Other (no build step needed)
5. Add env var `ANTHROPIC_API_KEY` (optional)
6. Deploy

### Vercel Configuration (`vercel.json`)
- `api/*.js` → `@vercel/node` serverless functions
- `public/**` → `@vercel/static` files
- Routes: `/api/*` → handlers, `/` → index.html, `/*` → static files

### Environment Variables (Vercel Dashboard)
| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | No | Enables AI CV analysis |
| `ANTHROPIC_AUTH_TOKEN` | No | Alternative auth token |

## Production Checklist
- [ ] `npm run check` passes
- [ ] Tested locally with `npm start`
- [ ] Hard-refreshed browser to clear cache
- [ ] Verified file upload works
- [ ] Verified CV generation works
- [ ] Verified all 3 languages (FR/EN/AR)
- [ ] Set `ANTHROPIC_API_KEY` (if using AI)
- [ ] Deployed to Vercel
- [ ] Tested deployed URL
- [ ] Sent URL to client

## Troubleshooting

### "npm run check" fails
Run each check individually: `node --check lib/profile.mjs` etc.

### File upload not working
- Ensure `initIntake()` runs (check browser console for JS errors)
- The file input is an invisible overlay — clicking the drop zone should work
- Try drag-and-drop or paste (Ctrl+V) as alternatives

### Blank sections on landing page
- `.reveal` class starts at `opacity: 0` — content is invisible until scrolled into view
- Remove `reveal` from critical above-the-fold content

### CV shows "—" for match
- The JD didn't contain recognizable tech keywords
- Paste a more detailed JD with specific technologies (React, Python, Docker, etc.)

### Experience not extracted
- CV might use unusual section headers
- The fallback should catch most formats
- Check browser console for errors

### AI not working
- Set `ANTHROPIC_API_KEY` environment variable
- Check `/api/health` — `ai` should be `true`
- Model: `claude-sonnet-4-5-20250929` — ensure your key has access
- Falls back to heuristic on any failure (check `notice` field in response)