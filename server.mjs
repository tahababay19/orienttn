// Orient TN — zero-framework local server. No auth, no database, no sessions.
//   GET  /                 static UI
//   GET  /api/health       which engines and sources are live
//   POST /api/analyze      { file?:{name,data}, text?, goals } -> structured profile
//   POST /api/jobs         { profile, contract } -> portals + scored live offers
//
// CV files are read into memory, analysed, and never written to disk.
// The profile lives in the browser (localStorage), so the same handlers run on Vercel.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { health, analyzeRequest, jobsRequest, generateCVRequest } from './lib/handlers.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(HERE, 'public');
const PORT = Number(process.env.PORT || 4180);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json',
};

const json = (res, code, body) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
  const file = path.resolve(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return json(res, 403, { error: 'forbidden' });
  fs.readFile(file, (err, buffer) => {
    if (err) return json(res, 404, { error: 'not found' });
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : buffer);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, health());
    if (req.method === 'POST' && url.pathname === '/api/analyze') {
      const result = await analyzeRequest(req);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/jobs') {
      const result = await jobsRequest(req);
      return json(res, result.status, result.body);
    }
    if (req.method === 'POST' && url.pathname === '/api/cv') {
      const result = await generateCVRequest(req);
      return json(res, result.status, result.body);
    }
    if ((req.method === 'GET' || req.method === 'HEAD') && (url.pathname === '/' || !url.pathname.startsWith('/api/'))) {
      return serveStatic(req, res, url.pathname);
    }
    return json(res, 404, { error: 'not found' });
  } catch (e) {
    return json(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => console.log(`Orient TN → http://localhost:${PORT}`));
