// Profile extraction — ports the career-ops archetype/scoring heuristics and
// the UtopiaHire PDF/DOCX extraction approach into one dependency-light module.
// The heuristic never invents facts; lib/ai.mjs may enrich it without inventing either.

const SKILLS = {
  'React': /\breact(\.js)?\b/i, 'Angular': /\bangular(js)?\b/i, 'Vue': /\bvue(\.js)?\b/i,
  'Next.js': /\bnext\.?js\b/i, 'Node.js': /\bnode(\.js|js)?\b/i, 'TypeScript': /\btypescript\b|\bts\b/i,
  'JavaScript': /\bjavascript\b|\bjs\b/i, 'Python': /\bpython\b/i, 'Java': /\bjava\b(?!script)/i,
  'PHP': /\bphp\b/i, '.NET': /\.net\b|asp\.net|c#/i, 'C++': /c\+\+/i, 'Flutter': /\bflutter\b/i,
  'React Native': /\breact native\b/i, 'Kotlin': /\bkotlin\b/i, 'Swift': /\bswift\b/i,
  'SQL': /\bsql\b/i, 'PostgreSQL': /\bpostgres(ql)?\b/i, 'MongoDB': /\bmongo(db)?\b/i,
  'Oracle': /\boracle\b/i, 'MySQL': /\bmysql\b/i, 'Redis': /\bredis\b/i,
  'Docker': /\bdocker\b/i, 'Kubernetes': /\bkubernetes\b|\bk8s\b/i, 'Git': /\bgit(hub|lab)?\b/i,
  'CI/CD': /\bci\/?cd\b|jenkins|github actions|gitlab ci/i, 'AWS': /\baws\b|amazon web services/i,
  'Azure': /\bazure\b/i, 'GCP': /\bgcp\b|google cloud/i, 'Linux': /\blinux\b|ubuntu|debian/i,
  'REST APIs': /\brest(ful)?\s*(api|services?)?\b|\bapi rest\b/i, 'GraphQL': /\bgraphql\b/i,
  'FastAPI': /\bfastapi\b/i, 'Django': /\bdjango\b/i, 'Spring': /\bspring(-?boot)?\b/i,
  'Laravel': /\blaravel\b/i, 'Symfony': /\bsymfony\b/i, 'Flutter/Dart': /\bdart\b/i,
  'Figma': /\bfigma\b/i, 'Excel': /\bexcel\b/i, 'Power BI': /\bpower\s?bi\b/i,
  'SAP': /\bsap\b/i, 'Jira': /\bjira\b/i, 'Scrum/Agile': /\bscrum\b|\bagile\b/i,
  'LLM / GenAI': /\bllm\b|\bgenai\b|generative ai|\bgpt\b|\brag\b/i,
  'Machine Learning': /\bmachine learning\b|\bml\b|scikit|tensorflow|pytorch/i,
  'Data Analysis': /\bdata analy|analyse de donn|business intelligence|\bbi\b/i,
  'Cybersecurity': /\bcybersecur|cyber s.curit|s.curit. (info|r.seau|op rationnelle)/i,
  'Comptabilité': /\bcomptabilit|comptable|sap fi\/co/i,
  'Réseau': /\br.seau(x)?\b|networking|cisco|fortigate/i,

  // Electrical engineering / automation (academic extension)
  'Électricité industrielle': /[eé]lectricit[eé] industrielle|g[eé]nie [eé]lectrique|[eé]lectrotechnique|electrical engineering|ing[eé]nieur [eé]lectrique/i,
  'Automatisme / API-PLC': /automatismes?|automation|\bplc\b|automate programmable|siemens s7|allen[\s-]?bradley|schneider electric|\bapi\s+(?:plc|siemens|schneider)\b/i,
  'SCADA / HMI': /\bscada\b|\bhmi\b|supervision (?:industrielle|du proc[eé]d[eé])/i,
  'Moteurs & variateurs': /moteur(?:s)? (?:asynchrone|synchrone|[eé]lectrique|cc|ca)|variateur(?:s)? de vitesse|\bvfd\b|servomoteur|motor control/i,
  'Transformateurs': /transformateur(?:s)?|transformer(?:s)?/i,
  'Protection électrique': /protection [eé]lectrique|disjoncteur|relais de protection|diff[eé]rentiel|circuit breaker|protection relay|s[eé]lectivit[eé]/i,
  'Réseaux électriques': /r[eé]seau(?:x)? [eé]lectrique|power system|distribution [eé]lectrique|haute tension|basse tension|\bht\b|\bbt\b/i,
  'Énergies renouvelables': /[eé]nergies? renouvelable|renewable energy|photovolta[iï]que|\bpv\b|[eé]nergie solaire/i,
  'Éolien': /[eé]olien(?:ne)?|wind (?:power|turbine|energy|farm)/i,
  'Instrumentation & mesure': /instrumentation|capteurs?|sensors?|transmetteur|oscilloscope|multim[eè]tre|mesures? [eé]lectriques/i,
  'Câblage & armoires': /c[aâ]blage|wiring|sch[eé]ma [eé]lectrique|electrical (?:diagram|panel)|armoire [eé]lectrique/i,
  'MATLAB / Simulink': /matlab|simulink/i,
  'ETAP / PSCAD': /\betap\b|\bpscad\b|digsilent|power ?factory/i,
  'AutoCAD Electrical': /autocad electrical|autocad [eé]lectrique|electrical cad/i,
  'Arduino / ESP32': /arduino|esp32|esp8266|raspberry pi/i,
  'Maintenance industrielle': /maintenance (?:pr[eé]ventive|curative|industrielle|[eé]lectrique)|\bgmao\b|\bcmms\b/i,
};

