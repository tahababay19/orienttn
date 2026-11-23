// In-app AI enrichment. The deterministic extractor stays the source of truth;
// Claude may only add facts that are explicitly present in the CV text.
// If no credential is configured, callers fall back to the heuristic profile.

import Anthropic from '@anthropic-ai/sdk';
import { completeness, normalizeProfileFields } from './profile.mjs';

const MODEL = 'claude-sonnet-4-5-20250929';

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    headline: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    formations: { type: 'array', items: { type: 'string' } },
    certifications: { type: 'array', items: { type: 'string' } },
    experience: { type: 'array', items: { type: 'string' } },
    years: { type: 'integer' },
    level: { type: 'string', enum: ['entry', 'mid', 'senior'] },
    languages: {
      type: 'array',
      items: {
        type: 'object',
        properties: { name: { type: 'string' }, level: { type: 'string' } },
        required: ['name', 'level'],
        additionalProperties: false,
      },
    },
    archetypeLabel: { type: 'string' },
    gaps: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'email', 'phone', 'headline', 'skills', 'formations', 'certifications', 'experience', 'years', 'level', 'languages', 'archetypeLabel', 'gaps'],
  additionalProperties: false,
};

const SYSTEM = `You extract structured facts from a CV for a career-orientation web app.
Rules you must obey:
- Use only information explicitly present in the CV text or the stated goal. Never invent, guess or complete a skill, degree, certificate, language, date or contact detail.
- If a field is not present, return an empty string, an empty array, 0, or "mid" as appropriate.
- Keep every string short and copied or tightly paraphrased from the CV. Do not add marketing language.
- "skills" should be a list of concrete tools, technologies or competences (max 24). Do not add soft skills unless the CV lists them explicitly.
- "years" is an estimate only when the CV gives explicit date ranges; otherwise 0.
- "level" must be entry, mid or senior based on explicit wording such as junior, senior, lead, intern or years of experience. If unclear, use mid.
- "archetypeLabel" is a short French label (max 4 words) describing the closest professional profile. If unclear, use "Candidat".
- "gaps" lists up to 5 concrete competences missing for the stated target role, based only on common requirements for that role. Do not claim the candidate has them.
- Return JSON matching the schema exactly. No prose, no markdown, no commentary.`;

export function hasAI() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

const cleanList = (value, max = 24) => Array.isArray(value)
  ? value.map(v => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, 80)).filter(Boolean).slice(0, max)
  : [];

/** Merge AI-extracted facts into the deterministic baseline, then recompute completeness. */
export function mergeAIProfile(ai, baseline) {
  const safe = ai && typeof ai === 'object' ? ai : {};
  const skills = [...new Set([
    ...cleanList(safe.skills, 24),
    ...(baseline.skills || []),
  ])].slice(0, 24);
  const merged = normalizeProfileFields({
    ...baseline,
    name: String(safe.name || '').trim() || baseline.name,
    email: String(safe.email || '').trim() || baseline.email,
    phone: String(safe.phone || '').trim() || baseline.phone,
    headline: String(safe.headline || '').trim() || baseline.headline,
    skills,
    formations: cleanList(safe.formations, 8).length ? cleanList(safe.formations, 8) : baseline.formations,
    certifications: cleanList(safe.certifications, 10).length ? cleanList(safe.certifications, 10) : baseline.certifications,
    experience: cleanList(safe.experience, 8).length ? cleanList(safe.experience, 8) : baseline.experience,
    years: Number.isFinite(safe.years) ? Math.min(40, Math.max(0, Math.round(safe.years))) : baseline.years,
    level: ['entry', 'mid', 'senior'].includes(safe.level) ? safe.level : baseline.level,
    languages: Array.isArray(safe.languages) && safe.languages.length
      ? safe.languages.map(l => ({
          name: String(l?.name || '').trim().slice(0, 40),
          level: String(l?.level || '—').trim().slice(0, 30) || '—',
        })).filter(l => l.name).slice(0, 10)
      : baseline.languages,
    archetype: {
      ...baseline.archetype,
      label: String(safe.archetypeLabel || '').trim().slice(0, 60) || baseline.archetype?.label || 'Candidat',
    },
    gaps: cleanList(safe.gaps, 5).length ? cleanList(safe.gaps, 5) : baseline.gaps,
    engine: 'ai',
  });
  merged.completeness = completeness(merged);
  return merged;
}

/** Call Claude with structured outputs. Throws on any failure so callers can fall back. */
export async function analyzeWithAI(text, goals, baseline) {
  if (!hasAI()) throw new Error('AI not configured');

  const client = new Anthropic({ timeout: 25_000, maxRetries: 1 });
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `GOAL (from the intake form):\n${JSON.stringify(goals || {})}\n\nCV TEXT:\n${String(text).slice(0, 60000)}`,
    }],
    system: SYSTEM,
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: SCHEMA },
    },
  });

  if (response.stop_reason === 'refusal') throw new Error('AI refused the request');
  const block = (response.content || []).find(b => b.type === 'text' && b.text);
  if (!block) throw new Error('AI returned no text');
  return mergeAIProfile(JSON.parse(block.text), baseline);
}
