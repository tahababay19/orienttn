import { gapRoadmapRequest } from '../lib/handlers.mjs';
export const config = { api: { bodyParser: false } };
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try { const r = await gapRoadmapRequest(req); res.status(r.status).json(r.body); }
  catch (e) { res.status(500).json({ error: String(e?.message || e) }); }
}
