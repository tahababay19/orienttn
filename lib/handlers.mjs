// Shared API handlers for the local Node server and Vercel serverless functions.
// No sessions, no persistence: the profile is returned to the browser and sent back.

import { randomUUID } from 'node:crypto';
import { extractText, analyzeProfile, normalizeProfileFields } from './profile.mjs';
import { fetchLiveJobs, boardLinks, scoreJob, isStageTitle } from './jobs.mjs';
import { analyzeWithAI, hasAI } from './ai.mjs';
import { generateTailoredCV } from './cv.mjs';

const MAX_BODY = 4 * 1024 * 1024; // stays below Vercel's request-body limit
const MAX_FILE = 3.5 * 1024 * 1024;
const ERROR_TEXT = 'Le CV est vide ou illisible. Essayez un autre fichier ou collez le texte du CV.';

export function readBody(req, limit = MAX_BODY) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(JSON.stringify(req.body));
    if (typeof req.body === 'string') return resolve(req.body);
    let size = 0;
    const parts = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Requête trop volumineuse (4 Mo max)'));
        req.destroy();
        return;
      }
      parts.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')));
    req.on('error', reject);
  });
}

async function parseBody(req) {
  const raw = await readBody(req);
  try { return JSON.parse(raw || '{}'); } catch { throw new Error('Requête JSON invalide'); }
}

async function cvTextFrom(body) {
  let text = String(body.text || '').trim();
  if (!text && body.file?.data) {
    const name = String(body.file.name || '');
    if (!/\.(pdf|docx|txt|md)$/i.test(name)) throw new Error('Formats acceptés : PDF, DOCX, TXT, MD');
    const data = String(body.file.data).replace(/^data:[^,]+,/, '');
    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > MAX_FILE) throw new Error('Fichier trop volumineux (3,5 Mo max)');
    text = await extractText(buffer, name);
  }
  return String(text || '').trim();
}

export function health() {
  return {
    ok: true,
    engines: hasAI() ? ['Claude (analyse IA)', 'heuristics de secours', 'pdf-parse', 'mammoth'] : ['heuristics', 'pdf-parse', 'mammoth'],
    ai: hasAI(),
    sources: ['RemoteOK', 'Jobicy', 'Remotive', 'Tanitjobs', 'Keejob', 'ANETI', 'LinkedIn', 'LCF Talents'],
  };
}

export async function analyzeRequest(req) {
  const body = await parseBody(req);
  const text = await cvTextFrom(body);
  if (text.length < 60) return { status: 422, body: { error: ERROR_TEXT } };

  const goals = body.goals && typeof body.goals === 'object' ? body.goals : {};
  const baseline = analyzeProfile(text.slice(0, 120000), goals);
  let profile = { ...baseline, engine: 'heuristic' };

  if (hasAI()) {
    try {
      profile = await analyzeWithAI(text.slice(0, 60000), goals, baseline);
    } catch (e) {
      // Honest fallback: the user still gets a useful profile, clearly labelled.
      profile = {
        ...baseline,
        engine: 'heuristic',
        notice: String(e?.message || 'AI indisponible'),
      };
    }
  }

  return { status: 200, body: { profile: { ...profile, id: randomUUID() } } };
}

export async function jobsRequest(req) {
  const body = await parseBody(req);
  const profile = normalizeProfileFields(body.profile);
  if (!profile.goals.targetRole && !profile.skills.length) {
    return { status: 422, body: { error: 'Profil invalide. Analysez un CV avant de chercher des offres.' } };
  }

  const [feed] = await Promise.allSettled([fetchLiveJobs()]);
  const live = (feed.status === 'fulfilled' ? feed.value : []).map(j => scoreJob(j, profile));
  const wanted = String(body.contract || 'Tous');
  const stageWanted = isStageTitle(wanted);
  const filtered = wanted && wanted !== 'Tous'
    ? live.filter(j => j.contract === wanted || (stageWanted && isStageTitle(j.title)))
    : live;
  const links = boardLinks(profile).map(b => ({
    ...b,
    tags: b.tags.map(tag => tag === 'CDI' ? profile.goals.contract : tag),
    match: 70 + (b.tags.includes(profile.goals.contract) ? 12 : 0) + (profile.skills.length > 5 ? 8 : 0),
  }));

  return {
    status: 200,
    body: {
      links,
      jobs: filtered.sort((a, b) => b.score - a.score).slice(0, 24),
      liveCount: live.length,
      notice: feed.status === 'rejected' ? 'Flux externes momentanément indisponibles — les portails tunisiens restent accessibles.' : null,
    },
  };
}

export async function generateCVRequest(req) {
  const body = await parseBody(req);
  const profile = normalizeProfileFields(body.profile || {});
  const jdText = String(body.jdText || body.jobDescription || '').trim();
  const jdTitle = String(body.jdTitle || body.title || '').trim().slice(0, 140);

  if (!profile.skills.length && !profile.experience.length && !profile.formations.length) {
    return { status: 422, body: { error: 'Profil incomplet. Analysez un CV avant de générer un CV adapté.' } };
  }
  if (jdText.length < 40) {
    return { status: 422, body: { error: 'Collez une description de poste plus détaillée (au moins 40 caractères).' } };
  }
  if (jdText.length > 20000) {
    return { status: 422, body: { error: 'La description de poste est trop longue (20 000 caractères max).' } };
  }

  const result = generateTailoredCV({ profile, jdText, jdTitle });
  return {
    status: 200,
    body: {
      ok: true,
      ...result,
      generatedAt: new Date().toISOString(),
      engine: 'local',
    },
  };
}