const ARCHETYPES = [
  { id: 'agentic', label: 'IA / LLM Systems', match: /agent|llm|genai|generative ai|machine learning|ai engineer|intelligence artificielle/i,
    need: ['Python', 'TypeScript', 'LLM / GenAI', 'FastAPI', 'Docker', 'REST APIs'] },
  { id: 'fde', label: 'Applied AI / Solutions', match: /forward deployed|applied ai|solutions|customer engineer|field engineer/i,
    need: ['Python', 'REST APIs', 'Docker', 'React', 'PostgreSQL'] },
  { id: 'mobile', label: 'Mobile Engineer', match: /mobile|flutter|kotlin|swift|ios|android/i,
    need: ['Flutter', 'Dart', 'REST APIs', 'Git', 'Firebase'] },
  { id: 'data', label: 'Data / BI', match: /data|bi\b|business intelligence|analyste|statistique/i,
    need: ['SQL', 'Python', 'Power BI', 'PostgreSQL', 'Excel'] },
  { id: 'electrical', label: 'Génie électrique / Automatisme', match: /g[eé]nie [eé]lectrique|[eé]lectrotechnique|[eé]lectricit[eé] industrielle|ing[eé]nieur [eé]lectrique|[eé]lectricien(?:ne)?|automaticien|automatismes?|\bplc\b|\bscada\b|[eé]nergie [eé]lectrique|photovolta/i,
    need: ['Électricité industrielle', 'Automatisme / API-PLC', 'Moteurs & variateurs', 'Protection électrique', 'Réseaux électriques', 'Instrumentation & mesure'] },
  { id: 'cyber', label: 'Cybersécurité / Réseau', match: /cyber|s.curit|r.seau|soc\b|pentest/i,
    need: ['Linux', 'Réseau', 'Cybersecurity', 'Docker', 'CI/CD'] },
  { id: 'fullstack', label: 'Full-Stack / Product', match: /full[- ]?stack|product engineer|backend|back-end|software engineer|web|frontend|front-end|d.veloppeur/i,
    need: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Git'] },
  { id: 'general', label: 'Profil polyvalent', match: /.*/, need: ['REST APIs', 'SQL', 'Git', 'Anglais'] },
];

const CERT_HINTS = /aws|azure|gcp|cisco|ccna|oracle|pmp|scrum|iso\s?27001|itil|coursera|udemy|google|microsoft|huawei|terraform|kubernetes|toeic|ielts|delf|deli|certificat|certification|diplôme d'ingénieur|habilitation [eé]lectrique|\bbs\b|\bbe\b|h0v|consuel|nf c 15-100|electrical safety/i;
const DEGREE_HINTS = /licence|master|ing.nieur|bts|doctorat|baccalaur.at|bac\+|pfe|dipl.me|dut|mba|mast.re|g[eé]nie [eé]lectrique|[eé]lectrotechnique|master [eé]nergie|bts [eé]electrotechnique|dut [eé]electrotechnique|licence [eé]lectrique/i;
const LANG_HINTS = [
  ['Français', /\bfran[çc]ais\b|\bfrench\b/i],
  ['Anglais', /\banglais\b|\benglish\b/i],
  ['Arabe', /\barabe\b|\barabic\b|عربي/i],
  ['Allemand', /\ballemand\b|\bgerman\b/i],
  ['Espagnol', /\bespagnol\b|\bspanish\b/i],
  ['Italien', /\bitalien\b|\bitalian\b/i],
];

const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
const uniq = a => [...new Set(a.filter(Boolean))];

const asList = (value, max) => Array.isArray(value)
  ? uniq(value.map(v => clean(v)).filter(v => v.length < 200)).slice(0, max)
  : [];

/** Keep AI and heuristic profiles in exactly the same shape. */
export function normalizeProfileFields(p = {}) {
  const goals = p.goals && typeof p.goals === 'object' ? p.goals : {};
  return {
    ...p,
    name: clean(p.name) || 'Candidat',
    email: clean(p.email),
    phone: clean(p.phone),
    links: asList(p.links, 2),
    headline: clean(p.headline),
    skills: asList(p.skills, 24),
    formations: asList(p.formations, 8),
    certifications: asList(p.certifications, 10),
    experience: asList(p.experience, 8),
    years: Number.isFinite(Number(p.years)) ? Math.max(0, Math.min(40, Math.round(Number(p.years)))) : 0,
    level: ['entry', 'mid', 'senior'].includes(p.level) ? p.level : 'mid',
    languages: Array.isArray(p.languages) ? p.languages.map(l => ({
      name: clean(l?.name),
      level: clean(l?.level) || '—',
    })).filter(l => l.name).slice(0, 10) : [],
    archetype: {
      id: p.archetype?.id || 'general',
      label: clean(p.archetype?.label) || 'Profil polyvalent',
    },
    gaps: asList(p.gaps, 5),
    goals: {
      contract: clean(goals.contract) || 'CDI',
      city: clean(goals.city) || 'Tunis',
      targetRole: clean(goals.targetRole),
      mode: clean(goals.mode) || 'Hybride',
      availability: clean(goals.availability) || 'Immédiate',
    },
    sourceChars: Number(p.sourceChars) || 0,
    engine: p.engine === 'ai' ? 'ai' : 'heuristic',
  };
}

export function completeness(p) {
  const checks = [
    !!p.name && p.name !== 'Candidat', !!p.email, p.skills?.length >= 3,
    p.formations?.length > 0, p.certifications?.length > 0, p.experience?.length > 0,
    p.languages?.length >= 2, !!p.goals?.targetRole, !!p.goals?.contract,
  ];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}

/** Extract plain text from an uploaded file buffer (UtopiaHire approach). */
export async function extractText(buffer, filename = '') {
  const ext = filename.toLowerCase().split('.').pop();
  if (ext === 'pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const pdf = await pdfParse(buffer);
    return String(pdf.text || '');
  }
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    const res = await mammoth.extractRawText({ buffer });
    return String(res.value || '');
  }
  return buffer.toString('utf8');
}

