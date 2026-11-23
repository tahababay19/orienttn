// Job discovery — reuses career-ops' public-source fetchers + A-F triage idea,
// and adds Tunisia-specific portals from the market research (Tanitjobs, Keejob,
// ANETI/SIVP-CIVP, LCF Talents, LinkedIn). Nothing is auto-applied to.

const POS = /\b(d.eveloppeur|developer|engineer|ing.nieur|software|frontend|front-end|backend|back-end|full.?stack|web|mobile|flutter|react|angular|vue|node|python|java|\.net|php|data|analyste|analyst|bi\b|cloud|devops|sre|cyber|s.curit|r.seau|network|ux|ui|product|chef de projet|project manager|architect|qa|test|automation|ai\b|llm|machine learning|stage|pfe|intern)\b/i;
const NEG = /\b(recruiter|sourcer|account executive|sales development|paralegal|lawyer|payroll|call center|commercial|vente|marketing|rh\b|stage non r.mun.r. sans convention|escort)\b/i;

// Word-boundary match: "Global Tax Intern" and "stage PFE" are internships;
// "International People Ops Analyst" is not (the substring "intern" must not match).
export const isStageTitle = t => /\b(stage|pfe|intern(ship)?)\b/i.test(String(t || ''));

const cache = new Map();
const cached = async (key, ttl, fn) => {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.data;
  const data = await fn();
  cache.set(key, { at: Date.now(), data });
  return data;
};

async function getJSON(url, ms = 9000, headers = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'orient-tn/0.1', ...headers } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(timer); }
}

const norm = (title, company, url, location, source, extra = '', ts = 0) => ({
  title: String(title || '').replace(/<[^>]*>/g, '').slice(0, 120),
  company: String(company || 'Entreprise').replace(/<[^>]*>/g, '').slice(0, 70),
  url, location: String(location || 'Remote').slice(0, 60), source,
  extra: String(extra || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 180),
  ts, contract: isStageTitle(title) ? 'Stage' : 'CDI',
  grade: /\b(senior|lead|principal|head|staff)\b/i.test(title || '') ? 'senior'
    : /\b(junior|graduate|entry|intern|stage|pfe|new grad)\b/i.test(title || '') ? 'entry' : 'mid',
});

/** Live remote offers from the same public APIs career-ops uses. */
export async function fetchLiveJobs() {
  const sources = await Promise.allSettled([
    cached('remoteok', 2 * 3600e3, async () => {
      const data = await getJSON('https://remoteok.com/api', 12000);
      return (Array.isArray(data) ? data.slice(1) : []).map(j =>
        norm(j.position, j.company, j.url || `https://remoteok.com/remote-jobs/${j.slug}`, j.location || 'Worldwide', 'RemoteOK', '', (j.date || 0) * 1000));
    }),
    cached('jobicy', 2 * 3600e3, async () => {
      const data = await getJSON('https://jobicy.com/api/v2/remote-jobs?count=80');
      return (data.jobs || []).map(j =>
        norm(j.jobTitle, j.companyName, j.url, j.jobGeo || 'Worldwide', 'Jobicy', j.jobLevel || '', Date.parse(j.pubDate) || 0));
    }),
    cached('remotive', 2 * 3600e3, async () => {
      const data = await getJSON('https://remotive.com/api/remote-jobs?limit=100');
      return (data.jobs || []).map(j =>
        norm(j.title, j.company_name, j.url, j.candidate_required_location || 'Remote', 'Remotive', j.description || '', Date.parse(j.publication_date) || 0));
    }),
  ]);
  const jobs = sources.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  const seen = new Set();
  return jobs.filter(j => {
    if (!j.title || !j.url || NEG.test(j.title) || !POS.test(`${j.title} ${j.extra}`)) return false;
    const k = j.url.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((a, b) => b.ts - a.ts);
}

const enc = s => encodeURIComponent(String(s || '').trim());

/** Matched searches on the portals a Tunisian graduate actually uses. */
export function boardLinks(profile) {
  const q = profile.goals.targetRole || profile.archetype.label;
  const skill = profile.skills[0] || '';
  const main = `${q} ${skill}`.trim();
  const city = profile.goals.city;
  const contract = profile.goals.contract;
  return [
    { name: 'Tanitjobs', note: 'N°1 en Tunisie · CDI, CDD, stage PFE', color: '#1E3A5F',
      url: `https://www.tanitjobs.com/jobs/?action=search&keywords=${enc(main)}`, tags: [contract, city] },
    { name: 'Keejob', note: 'CDI · CDD · stages · freelance', color: '#16A34A',
      url: `https://www.keejob.com/offres-emploi/?q=${enc(main)}`, tags: [contract, city] },
    { name: 'ANETI', note: 'SIVP / CIVP · insertion des diplômés', color: '#B45309',
      url: `https://www.emploi.nat.tn/`, tags: ['SIVP', 'CIVP', 'public'] },
    { name: 'LinkedIn', note: 'Postes tech & multinationaux', color: '#2563EB',
      url: `https://www.linkedin.com/jobs/search/?keywords=${enc(main)}&location=${enc('Tunisia')}`, tags: ['pro', 'réseau'] },
    { name: 'LCF Talents', note: 'Tech à Tunis · offres vérifiées', color: '#7C3AED',
      url: `https://talents.lecloudfacile.com/emploi/tunis`, tags: ['tech', 'Tunis'] },
  ];
}

/** Transparent heuristic score (reasons shown in the UI — no black box). */
export function scoreJob(job, profile) {
  const hay = `${job.title} ${job.extra} ${job.company}`.toLowerCase();
  const level = profile.level || profile.goals?.level; // analyzeProfile stores level at top level
  const wantsStage = isStageTitle(profile.goals?.contract);
  const skillHits = (profile.skills || []).filter(s => hay.includes(s.toLowerCase())).slice(0, 6);
  let score = 48;
  const reasons = [];
  if (skillHits.length) { score += Math.min(28, skillHits.length * 7); reasons.push(`${skillHits.length} compétence${skillHits.length > 1 ? 's' : ''} en commun`); }
  if (profile.goals?.targetRole && hay.includes(profile.goals.targetRole.toLowerCase().split(/\s+/)[0])) { score += 9; reasons.push('intitulé proche de votre objectif'); }
  if (/\b(remote|worldwide|tunisie|tunis|hybride)\b/i.test(`${job.location} ${job.extra}`)) { score += 7; reasons.push('localisation compatible'); }
  if (level === 'entry' && job.grade === 'entry') { score += 8; reasons.push('niveau débutant'); }
  if (level === 'senior' && job.grade === 'senior') { score += 8; reasons.push('niveau senior'); }
  if (job.grade === 'senior' && level !== 'senior') { score -= 10; reasons.push('profil senior demandé'); }
  if (wantsStage && !isStageTitle(job.title)) { score -= 12; }
  return { ...job, score: Math.max(20, Math.min(98, Math.round(score))), skillHits, reasons };
}
