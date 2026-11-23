// Local career generators — no external APIs.
// Cover letter, interview prep, gap roadmap. Pure functions, Vercel-safe.

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const STOP = new Set(['the','and','for','with','you','your','our','are','will','have','this','that','from','who','job','role','work','team','experience','years','year','plus','ability','skills','knowledge','strong','good','using','use','within','into','least','more','than','including','such','other','all','any','not','can','une','des','les','pour','avec','vous','nous','dans','sur','est','qui','que','pas','par','votre','notre','poste','profil','experience','competences']);

const REQUIRED_HDR = /(?:^|\n)\s*(?:requirements?|must[- ]have|required|profil recherch[eé]|comp[eé]tences requises|exigences?|requis)\s*[:：]/i;
const PREFERRED_HDR = /(?:^|\n)\s*(?:nice[- ]to[- ]have|preferred|bonus|atouts?|plus|souhait[eé])\s*[:：]/i;

function splitSections(jdText) {
  const text = String(jdText || '');
  const reqMatch = text.match(REQUIRED_HDR);
  const prefMatch = text.match(PREFERRED_HDR);
  if (!reqMatch && !prefMatch) return { required: text, preferred: '' };
  const reqIdx = reqMatch ? reqMatch.index : -1;
  const prefIdx = prefMatch ? prefMatch.index : -1;
  if (prefIdx === -1) return { required: text.slice(reqIdx >= 0 ? reqIdx : 0), preferred: '' };
  if (reqIdx === -1) return { required: '', preferred: text.slice(prefIdx) };
  if (reqIdx < prefIdx) return { required: text.slice(reqIdx, prefIdx), preferred: text.slice(prefIdx) };
  return { required: text.slice(0, prefIdx), preferred: text.slice(prefIdx) };
}

