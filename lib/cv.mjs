// Local CV generator — no external APIs. Tailored, printable A4 HTML CV.
// Supports FR/EN labels, evidence, and guardrails. Vercel-safe.

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const STOP = new Set(['the','and','for','with','you','your','our','are','will','have','this','that','from','who','job','role','work','team','experience','years','year','plus','ability','skills','knowledge','strong','good','using','use','within','into','least','more','than','including','such','other','all','any','not','can','une','des','les','pour','avec','vous','nous','dans','sur','est','qui','que','pas','par','votre','notre','poste','profil','experience','competences']);

const L = {
  fr: { profile:'Profil', exp:'Expérience & Projets', edu:'Formation', certs:'Certifications', skills:'Compétences', langs:'Langues', target:'Cible', fit:'Adéquation au poste', fitNote:'de correspondance mots-clés (estimation locale)', covered:'Mots-clés couverts', reinforce:'À renforcer / à mentionner si vrai', noExp:'Ajoutez vos expériences dans le CV source pour un résultat plus fort.', noEdu:'Formation non renseignée.', noLang:'Non renseigné', noSkill:'Non renseigné', noKw:'Aucun mot-clé explicite détecté — ajoutez des compétences dans le CV.', noGap:'Aucun écart majeur détecté sur les mots-clés techniques.', targetNone:'Poste visé non précisé', print:'Imprimer / PDF', adapted:'CV adapté' },
  en: { profile:'Profile', exp:'Experience & Projects', edu:'Education', certs:'Certifications', skills:'Skills', langs:'Languages', target:'Target', fit:'Job fit', fitNote:'keyword match (local estimate)', covered:'Matched keywords', reinforce:'Strengthen if true', noExp:'Add experience to your source CV for a stronger result.', noEdu:'Education not listed.', noLang:'Not listed', noSkill:'Not listed', noKw:'No explicit keywords detected — add skills to your CV.', noGap:'No major technical keyword gaps detected.', targetNone:'Target role not specified', print:'Print / PDF', adapted:'Tailored CV' },
};

const REQUIRED_HDR_CV = /(?:^|\n)\s*(?:requirements?|must[- ]have|required|profil recherch[eé]|comp[eé]tences requises|exigences?|requis)\s*[:：]/i;
const PREFERRED_HDR_CV = /(?:^|\n)\s*(?:nice[- ]to[- ]have|preferred|bonus|atouts?|plus|souhait[eé])\s*[:：]/i;

function splitSectionsCV(jdText) {
  const text = String(jdText || '');
  const reqMatch = text.match(REQUIRED_HDR_CV);
  const prefMatch = text.match(PREFERRED_HDR_CV);
  if (!reqMatch && !prefMatch) return { required: text, preferred: '' };
  const reqIdx = reqMatch ? reqMatch.index : -1;
  const prefIdx = prefMatch ? prefMatch.index : -1;
  if (prefIdx === -1) return { required: text.slice(reqIdx >= 0 ? reqIdx : 0), preferred: '' };
  if (reqIdx === -1) return { required: '', preferred: text.slice(prefIdx) };
  if (reqIdx < prefIdx) return { required: text.slice(reqIdx, prefIdx), preferred: text.slice(prefIdx) };
  return { required: text.slice(0, prefIdx), preferred: text.slice(prefIdx) };
}

