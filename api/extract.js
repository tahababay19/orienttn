import { extractRequest } from '../lib/handlers.mjs';
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try { const r = await extractRequest(req); res.status(r.status).json(r.body); }
  catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
}