/** Split CV text into named sections (FR + EN). */
function sections(text) {
  const out = {};
  let current = 'header';
  out[current] = [];
  const headerRe = /^\s*(?:#{1,4}\s*)?(COMPÉTENCES|COMPETENCES|SKILLS|TECHNICAL SKILLS|TECH STACK|OUTILS|TOOLS|FORMATIONS?|EDUCATION|ACADEMIC|DIPLÔMES?|DIPLOMES?|EXPÉRIENCES?|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY|PARCOURS|CARRIÈRE|CARRIERE|CERTIFICATIONS?|CERTS?|PROJETS?|PROJECTS|LANGUES|LANGUAGES|LANGUAGES SPOKEN|RÉSUMÉ|RESUME|SUMMARY|PROFIL|PROFILE|ABOUT|À PROPOS)\s*:?\s*$/i;
  for (const rawLine of String(text || '').split(/\r?\n/)) {
    const line = rawLine.replace(/^[\s*#•\-–—]+/, '').trim();
    const m = line.match(headerRe) || line.match(/^\s*(?:#{1,4}\s*)?(EXP[EÉ]RIENCES?|EXPERIENCE[S]?|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|WORK HISTORY|PARCOURS|CARRI[EÈ]RE[S]?|CARRIERE[S]?|EXP\.?)(?:\s+.*)?$/i);
    if (m) { current = m[1].toLowerCase(); out[current] ||= []; continue; }
    if (line) (out[current] ||= []).push(line);
  }
  return out;
}

function sectionLines(sec, names) {
  const keys = Object.keys(sec).filter(k => names.some(n => k.startsWith(n)));
  return keys.flatMap(k => sec[k]);
}

/** Detect the candidate's profile from CV text + the intake form. */
export function analyzeProfile(text, goals = {}) {
  const sec = sections(text);
  const hay = String(text || '');
  const role = clean(goals.targetRole || '').toLowerCase();
  const roleHay = `${role} ${sec.header?.slice(0, 6).join(' ') || ''}`;

  const skills = uniq([
    ...Object.entries(SKILLS).filter(([, re]) => re.test(hay)).map(([name]) => name),
    ...sectionLines(sec, ['compétences', 'competences', 'skills', 'technologies', 'tech stack', 'outils'])
      .flatMap(l => l.split(/[,|;•·]/)).map(s => clean(s).replace(/^[^A-Za-zÀ-ÿ0-9+#.]+/, '').slice(0, 40))
      .filter(s => s.length > 1 && s.length < 35 && !DEGREE_HINTS.test(s) && !/^(and|or|the|with)$/i.test(s)),
  ]).slice(0, 24);

  const formations = uniq(
    sectionLines(sec, ['formation', 'education', 'diplôme', 'diplome', 'academic', 'études', 'etudes'])
      .filter(l => l.length < 180 && l.length > 3)
      .map(l => clean(l))
  ).slice(0, 8);

  const certifications = uniq(
    sectionLines(sec, ['certification', 'certs']).filter(l => l.length < 140)
  ).slice(0, 10);
  if (!certifications.length) {
    for (const line of hay.split(/\r?\n/)) if (CERT_HINTS.test(line) && clean(line).length < 140) certifications.push(clean(line));
  }

  let experienceLines = sectionLines(sec, ['expérience', 'experience', 'work experience', 'professional experience', 'employment'])
    .filter(l => l.length < 200 && l.length > 3).slice(0, 10);
  // Fallback: if no experience section found, extract lines with date ranges or job-like patterns
  if (!experienceLines.length) {
    const lines = hay.split(/\r?\n/).map(l => clean(l));
    // Skip header lines (name, title, contact) - usually first 3-5 lines
    const startIdx = Math.min(3, lines.length);
    experienceLines = lines
      .slice(startIdx)
      .filter(l => l.length > 5 && l.length < 200
        && !/[@]/.test(l) && !/^\+?\d[\d\s\-().]{6,}$/.test(l)
        && !/^(skills|compétences|formation|education|langues|languages|email|phone|tél|education:)\b/i.test(l)
        && !/^(skills|compétences)\s*:/i.test(l)
        && /(?:19|20)\d{2}|présent|present|développeur|developer|engineer|ingénieur|[eé]lectricien|[eé]lectrotechnique|automaticien|technicien [eé]lectrique|maintenance [eé]lectrique|manager|analyste|analyst|technicien|assistant|consultant|built|designed|created|managed|led|developed|implemented|used|utilized/i.test(l))
      .slice(0, 10);
  }
  const dateRanges = (hay.match(/(?:19|20)\d{2}\s*[-–—]\s*(?:(?:19|20)\d{2}|présent|present|aujourd|maintenant|ce jour)/gi) || []).length;
  const explicitYears = (hay.match(/(\d+)\s*(?:\+\s*)?(?:ans?|years?)(?:\s+d['’]?expérience|\s+of\s+experience)/gi) || []).map(m => parseInt(m));
  const years = explicitYears.length ? Math.max(...explicitYears) : dateRanges;
  const level = /\b(senior|lead|principal|head|directeur|manager)\b/i.test(roleHay) ? 'senior'
    : /\b(junior|débutant|debutant|graduate|stage|pfe|intern|entry)\b/i.test(roleHay) ? 'entry' : 'mid';

  const levelRe = /\b(C1|C2|B1|B2|A1|A2|natif|native|courant|fluent|intermédiaire|intermediaire|débutant|debutant)\b/i;
  const langParts = (sectionLines(sec, ['langues', 'languages']).length
    ? sectionLines(sec, ['langues', 'languages']) : hay.split(/\r?\n/))
    .flatMap(l => l.split(/[,;|•·]/));
  const languages = LANG_HINTS.filter(([, re]) => re.test(hay)).map(([name, re]) => {
    const part = langParts.find(p => re.test(p)) || '';
    const lvl = clean((part.match(levelRe) || [])[0] || '—');
    return { name, level: lvl };
  });

  const archetype = ARCHETYPES.find(a => a.match.test(roleHay)) || ARCHETYPES.find(a => a.match.test(hay)) || ARCHETYPES.at(-1);
  const skillSet = new Set(skills.map(s => s.toLowerCase()));
  const gaps = archetype.need.filter(n => !skillSet.has(n.toLowerCase()) && !new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(hay)).slice(0, 5);

  // Name: try explicit 'Name:' label first, then first short non-header line
  const nameFromLabel = clean((hay.match(/(?:nom|name|full name)\s*[:：]\s*([A-Za-zÀ-ÿ'\- ]{2,60})/i) || [])[1] || '');
  const nameLine = nameFromLabel || clean(sec.header?.find(l => l.length < 70 && !/^(cv|curriculum|résumé|resume|profil|profile|summary|skills|compétences|experience|expérience|formation|education|certification|langues|languages)\b/i.test(l) && !/[@+0-9]/.test(l) && /[A-Za-zÀ-ÿ]/.test(l)) || '')
    .replace(/^#+\s*/, '').slice(0, 70);

  const profile = normalizeProfileFields({
    id: '',
    name: nameLine || 'Candidat',
    email: clean((hay.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/) || [])[0] || ''),
    phone: clean((hay.match(/\+?\d[\d\s\-().]{7,18}\d/) || [])[0] || ''),
    links: uniq([
      (hay.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s)>",]+/i) || [])[0] || '',
      (hay.match(/https?:\/\/(?:www\.)?github\.com\/[^\s)>",]+/i) || [])[0] || '',
      (hay.match(/https?:\/\/(?:www\.)?gitlab\.com\/[^\s)>",]+/i) || [])[0] || '',
    ]).slice(0, 2),
    headline: clean(goals.targetRole || sec.header?.[0] || ''),
    skills, formations, certifications, experience: experienceLines,
    years: Math.min(years, 20), level, languages,
    archetype: { id: archetype.id, label: archetype.label },
    gaps,
    goals: {
      contract: clean(goals.contract || 'CDI'),
      city: clean(goals.city || 'Tunis'),
      targetRole: clean(goals.targetRole || ''),
      mode: clean(goals.mode || 'Hybride'),
      availability: clean(goals.availability || 'Immédiate'),
    },
    sourceChars: hay.length,
    engine: 'heuristic',
  });

  profile.completeness = completeness(profile);
  return profile;
}
