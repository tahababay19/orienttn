// Orient TN — zero-framework local server. No auth, no database, no sessions.
//   GET  /                 static UI
//   GET  /api/health       which engines and sources are live
//   POST /api/analyze      { file?:{name,data}, text?, goals } -> structured profile
//   POST /api/jobs         { profile, contract } -> portals + scored live offers
//   POST /api/cv           { profile, jdText, jdTitle, lang } -> tailored CV HTML
//   POST /api/extract      { file?:{name,data}, text? } -> extracted text
//   POST /api/cover-letter { profile, jdText, jdTitle, company, lang }
//   POST /api/interview-prep { profile, jdText, jdTitle }
//   POST /api/gap-roadmap  { profile, jdText }

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { health, analyzeRequest, jobsRequest, generateCVRequest, extractRequest, coverLetterRequest, interviewPrepRequest, gapRoadmapRequest } from './lib/handlers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, 'public');
const PORT = Number(process.env.PORT || 4180);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
};

const json = (res, status, body) => {
  const data = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(data);
};

const serve = (res, file) => {
  const safe = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
  let full = path.join(PUBLIC, safe);
  if (safe === '/' || safe === '.') full = path.join(PUBLIC, 'index.html');
  if (!full.startsWith(PUBLIC)) return json(res, 403, { error: 'Forbidden' });
  if (!fs.existsSync(full) || fs.statSync(full).isDirectory()) return json(res, 404, { error: 'Not found' });
  res.writeHead(200, {
    'content-type': MIME[path.extname(full).toLowerCase()] || 'application/octet-stream',
    'cache-control': path.extname(full) === '.html' ? 'no-store' : 'public, max-age=3600',
  });
  fs.createReadStream(full).pipe(res);
};

http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, health());
    if (req.method === 'POST' && url.pathname === '/api/analyze') { const r = await analyzeRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/jobs') { const r = await jobsRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/cv') { const r = await generateCVRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/extract') { const r = await extractRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/cover-letter') { const r = await coverLetterRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/interview-prep') { const r = await interviewPrepRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'POST' && url.pathname === '/api/gap-roadmap') { const r = await gapRoadmapRequest(req); return json(res, r.status, r.body); }
    if (req.method === 'GET' || req.method === 'HEAD') return serve(res, url.pathname);
    json(res, 405, { error: 'Method not allowed' });
  } catch (e) {
    const status = /trop volumineuse|trop volumineux|illisible|vide|Format|invalide|Invalide|incomplet|courte|trop longue/i.test(e.message) ? 422 : 500;
    json(res, status, { error: String(e.message || e) });
  }
}).listen(PORT, () => console.log(`Orient TN → http://localhost:${PORT}`));
