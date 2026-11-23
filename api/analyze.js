import { analyzeRequest } from '../lib/handlers.mjs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const result = await analyzeRequest(req);
    res.status(result.status).json(result.body);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
