// Local CV generator — no external APIs. Takes an analyzed profile + a pasted
// job description and produces a tailored, printable A4 HTML CV.
// Works in Node (local server) and Vercel serverless (pure function, no fs).

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const STOP = new Set([
  'the','and','for','with','you','your','our','are','will','have','this','that',
  'from','who','job','role','work','team','experience','years','year','plus',
  'ability','skills','knowledge','strong','good','using','use','within','into',
  'least','more','than','including','such','other','all','any','not','can',
  'une','des','les','pour','avec','vous','nous','dans','sur','est','qui','que',
  'pas','par','votre','notre','poste','profil','experience','competences',
]);

function jdKeywords(jdText) {
  const text = String(jdText || '');
  // Explicit tech tokens / phrases
  const techPatterns = [
    /\breact(?:\.?js)?\b/gi, /\bnode(?:\.?js)?\b/gi, /\btypescript\b/gi, /\bjavascript\b/gi,
    /\bpython\b/gi, /\bjava\b(?!script)/gi, /\bphp\b/gi, /\bc#\b|\.net\b|asp\.net/gi,
    /\bangular\b/gi, /\bvue(?:\.?js)?\b/gi, /\bnext\.?js\b/gi, /\bnuxt\b/gi,
    /\bdocker\b/gi, /\bkubernetes\b|\bk8s\b/gi, /\baws\b/gi, /\bazure\b/gi, /\bgcp\b/gi,
    /\bpostgres(?:ql)?\b/gi, /\bmongodb\b/gi, /\bmysql\b/gi, /\bsql\b/gi, /\bredis\b/gi,
    /\bgit\b/gi, /\bci\/?cd\b/gi, /\brest(?:ful)?\s*api/gi, /\bgraphql\b/gi,
    /\bfastapi\b/gi, /\bdjango\b/gi, /\bspring(?:-?boot)?\b/gi, /\blaravel\b/gi,
    /\bflutter\b/gi, /\bdart\b/gi, /\bkotlin\b/gi, /\bswift\b/gi,
    /\bfigma\b/gi, /\bjira\b/gi, /\bagile\b|\bscrum\b/gi,
    /\bllm\b|\bgenai\b|machine learning|\bml\b|ai\b/gi,
    /\blinux\b/gi, /\bterraform\b/gi, /\bpower\s?bi\b/gi,
  ];
  const found = new Set();
  for (const re of techPatterns) {
    const m = text.match(re);
    if (m) found.add(m[0].replace(/\s+/g, ' ').trim());
  }
  // Significant words (fallback)
  const words = norm(text).split(/[^a-z0-9+#.]+/).filter(w => w.length >= 4 && !STOP.has(w));
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const topWords = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).map(([w]) => w);
  return { tokens: [...found], topWords, raw: text };
}

function matchScore(skill, jd) {
  const s = norm(skill);
  if (!s) return 0;
  if (jd.tokens.some(t => norm(t).includes(s) || s.includes(norm(t)))) return 3;
  if (jd.topWords.some(w => s.includes(w) || w.includes(s))) return 1;
  return 0;
}

function tailorSummary(profile, jd, jdTitle) {
  const name = profile.name && profile.name !== 'Candidat' ? profile.name : 'Le candidat';
  const role = jdTitle || profile.goals?.targetRole || profile.headline || profile.archetype?.label || 'le poste visé';
  const level = profile.level === 'senior' ? 'Senior' : profile.level === 'entry' ? 'Junior' : 'Confirmé';
  const years = Number(profile.years) > 0 ? `${profile.years}+ ans d'expérience` : 'expérience pratique';
  const topSkills = (profile.skills || []).filter(s => matchScore(s, jd) > 0).slice(0, 5);
  const skillText = topSkills.length ? topSkills.join(', ') : (profile.skills || []).slice(0, 5).join(', ');
  const archetype = profile.archetype?.label || 'Profil polyvalent';
  const langText = (profile.languages || []).slice(0, 3).map(l => l.name).join(', ');
  const langPhrase = langText ? ` Communication en ${langText}.` : '';
  return `${level} ${archetype.toLowerCase()} avec ${years}, orienté résultats et livraison. Profil aligné sur ${role}, avec une pratique concrète de ${skillText || 'technologies modernes'}. Habitué à travailler en équipe, à documenter les choix techniques et à livrer des solutions fiables.${langPhrase}`;
}

function tailorHeadline(profile, jdTitle) {
  const base = profile.headline || profile.archetype?.label || 'Professionnel';
  if (!jdTitle) return base;
  const clean = String(jdTitle).replace(/\s+/g, ' ').trim().slice(0, 80);
  // If headline already close, keep it; otherwise blend
  if (norm(base).includes(norm(clean).slice(0, 20))) return base;
  return `${clean} · ${base}`.slice(0, 120);
}

function reorderSkills(skills, jd) {
  const arr = Array.isArray(skills) ? [...skills] : [];
  return arr
    .map(s => ({ s, score: matchScore(s, jd) }))
    .sort((a, b) => b.score - a.score || a.s.localeCompare(b.s))
    .map(x => x.s);
}

function highlightExperience(experience, jd) {
  const items = Array.isArray(experience) ? experience : [];
  return items.map(line => {
    const score = matchScore(line, jd);
    return { line: String(line), score };
  }).sort((a, b) => b.score - a.score).map(x => x.line);
}

function buildGaps(profile, jd) {
  const have = new Set((profile.skills || []).map(norm));
  const jdReq = jd.tokens.filter(t => {
    const n = norm(t);
    return n.length >= 2 && ![...have].some(h => h.includes(n) || n.includes(h));
  });
  return jdReq.slice(0, 6);
}

function buildMatch(profile, jd) {
  const skills = profile.skills || [];
  const matched = skills.filter(s => matchScore(s, jd) > 0);
  const total = Math.max(jd.tokens.length, 1);
  const pct = Math.min(98, Math.round((matched.length / total) * 100 + (matched.length ? 20 : 0)));
  return { matched, pct, missing: buildGaps(profile, jd) };
}

export function generateTailoredCV({ profile, jdText, jdTitle = '' }) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const jd = jdKeywords(jdText);
  const title = String(jdTitle || '').trim();
  const headline = tailorHeadline(p, title);
  const summary = tailorSummary(p, jd, title);
  const skills = reorderSkills(p.skills || [], jd);
  const experience = highlightExperience(p.experience || [], jd);
  const formations = Array.isArray(p.formations) ? p.formations : [];
  const certifications = Array.isArray(p.certifications) ? p.certifications : [];
  const languages = Array.isArray(p.languages) ? p.languages : [];
  const match = buildMatch(p, jd);

  const contact = [p.email, p.phone, ...(p.links || []), p.goals?.city].filter(Boolean);
  const date = new Date().toISOString().slice(0, 10);
  const safeName = (p.name || 'CV').replace(/[^A-Za-zÀ-ÿ0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'CV';
  const filename = `${safeName}-CV-adapte-${date}.html`;

  const skillChips = skills.map(s => {
    const hit = matchScore(s, jd) > 0;
    return `<span class="chip${hit ? ' hit' : ''}">${esc(s)}</span>`;
  }).join('');

  const expHtml = experience.length
    ? `<ul>${experience.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`
    : '<p class="muted">Ajoutez vos expériences dans le CV source pour un résultat plus fort.</p>';

  const eduHtml = formations.length
    ? `<ul>${formations.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`
    : '<p class="muted">Formation non renseignée.</p>';

  const certHtml = certifications.length
    ? `<ul>${certifications.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`
    : '';

  const langHtml = languages.length
    ? languages.map(l => `<span class="chip">${esc(l.name)}${l.level && l.level !== '—' ? ` · ${esc(l.level)}` : ''}</span>`).join('')
    : '<span class="muted">Non renseigné</span>';

  const matchedHtml = match.matched.length
    ? match.matched.slice(0, 12).map(s => `<span class="chip hit">${esc(s)}</span>`).join('')
    : '<span class="muted">Aucun mot-clé explicite détecté — ajoutez des compétences dans le CV.</span>';
  const missingHtml = match.missing.length
    ? match.missing.map(s => `<span class="chip gap">${esc(s)}</span>`).join('')
    : '<span class="muted">Aucun écart majeur détecté sur les mots-clés techniques.</span>';

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(p.name || 'CV')} — CV adapté</title>
<style>
  :root{--ink:#111827;--muted:#4b5563;--line:#dbe3ee;--accent:#1d4ed8;--accent-soft:#eff6ff;--bg:#ffffff;}
  *{box-sizing:border-box} body{margin:0;background:#f3f4f6;color:var(--ink);font:14px/1.45 "Inter","Segoe UI",Arial,sans-serif}
  .page{width:210mm;min-height:297mm;margin:12mm auto;background:var(--bg);padding:16mm 16mm 14mm;box-shadow:0 8px 30px rgba(0,0,0,.08)}
  h1{margin:0;font-size:28px;line-height:1.1;letter-spacing:-.02em} .headline{margin:4px 0 0;font-size:13px;color:var(--accent);font-weight:600}
  .contact{margin:8px 0 0;color:var(--muted);font-size:12px;display:flex;flex-wrap:wrap;gap:4px 12px}
  .rule{height:2px;background:linear-gradient(90deg,var(--accent),#93c5fd);margin:14px 0 12px;border:0}
  .grid{display:grid;grid-template-columns:1.65fr 1fr;gap:18px}
  h2{margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--accent)}
  section{margin:0 0 14px} p{margin:0 0 8px} ul{margin:0;padding-left:18px} li{margin:0 0 5px}
  .muted{color:var(--muted)} .chip{display:inline-block;padding:3px 8px;margin:0 6px 6px 0;border-radius:999px;background:#f3f4f6;border:1px solid #e5e7eb;font-size:11px}
  .chip.hit{background:var(--accent-soft);border-color:#bfdbfe;color:#1e40af}
  .chip.gap{background:#fff7ed;border-color:#fed7aa;color:#9a3412}
  .box{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:10px 12px}
  .match{font-size:12px;color:var(--muted);margin-bottom:8px} .match strong{color:var(--ink)}
  .actions{width:210mm;margin:10px auto 0;display:flex;gap:8px;justify-content:flex-end}
  .btn{appearance:none;border:1px solid #cbd5e1;background:#fff;color:#0f172a;padding:8px 12px;border-radius:8px;font:600 12px/1 system-ui;cursor:pointer}
  .btn.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
  @media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:auto}.actions{display:none}}
  @page{size:A4;margin:0}
</style>
</head>
<body>
  <div class="actions">
    <button class="btn" onclick="window.print()">Imprimer / PDF</button>
  </div>
  <main class="page">
    <header>
      <h1>${esc(p.name || 'Candidat')}</h1>
      <div class="headline">${esc(headline)}</div>
      <div class="contact">${contact.map(c => `<span>${esc(c)}</span>`).join('')}</div>
    </header>
    <hr class="rule"/>
    <div class="grid">
      <div>
        <section>
          <h2>Profil</h2>
          <p>${esc(summary)}</p>
        </section>
        <section>
          <h2>Expérience & Projets</h2>
          ${expHtml}
        </section>
        <section>
          <h2>Formation</h2>
          ${eduHtml}
        </section>
        ${certHtml ? `<section><h2>Certifications</h2>${certHtml}</section>` : ''}
      </div>
      <aside>
        <section class="box">
          <h2>Adéquation au poste</h2>
          <div class="match"><strong>${match.pct}%</strong> de correspondance mots-clés (estimation locale)</div>
          <div style="margin-bottom:8px"><div class="muted" style="font-size:11px;margin-bottom:4px">Mots-clés couverts</div>${matchedHtml}</div>
          <div><div class="muted" style="font-size:11px;margin-bottom:4px">À renforcer / à mentionner si vrai</div>${missingHtml}</div>
        </section>
        <section>
          <h2>Compétences</h2>
          <div>${skillChips || '<span class="muted">Non renseigné</span>'}</div>
        </section>
        <section>
          <h2>Langues</h2>
          <div>${langHtml}</div>
        </section>
        <section>
          <h2>Cible</h2>
          <p class="muted" style="font-size:12px">${esc(title || p.goals?.targetRole || 'Poste visé non précisé')}</p>
        </section>
      </aside>
    </div>
  </main>
</body>
</html>`;

  return {
    html,
    filename,
    headline,
    summary,
    match,
    skills,
    experience,
  };
}
