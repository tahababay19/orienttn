import { health } from '../lib/handlers.mjs';

export default function handler(req, res) {
  res.status(200).json(health());
}