function jdKeywords(jdText) {
  const text = String(jdText || '');
  const { required, preferred } = splitSectionsCV(text);
  const techPatterns = [
    /\breact(?:\.?js)?\b/gi,/\bnode(?:\.?js)?\b/gi,/\btypescript\b/gi,/\bjavascript\b/gi,/\bpython\b/gi,/\bjava\b(?!script)/gi,/\bphp\b/gi,/\bc#\b|\.net\b|asp\.net/gi,/\bangular\b/gi,/\bvue(?:\.?js)?\b/gi,/\bnext\.?js\b/gi,/\bnuxt\b/gi,/\bdocker\b/gi,/\bkubernetes\b|\bk8s\b/gi,/\baws\b/gi,/\bazure\b/gi,/\bgcp\b/gi,/\bpostgres(?:ql)?\b/gi,/\bmongodb\b/gi,/\bmysql\b/gi,/\bsql\b/gi,/\bredis\b/gi,/\bgit\b/gi,/\bci\/?cd\b/gi,/\brest(?:ful)?\s*api/gi,/\bgraphql\b/gi,/\bfastapi\b/gi,/\bdjango\b/gi,/\bspring(?:-?boot)?\b/gi,/\blaravel\b/gi,/\bflutter\b/gi,/\bdart\b/gi,/\bkotlin\b/gi,/\bswift\b/gi,/\bfigma\b/gi,/\bjira\b/gi,/\bagile\b|\bscrum\b/gi,/\bllm\b|\bgenai\b|machine learning|\bml\b|ai\b/gi,/\blinux\b/gi,/\bterraform\b/gi,/\bpower\s?bi\b/gi,
  ];
  const collect = (src, weight) => {
    const found = new Set();
    for (const re of techPatterns) { const m = src.match(re); if (m) found.add(m[0].replace(/\s+/g,' ').trim()); }
    return [...found].map(t => ({ token: t, weight }));
  };
  const requiredTokens = collect(required, 2);
  const preferredTokens = collect(preferred, 1);
  const byToken = new Map();
  for (const t of [...preferredTokens, ...requiredTokens]) byToken.set(norm(t.token), t);
  const tokens = [...byToken.values()].map(t => t.token);
  const weights = Object.fromEntries([...byToken.entries()].map(([k, v]) => [k, v.weight]));
  const words = norm(text).split(/[^a-z0-9+#.]+/).filter(w => w.length >= 4 && !STOP.has(w));
  const freq = new Map(); for (const w of words) freq.set(w, (freq.get(w)||0)+1);
  const topWords = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,18).map(([w])=>w);
  return { tokens, topWords, raw: text, weights };
}

function matchScore(skill, jd) {
  const s = norm(skill); if (!s) return 0;
  const w = (t) => (jd.weights && jd.weights[norm(t)]) || 1;
  const m = jd.tokens.find(t => norm(t).includes(s) || s.includes(norm(t)));
  if (m) return 3 * w(m);
  if (jd.topWords.some(wrd => s.includes(wrd) || wrd.includes(s))) return 1;
  return 0;
}

function evidenceFor(skill, profile) {
  const n = norm(skill); const ev = [];
  if ((profile.skills||[]).some(s => norm(s).includes(n) || n.includes(norm(s)))) ev.push('skills');
  if ((profile.experience||[]).some(s => norm(s).includes(n))) ev.push('experience');
  if ((profile.formations||[]).some(s => norm(s).includes(n))) ev.push('formation');
  if ((profile.certifications||[]).some(s => norm(s).includes(n))) ev.push('certification');
  return ev;
}

function tailorSummary(profile, jd, jdTitle, lang) {
  const role = jdTitle || profile.goals?.targetRole || profile.headline || profile.archetype?.label || (lang==='en'?'the target role':'le poste visé');
  const level = profile.level === 'senior' ? 'Senior' : profile.level === 'entry' ? 'Junior' : (lang==='en'?'Mid-level':'Confirmé');
  const years = Number(profile.years) > 0 ? (lang==='en'?`${profile.years}+ years of experience`:`${profile.years}+ ans d'expérience`) : (lang==='en'?'hands-on experience':'expérience pratique');
  const topSkills = (profile.skills || []).filter(s => matchScore(s, jd) > 0).slice(0, 5);
  const skillText = topSkills.length ? topSkills.join(', ') : (profile.skills || []).slice(0, 5).join(', ');
  const archetype = profile.archetype?.label || (lang==='en'?'Versatile profile':'Profil polyvalent');
  const langText = (profile.languages || []).slice(0, 3).map(l => l.name).join(', ');
  // Dynamic: pull a real experience highlight
  const expHighlight = (profile.experience || []).find(e => matchScore(e, jd) > 0) || (profile.experience || [])[0] || '';
  const expSnippet = expHighlight ? (lang==='en' ? ` Notably: ${expHighlight.slice(0, 120)}.` : ` Point fort : ${expHighlight.slice(0, 120)}.`) : '';
  if (lang === 'en') {
    const lp = langText ? ` Communicates in ${langText}.` : '';
    return `${level} ${archetype.toLowerCase()} with ${years}, aligned with ${role}. Core stack: ${skillText || 'modern technologies'}. ${expSnippet} Comfortable collaborating in teams, documenting technical decisions, and shipping reliable solutions.${lp}`;
  }
  const lp = langText ? ` Communication en ${langText}.` : '';
  return `${level} ${archetype.toLowerCase()} avec ${years}, aligné sur ${role}. Stack principale : ${skillText || 'technologies modernes'}. ${expSnippet} Habitué à travailler en équipe, à documenter les choix techniques et à livrer des solutions fiables.${lp}`;
}

function tailorHeadline(profile, jdTitle) {
  const base = profile.headline || profile.archetype?.label || 'Professionnel';
  if (!jdTitle) return base;
  const clean = String(jdTitle).replace(/\s+/g,' ').trim().slice(0,80);
  if (norm(base).includes(norm(clean).slice(0,20))) return base;
  return `${clean} · ${base}`.slice(0,120);
}

function reorderSkills(skills, jd) { return (Array.isArray(skills)?[...skills]:[]).map(s=>({s,score:matchScore(s,jd)})).sort((a,b)=>b.score-a.score||a.s.localeCompare(b.s)).map(x=>x.s); }
function highlightExperience(experience, jd) { return (Array.isArray(experience)?experience:[]).map(line=>({line:String(line),score:matchScore(line,jd)})).sort((a,b)=>b.score-a.score).map(x=>x.line); }
function boldKeywords(text, jd) {
  let result = esc(text);
  for (const t of (jd.tokens||[])) {
    const re = new RegExp('('+t.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')+')', 'gi');
    result = result.replace(re, '<strong>$1</strong>');
  }
  return result;
}
function buildGaps(profile, jd) { const have = new Set((profile.skills||[]).map(norm)); return jd.tokens.filter(t => { const n=norm(t); return n.length>=2 && ![...have].some(h=>h.includes(n)||n.includes(h)); }).slice(0,6); }
function buildMatch(profile, jd) { const skills=profile.skills||[]; const matched=skills.filter(s=>matchScore(s,jd)>0); const w=(t)=>(jd.weights&&jd.weights[norm(t)])||1; const totalW=Math.max(jd.tokens.reduce((a,t)=>a+w(t),0),1); const matchedTokens=jd.tokens.filter(t=>skills.some(s=>{const n=norm(s);return norm(t).includes(n)||n.includes(norm(t));})); const matchedW=matchedTokens.reduce((a,t)=>a+w(t),0); const pct=jd.tokens.length ? Math.min(100,Math.round((matchedW/totalW)*100)) : 0; return { matched, pct, missing: buildGaps(profile,jd) }; }

export function generateTailoredCV({ profile, jdText, jdTitle = '', lang = 'fr' }) {
  const p = profile && typeof profile === 'object' ? profile : {};
  const Lg = L[lang] || L.fr;
  const jd = jdKeywords(jdText);
  const title = String(jdTitle || '').trim();
  const headline = tailorHeadline(p, title);
  const summary = tailorSummary(p, jd, title, lang);
  const skills = reorderSkills(p.skills || [], jd);
  const experience = highlightExperience(p.experience || [], jd);
  const formations = Array.isArray(p.formations) ? p.formations : [];
  const certifications = Array.isArray(p.certifications) ? p.certifications : [];
  const languages = Array.isArray(p.languages) ? p.languages : [];
  const match = buildMatch(p, jd);
  const evidence = match.matched.map(s => ({ skill: s, foundIn: evidenceFor(s, p) }));
  const guardrails = [
    lang==='en' ? 'Only add missing keywords if you truly have that experience.' : 'N’ajoutez un mot-clé manquant que si vous l’avez réellement pratiqué.',
    lang==='en' ? 'Do not invent metrics, titles, dates, or companies.' : 'N’inventez pas de chiffres, titres, dates ou entreprises.',
    lang==='en' ? 'Review the generated summary before sending.' : 'Relisez le résumé généré avant envoi.',
  ];

  const contact = [p.email, p.phone, ...(p.links || []), p.goals?.city].filter(Boolean);
  const date = new Date().toISOString().slice(0, 10);
  const safeName = (p.name || 'CV').replace(/[^A-Za-zÀ-ÿ0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'CV';
  const suffix = lang === 'en' ? 'tailored' : 'adapte';
  const filename = `${safeName}-CV-${suffix}-${date}.html`;

  const skillChips = skills.map(s => { const hit = matchScore(s,jd)>0; return `<span class="chip${hit?' hit':''}">${esc(s)}</span>`; }).join('');
  const expHtml = experience.length ? `<ul>${experience.map(e=>`<li>${boldKeywords(e, jd)}</li>`).join('')}</ul>` : `<p class="muted">${esc(Lg.noExp)}</p>`;
  const eduHtml = formations.length ? `<ul>${formations.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>` : `<p class="muted">${esc(Lg.noEdu)}</p>`;
  const certHtml = certifications.length ? `<ul>${certifications.map(e=>`<li>${esc(e)}</li>`).join('')}</ul>` : '';
  const langHtml = languages.length ? languages.map(l=>`<span class="chip">${esc(l.name)}${l.level&&l.level!=='—'?` · ${esc(l.level)}`:''}</span>`).join('') : `<span class="muted">${esc(Lg.noLang)}</span>`;
  const matchedHtml = match.matched.length ? match.matched.slice(0,12).map(s=>`<span class="chip hit">${esc(s)}</span>`).join('') : `<span class="muted">${esc(Lg.noKw)}</span>`;
  const missingHtml = match.missing.length ? match.missing.map(s=>`<span class="chip gap">${esc(s)}</span>`).join('') : `<span class="muted">${esc(Lg.noGap)}</span>`;
  const evidenceHtml = evidence.length ? `<div class="evidence">${evidence.slice(0,8).map(e=>`<div><strong>${esc(e.skill)}</strong><span>${esc(e.foundIn.join(', ')||'profile')}</span></div>`).join('')}</div>` : '';
  const guardHtml = `<ul class="guard">${guardrails.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>`;

  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(p.name || 'CV')} — ${esc(Lg.adapted)}</title>
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
  .chip.hit{background:var(--accent-soft);border-color:#bfdbfe;color:#1e40af}.chip.gap{background:#fff7ed;border-color:#fed7aa;color:#9a3412}
  .box{background:#f8fafc;border:1px solid var(--line);border-radius:10px;padding:10px 12px}
  .match{font-size:12px;color:var(--muted);margin-bottom:8px} .match strong{color:var(--ink)}
  .evidence div{display:flex;justify-content:space-between;gap:8px;font-size:11px;padding:3px 0;border-bottom:1px dashed #e5e7eb}.evidence span{color:var(--muted)}
  .guard{margin:6px 0 0;padding-left:16px;font-size:11px;color:var(--muted)}
  .actions{width:210mm;margin:10px auto 0;display:flex;gap:8px;justify-content:flex-end}
  .btn{appearance:none;border:1px solid #cbd5e1;background:#fff;color:#0f172a;padding:8px 12px;border-radius:8px;font:600 12px/1 system-ui;cursor:pointer}
  @media print{body{background:#fff}.page{margin:0;box-shadow:none;width:auto;min-height:auto}.actions{display:none}} @page{size:A4;margin:0}
</style></head><body>
  <div class="actions"><button class="btn" onclick="window.print()">${esc(Lg.print)}</button></div>
  <main class="page">
    <header><h1>${esc(p.name || 'Candidat')}</h1><div class="headline">${esc(headline)}</div><div class="contact">${contact.map(c=>`<span>${esc(c)}</span>`).join('')}</div></header>
    <hr class="rule"/>
    <div class="grid"><div>
      <section><h2>${esc(Lg.profile)}</h2><p>${esc(summary)}</p></section>
      <section><h2>${esc(Lg.exp)}</h2>${expHtml}</section>
      <section><h2>${esc(Lg.edu)}</h2>${eduHtml}</section>
      ${certHtml?`<section><h2>${esc(Lg.certs)}</h2>${certHtml}</section>`:''}
    </div><aside>
      <section class="box"><h2>${esc(Lg.fit)}</h2><div class="match"><strong>${match.pct}%</strong> ${esc(Lg.fitNote)}</div>
        <div style="margin-bottom:8px"><div class="muted" style="font-size:11px;margin-bottom:4px">${esc(Lg.covered)}</div>${matchedHtml}</div>
        <div style="margin-bottom:8px"><div class="muted" style="font-size:11px;margin-bottom:4px">${esc(Lg.reinforce)}</div>${missingHtml}</div>
        ${evidenceHtml?`<div style="margin-top:8px"><div class="muted" style="font-size:11px;margin-bottom:4px">Evidence</div>${evidenceHtml}</div>`:''}
        ${guardHtml}
      </section>
      <section><h2>${esc(Lg.skills)}</h2><div>${skillChips || `<span class="muted">${esc(Lg.noSkill)}</span>`}</div></section>
      <section><h2>${esc(Lg.langs)}</h2><div>${langHtml}</div></section>
      <section><h2>${esc(Lg.target)}</h2><p class="muted" style="font-size:12px">${esc(title || p.goals?.targetRole || Lg.targetNone)}</p></section>
    </aside></div>
  </main></body></html>`;

  return { html, filename, headline, summary, match, skills, experience, evidence, guardrails, lang };
}