function extractKeywords(jdText) {
  const text = String(jdText || '');
  const { required, preferred } = splitSections(text);
  const techPatterns = [
    /\breact(?:\.?js)?\b/gi,/\bnode(?:\.?js)?\b/gi,/\btypescript\b/gi,/\bjavascript\b/gi,/\bpython\b/gi,/\bjava\b(?!script)/gi,/\bphp\b/gi,/\bc#\b|\.net\b|asp\.net/gi,/\bangular\b/gi,/\bvue(?:\.?js)?\b/gi,/\bnext\.?js\b/gi,/\bdocker\b/gi,/\bkubernetes\b|\bk8s\b/gi,/\baws\b/gi,/\bazure\b/gi,/\bgcp\b/gi,/\bpostgres(?:ql)?\b/gi,/\bmongodb\b/gi,/\bmysql\b/gi,/\bsql\b/gi,/\bredis\b/gi,/\bgit\b/gi,/\bci\/?cd\b/gi,/\brest(?:ful)?\s*api/gi,/\bgraphql\b/gi,/\bfastapi\b/gi,/\bdjango\b/gi,/\bspring(?:-?boot)?\b/gi,/\blaravel\b/gi,/\bflutter\b/gi,/\bfigma\b/gi,/\bagile\b|\bscrum\b/gi,/\bllm\b|\bgenai\b|machine learning|\bai\b/gi,/\blinux\b/gi,/\bterraform\b/gi,/\bpower\s?bi\b/gi,
  ];
  const collect = (src, weight) => {
    const found = new Set();
    for (const re of techPatterns) { const m = src.match(re); if (m) found.add(m[0].replace(/\s+/g, ' ').trim()); }
    return [...found].map(t => ({ token: t, weight }));
  };
  const requiredTokens = collect(required, 2);
  const preferredTokens = collect(preferred, 1);
  const byToken = new Map();
  for (const t of [...preferredTokens, ...requiredTokens]) byToken.set(norm(t.token), t);
  const tokens = [...byToken.values()].map(t => t.token);
  const weights = Object.fromEntries([...byToken.entries()].map(([k, v]) => [k, v.weight]));
  const words = norm(text).split(/[^a-z0-9+#.]+/).filter(w => w.length >= 4 && !STOP.has(w));
  const freq = new Map(); for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const topWords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([w]) => w);
  return { tokens, topWords, weights };
}

function hasSkill(profile, kw) {
  const n = norm(kw);
  return (profile.skills || []).some(s => { const sn = norm(s); return sn.includes(n) || n.includes(sn); });
}

export function generateCoverLetter({ profile, jdText, jdTitle = '', company = '', lang = 'fr' }) {
  const p = profile || {};
  const jd = extractKeywords(jdText);
  const matched = (p.skills || []).filter(s => jd.tokens.some(t => norm(t).includes(norm(s)) || norm(s).includes(norm(t)))).slice(0, 5);
  const role = jdTitle || p.goals?.targetRole || (lang === 'en' ? 'the position' : 'le poste');
  const companyName = company || (lang === 'en' ? 'your company' : 'votre entreprise');
  const name = p.name || (lang === 'en' ? 'Candidate' : 'Candidat');
  const city = p.goals?.city || 'Tunis';
  const date = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  const skillsText = matched.length ? matched.join(', ') : (p.skills || []).slice(0, 4).join(', ');
  const years = Number(p.years) > 0 ? (lang === 'en' ? `${p.years}+ years of experience` : `${p.years}+ ans d'expérience`) : (lang === 'en' ? 'hands-on experience' : 'une expérience pratique');
  const opening = lang === 'en'
    ? `I am writing to express my interest in the ${role} opportunity at ${companyName}. With ${years} and a background in ${p.archetype?.label || 'software development'}, I am confident I can contribute effectively to your team.`
    : `Je vous adresse ma candidature pour le poste de ${role} au sein de ${companyName}. Avec ${years} et un profil ${p.archetype?.label || 'développement logiciel'}, je suis motivé(e) à contribuer efficacement à vos équipes.`;
  const body = lang === 'en'
    ? `My experience includes ${skillsText || 'modern technologies'}, with practical work on ${(p.experience || [])[0] || 'real projects'}. I focus on delivering reliable, well-documented solutions and collaborating closely with stakeholders.`
    : `Mon parcours couvre notamment ${skillsText || 'des technologies modernes'}, avec une pratique concrète sur ${(p.experience || [])[0] || 'des projets réels'}. Je privilégie la livraison de solutions fiables, documentées et alignées avec les besoins métier.`;
  const close = lang === 'en'
    ? `I would welcome the opportunity to discuss how my profile matches your needs. Thank you for your time and consideration.`
    : `Je serais ravi(e) d'échanger sur la manière dont mon profil peut répondre à vos besoins. Je vous remercie pour votre attention.`;
  const subject = lang === 'en' ? `Application — ${role}` : `Candidature — ${role}`;
  const text = `${name}\n${[p.email, p.phone, ...(p.links || [])].filter(Boolean).join(' · ')}\n${city}, ${date}\n\n${subject}\n\n${lang === 'en' ? 'Dear Hiring Manager,' : 'Madame, Monsieur,'}\n\n${opening}\n\n${body}\n\n${close}\n\n${lang === 'en' ? 'Sincerely,' : 'Cordialement,'}\n${name}\n`;
  const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${esc(subject)}</title>
<style>body{margin:0;background:#f3f4f6;font:14px/1.6 Georgia,"Times New Roman",serif;color:#111827}.page{width:210mm;min-height:297mm;margin:12mm auto;background:#fff;padding:20mm;box-shadow:0 8px 30px rgba(0,0,0,.08)}h1{font-size:18px;margin:0 0 2px}.meta{color:#4b5563;font-size:12px;margin-bottom:24px}.subject{font-weight:700;margin:18px 0}p{margin:0 0 14px}.sig{margin-top:28px}@media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:auto}}@page{size:A4;margin:0}</style></head>
<body><main class="page"><h1>${esc(name)}</h1><div class="meta">${esc([p.email, p.phone, ...(p.links || [])].filter(Boolean).join(' · '))}<br/>${esc(city)}, ${esc(date)}</div><div class="subject">${esc(subject)}</div><p>${esc(lang === 'en' ? 'Dear Hiring Manager,' : 'Madame, Monsieur,')}</p><p>${esc(opening)}</p><p>${esc(body)}</p><p>${esc(close)}</p><div class="sig"><p>${esc(lang === 'en' ? 'Sincerely,' : 'Cordialement,')}<br/><strong>${esc(name)}</strong></p></div></main></body></html>`;
  return { text, html, subject, matched };
}

export function generateInterviewPrep({ profile, jdText, jdTitle = '', lang = 'fr' }) {
  const p = profile || {};
  const jd = extractKeywords(jdText);
  const role = jdTitle || p.goals?.targetRole || (lang === 'en' ? 'the role' : 'le poste');
  const matched = (p.skills || []).filter(s => jd.tokens.some(t => norm(t).includes(norm(s)) || norm(s).includes(norm(t))));
  const missing = jd.tokens.filter(t => !(p.skills || []).some(s => norm(s).includes(norm(t)) || norm(t).includes(norm(s)))).slice(0, 5);
  const en = lang === 'en';
  const technical = matched.slice(0, 5).map(s => ({
    q: en ? `How have you used ${s} in a real project?` : `Expliquez comment vous avez utilisé ${s} dans un projet concret.`,
    why: en ? 'Checks practical mastery, not just keyword familiarity.' : 'Vérifie la maîtrise pratique, pas seulement le mot-clé.',
    star: en ? 'Situation, Task, Action, Result, and what you learned.' : 'Situation, Tâche, Action, Résultat, apprentissage.',
  }));
  if (technical.length < 3) technical.push({
    q: en ? `Describe a recent technical challenge you solved for a ${role} role.` : `Décrivez un défi technique que vous avez résolu récemment pour un poste de ${role}.`,
    why: en ? 'Evaluates problem solving.' : 'Évalue résolution de problème.',
    star: en ? 'Context, constraint, approach, impact.' : 'Contexte, contrainte, approche, impact.',
  });
  const behavioral = en ? [
    { q: 'Tell me about a project where you had to learn a new technology quickly.', why: 'Learning ability.', star: 'What you did not know, how you learned, result.' },
    { q: 'How do you handle priorities when several urgent tasks arrive?', why: 'Organization and communication.', star: 'Context, criteria, decision, result.' },
    { q: 'Describe a time you received difficult feedback.', why: 'Professional maturity.', star: 'Feedback, reaction, action, improvement.' },
  ] : [
    { q: 'Parlez-moi d\'un projet où vous avez dû apprendre vite une nouvelle technologie.', why: 'Capacité d\'apprentissage.', star: 'Ce que vous ne saviez pas, comment vous avez appris, résultat.' },
    { q: 'Comment gérez-vous les priorités quand plusieurs tâches urgentes arrivent ?', why: 'Organisation et communication.', star: 'Contexte, critères, décision, résultat.' },
    { q: 'Décrivez une situation où vous avez reçu un feedback difficile.', why: 'Maturité professionnelle.', star: 'Feedback, réaction, action, amélioration.' },
  ];
  const roleQuestions = en ? [
    { q: `Why are you interested in this ${role} role?`, why: 'Motivation and alignment.', star: 'Connect your background, the role, and your goal.' },
    { q: 'What do you know about the company and how can you contribute?', why: 'Preparation and genuine interest.', star: 'Research, identified need, concrete contribution.' },
  ] : [
    { q: `Pourquoi ce poste de ${role} vous intéresse-t-il ?`, why: 'Motivation et alignement.', star: 'Lien entre votre parcours, le rôle, et votre objectif.' },
    { q: `Que savez-vous de l'entreprise et comment pouvez-vous contribuer ?`, why: 'Préparation et intérêt réel.', star: 'Recherche, besoin identifié, contribution concrète.' },
  ];
  const gapsToPrepare = missing.map(g => en
    ? `Prepare an honest example or learning plan for ${g} (do not claim mastery if untrue).`
    : `Préparez un exemple ou un plan d'apprentissage honnête pour ${g} (ne prétendez pas le maîtriser si ce n'est pas le cas).`);
  return { role, technical, behavioral, roleQuestions, gapsToPrepare, matched, missing, lang };
}

const GAP_ROADMAP = {
  'docker': { action: 'Containeriser un petit projet existant', actionEn: 'Containerize a small existing project', resource: 'Docker Getting Started docs', project: 'Dockerize your portfolio/app and publish the image', projectEn: 'Dockerize your portfolio/app and publish the image' },
  'ci/cd': { action: 'Configurer un pipeline simple', actionEn: 'Set up a simple pipeline', resource: 'GitHub Actions quickstart', project: 'Add lint/test/build to a personal repo', projectEn: 'Add lint/test/build to a personal repo' },
  'kubernetes': { action: 'Comprendre pods/deployments/services', actionEn: 'Understand pods/deployments/services', resource: 'Kubernetes basics tutorial', project: 'Deploy a simple app on minikube/k3d', projectEn: 'Deploy a simple app on minikube/k3d' },
  'aws': { action: 'Apprendre les services de base (S3, EC2, IAM)', actionEn: 'Learn core services (S3, EC2, IAM)', resource: 'AWS Skill Builder', project: 'Deploy a static site on S3/CloudFront', projectEn: 'Deploy a static site on S3/CloudFront' },
  'typescript': { action: 'Typer un projet JS existant progressivement', actionEn: 'Gradually type an existing JS project', resource: 'TypeScript handbook', project: 'Migrate a small JS module to strict TS', projectEn: 'Migrate a small JS module to strict TS' },
  'sql': { action: 'Pratiquer SELECT/JOIN/GROUP BY/index', actionEn: 'Practice SELECT/JOIN/GROUP BY/indexes', resource: 'SQLBolt / Mode SQL tutorial', project: 'Design a small schema and write queries', projectEn: 'Design a small schema and write queries' },
  'postgresql': { action: 'Installer Postgres localement et modéliser des données', actionEn: 'Install Postgres locally and model data', resource: 'PostgreSQL tutorial', project: 'Build a CRUD API with Postgres', projectEn: 'Build a CRUD API with Postgres' },
  'git': { action: 'Maîtriser branches, PR, rebase, conflits', actionEn: 'Master branches, PRs, rebase, conflicts', resource: 'Pro Git book (free)', project: 'Contribute to an open-source repo or manage a clean personal project', projectEn: 'Contribute to an open-source repo or manage a clean personal project' },
  'react': { action: 'Construire des composants, state, effects, forms', actionEn: 'Build components, state, effects, forms', resource: 'React docs (react.dev)', project: 'Create a small app with routing and API', projectEn: 'Create a small app with routing and API' },
  'node.js': { action: 'Créer une API REST simple', actionEn: 'Create a simple REST API', resource: 'Node.js docs + Express/Fastify guide', project: 'CRUD API with validation and tests', projectEn: 'CRUD API with validation and tests' },
};

export function generateGapRoadmap({ profile, jdText, lang = 'fr' }) {
  const p = profile || {};
  const jd = extractKeywords(jdText);
  const en = lang === 'en';
  const have = new Set((p.skills || []).map(norm));
  const missing = jd.tokens.filter(t => { const n = norm(t); return ![...have].some(h => h.includes(n) || n.includes(h)); }).slice(0, 8);
  const roadmap = missing.map(g => {
    const key = norm(g);
    const known = Object.entries(GAP_ROADMAP).find(([k]) => key.includes(k) || k.includes(key));
    const base = known ? known[1] : { action: `Apprendre les bases de ${g}`, actionEn: `Learn the basics of ${g}`, resource: `Official ${g} documentation`, project: `Build a mini-project using ${g}`, projectEn: `Build a mini-project using ${g}` };
    return {
      skill: g,
      action: en ? base.actionEn : base.action,
      resource: base.resource,
      project: en ? base.projectEn : base.project,
      honest: en ? `Only add ${g} to your CV if you can explain a concrete use case.` : `N'ajoutez ${g} au CV que si vous pouvez expliquer un usage concret.`,
    };
  });
  return { missing, roadmap, lang };
}
