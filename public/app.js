/* Orient TN — zero-framework front end.
   Progressive enhancement: full flow works without GSAP and without motion. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const I18N = {
    fr: {
      navHow: 'Comment ça marche', navPortals: 'Portails', navTool: 'L’outil', navCta: 'Commencer',
      heroEyebrow: 'ORIENTATION · INSERTION · TUNISIE',
      heroTitle: 'Votre CV mérite<br/>mieux qu’un <em>dossier</em>.',
      heroLede: 'Déposez votre CV. On lit votre parcours, on comprend votre objectif — CDI, stage PFE ou SIVP — et on vous montre les portails et les offres qui correspondent vraiment.',
      heroCta: 'Analyser mon CV', heroSee: 'Voir comment ça marche',
      heroMeta1: 'Gratuit, sans compte', heroMeta2: 'Vos données restent sur votre appareil',
      pcName: 'Amira Mansouri', pcRole: 'Ingénieure informatique · Tunis', pcBadge: 'Profil détecté',
      pcSkills: 'Compétences', pcFit: 'Compatibilité', pcContracts: 'Contrats', pcLive: 'Analyse en direct',
      trustLabel: 'Connecté à votre marché',
      howKicker: 'EN TROIS ÉTAPES', howTitle: 'Du CV à l’opportunité, sans détour.',
      step1t: 'Déposez votre CV', step1d: 'PDF ou DOCX, ou collez simplement votre texte. Ensuite, dites-nous ce que vous cherchez : CDI, CDD, stage PFE, SIVP…',
      step2t: 'On lit votre profil', step2d: 'Compétences, formations, certifications, langues et niveau. Une lecture assistée par IA, sans invention, avec les points à renforcer.',
      step3t: 'Trouvez votre voie', step3d: 'Recherches pré-remplies sur les portails tunisiens et offres en direct, classées selon votre profil. Vous postulez vous-même.',
      studioKicker: 'VOTRE ESPACE', studioTitle: 'Construisons votre profil.',
      pill1: 'CV & objectif', pill2: 'Mon profil', pill3: 'Opportunités',
      p1title: 'Commençons par votre CV', p1sub: 'Deux façons de faire — choisissez la plus simple.',
      dropTitle: 'Glissez votre CV ici', dropSub: 'PDF, DOCX, TXT · 3,5 Mo max', dropBtn: 'ou choisir un fichier',
      or: 'ou collez le texte', pasteLabel: 'Texte du CV',
      goalTitle: 'Votre objectif', lContract: 'Type de contrat', lRole: 'Poste visé',
      lCity: 'Ville', lMode: 'Mode', lAvailability: 'Disponibilité',
      analyzeBtn: 'Lire mon CV',
      scanTitle: 'Lecture de votre parcours…', scanSub: 'Repérage des compétences',
      scanStatuses: ['Repérage des compétences', 'Lecture des formations et certificats', 'Comparaison avec votre objectif'],
      resultKicker: 'VOTRE PROFIL EN UN COUP D’ŒIL', ringLabel: 'complétude',
      blockSkills: 'Compétences', blockFormations: 'Formations', blockCerts: 'Certifications', blockLangues: 'Langues',
      insightTitle: 'Votre angle le plus fort',
      back: 'Modifier mes informations', toJobs: 'Voir mes opportunités',
      jobsKicker: 'MATCHÉ AVEC VOTRE PROFIL', jobsTitle: 'Où regarder maintenant', liveTitle: 'Offres en direct',
      back2: 'Revoir mon profil', restart: 'Recommencer avec un autre CV',
      ctaTitle: 'Votre prochain chapitre commence ici.', ctaBtn: 'Déposer mon CV',
      footNote: 'Fait pour les étudiants et diplômés tunisiens.', footTop: 'Retour en haut ↑',
      disclaimer: 'Outil d’orientation : les scores sont indicatifs et les offres doivent être vérifiées à la source. Aucune candidature n’est envoyée automatiquement.',
      dyn: {
        candidate: 'Candidat', years: 'années d’expérience estimées', level: 'Niveau',
        entry: 'Débutant', mid: 'Intermédiaire', senior: 'Senior',
        none: 'Non renseigné', match: 'match', view: 'Voir l’offre',
        jobsSubtitle: '{name}, {n} offres analysées selon votre objectif et vos compétences.',
        archetype: 'Votre profil se rapproche d’un profil « {label} ». C’est l’angle à mettre en avant dans vos candidatures.',
        gaps: 'À renforcer : {list}', noJobs: 'Aucune offre en direct pour ce filtre. Les portails ci-dessus restent la meilleure piste.',
        reasonSkills: '{n} compétences en commun', reasonRole: 'intitulé proche de votre objectif',
        reasonLocation: 'localisation compatible', reasonEntry: 'niveau débutant',
        reasonSenior: 'niveau senior', reasonSeniorReq: 'profil senior demandé',
        errFormat: 'Formats acceptés : PDF, DOCX, TXT, MD.', errSize: 'Fichier trop volumineux (3,5 Mo max).',
        errNeed: 'Ajoutez un fichier ou collez au moins quelques lignes de votre CV.',
        errAnalyze: 'Lecture impossible. Réessayez avec un autre fichier ou collez le texte du CV.',
        errJobs: 'Impossible de charger les offres pour le moment. Réessayez dans un instant.',
        restored: 'Profil restauré',
        engineAi: 'Analyse IA', engineHeuristic: 'Lecture locale',
        engineFallback: 'Analyse IA indisponible — lecture locale utilisée.',
      },
      ph: { role: 'ex. Développeur React, Data Analyst…', cv: 'Nom, expériences, formations, compétences, langues…' },
      contract: { 'CDI': 'CDI', 'CDD': 'CDD', 'Stage PFE': 'Stage PFE', 'SIVP': 'SIVP', 'CIVP': 'CIVP', 'Alternance': 'Alternance', 'Freelance': 'Freelance' },
      mode: { 'Hybride': 'Hybride', 'Sur site': 'Sur site', 'Télétravail': 'Télétravail' },
      availability: { 'Immédiate': 'Immédiate', '1 mois': '1 mois', '3 mois': '3 mois', 'En recherche active': 'En recherche active' },
    },
    en: {
      navHow: 'How it works', navPortals: 'Portals', navTool: 'The tool', navCta: 'Get started',
      heroEyebrow: 'GUIDANCE · EMPLOYMENT · TUNISIA',
      heroTitle: 'Your CV deserves<br/>more than a <em>folder</em>.',
      heroLede: 'Upload your CV. We read your background, understand your goal — permanent role, internship or SIVP — and show you the portals and offers that actually fit.',
      heroCta: 'Analyze my CV', heroSee: 'See how it works',
      heroMeta1: 'Free, no account', heroMeta2: 'Your data stays on your device',
      pcName: 'Amira Mansouri', pcRole: 'Computer engineer · Tunis', pcBadge: 'Profile detected',
      pcSkills: 'Skills', pcFit: 'Match', pcContracts: 'Contracts', pcLive: 'Live analysis',
      trustLabel: 'Connected to your market',
      howKicker: 'IN THREE STEPS', howTitle: 'From CV to opportunity, no detours.',
      step1t: 'Upload your CV', step1d: 'PDF or DOCX, or just paste your text. Then tell us what you want: permanent, fixed-term, internship, SIVP…',
      step2t: 'We read your profile', step2d: 'Skills, education, certificates, languages and level. An AI-assisted read, no invented facts, with the gaps to work on.',
      step3t: 'Find your way', step3d: 'Pre-filled searches on Tunisian portals plus live offers, ranked against your profile. You apply yourself.',
      studioKicker: 'YOUR SPACE', studioTitle: 'Let’s build your profile.',
      pill1: 'CV & goal', pill2: 'My profile', pill3: 'Opportunities',
      p1title: 'Start with your CV', p1sub: 'Two ways — pick whichever is easier.',
      dropTitle: 'Drop your CV here', dropSub: 'PDF, DOCX, TXT · 3.5 MB max', dropBtn: 'or choose a file',
      or: 'or paste the text', pasteLabel: 'CV text',
      goalTitle: 'Your goal', lContract: 'Contract type', lRole: 'Target role',
      lCity: 'City', lMode: 'Mode', lAvailability: 'Availability',
      analyzeBtn: 'Read my CV',
      scanTitle: 'Reading your background…', scanSub: 'Finding your skills',
      scanStatuses: ['Finding your skills', 'Reading education and certificates', 'Comparing with your goal'],
      resultKicker: 'YOUR PROFILE AT A GLANCE', ringLabel: 'completeness',
      blockSkills: 'Skills', blockFormations: 'Education', blockCerts: 'Certificates', blockLangues: 'Languages',
      insightTitle: 'Your strongest angle',
      back: 'Edit my details', toJobs: 'See my opportunities',
      jobsKicker: 'MATCHED TO YOUR PROFILE', jobsTitle: 'Where to look now', liveTitle: 'Live offers',
      back2: 'Back to my profile', restart: 'Start over with another CV',
      ctaTitle: 'Your next chapter starts here.', ctaBtn: 'Upload my CV',
      footNote: 'Built for Tunisian students and graduates.', footTop: 'Back to top ↑',
      disclaimer: 'Guidance tool: scores are indicative and offers must be checked at the source. No application is sent automatically.',
      dyn: {
        candidate: 'Candidate', years: 'years of experience estimated', level: 'Level',
        entry: 'Entry', mid: 'Mid-level', senior: 'Senior',
        none: 'Not listed', match: 'match', view: 'View job',
        jobsSubtitle: '{name}, {n} offers analyzed against your goal and skills.',
        archetype: 'Your profile is close to a “{label}” profile. That’s the angle to lead with in applications.',
        gaps: 'To strengthen: {list}', noJobs: 'No live offers for this filter. The portals above remain your best lead.',
        reasonSkills: '{n} skills in common', reasonRole: 'title close to your goal',
        reasonLocation: 'compatible location', reasonEntry: 'entry-level role',
        reasonSenior: 'senior-level role', reasonSeniorReq: 'senior profile required',
        errFormat: 'Accepted formats: PDF, DOCX, TXT, MD.', errSize: 'File too large (3.5 MB max).',
        errNeed: 'Add a file or paste at least a few lines of your CV.',
        errAnalyze: 'Could not read it. Try another file or paste the CV text.',
        errJobs: 'Could not load offers right now. Try again in a moment.',
        restored: 'Profile restored',
        engineAi: 'AI analysis', engineHeuristic: 'Local analysis',
        engineFallback: 'AI unavailable — local analysis used.',
      },
      ph: { role: 'e.g. React Developer, Data Analyst…', cv: 'Name, experience, education, skills, languages…' },
      contract: { 'CDI': 'Permanent (CDI)', 'CDD': 'Fixed-term (CDD)', 'Stage PFE': 'Internship / final-year project', 'SIVP': 'SIVP', 'CIVP': 'CIVP', 'Alternance': 'Apprenticeship', 'Freelance': 'Freelance' },
      mode: { 'Hybride': 'Hybrid', 'Sur site': 'On-site', 'Télétravail': 'Remote' },
      availability: { 'Immédiate': 'Immediately', '1 mois': '1 month', '3 mois': '3 months', 'En recherche active': 'Actively searching' },
    },
    ar: {
      navHow: 'كيف يعمل', navPortals: 'البوابات', navTool: 'الأداة', navCta: 'ابدأ الآن',
      heroEyebrow: 'توجيه · تشغيل · تونس',
      heroTitle: 'سيرتك الذاتية تستحق<br/>أكثر من <em>ملف</em>.',
      heroLede: 'ارفع سيرتك الذاتية. نقرأ مسارك ونفهم هدفك — عقد دائم، تربص أو SIVP — ونعرض لك البوابات والعروض التي تناسبك فعلاً.',
      heroCta: 'حلّل سيرتي', heroSee: 'شاهد كيف يعمل',
      heroMeta1: 'مجاني، دون حساب', heroMeta2: 'بياناتك تبقى على جهازك',
      pcName: 'أميرة منصوري', pcRole: 'مهندسة إعلامية · تونس', pcBadge: 'تم رصد الملف',
      pcSkills: 'المهارات', pcFit: 'التطابق', pcContracts: 'العقود', pcLive: 'تحليل مباشر',
      trustLabel: 'متصل بسوقك',
      howKicker: 'في ثلاث خطوات', howTitle: 'من السيرة إلى الفرصة، بلا ملفات.',
      step1t: 'ارفع سيرتك', step1d: 'PDF أو DOCX، أو الصق النص مباشرة. ثم أخبرنا بما تبحث عنه: CDI، CDD، تربص تخرج، SIVP…',
      step2t: 'نقرأ ملفك', step2d: 'المهارات، التكوينات، الشهادات، اللغات والمستوى. قراءة بمساعدة الذكاء الاصطناعي، بلا اختراق، مع نقاط يجب تقويتها.',
      step3t: 'اعثر على طريقك', step3d: 'عمليات بحث جاهزة على البوابات التونسية وعروض مباشرة، مرتّبة حسب ملفك. أنت من يتقدّم.',
      studioKicker: 'مساحتك', studioTitle: 'لنبنِ ملفك.',
      pill1: 'السيرة والهدف', pill2: 'ملفي', pill3: 'الفرص',
      p1title: 'لنبدأ بسيرتك', p1sub: 'طريقتان — اختر الأسهل.',
      dropTitle: 'اسحب سيرتك إلى هنا', dropSub: 'PDF، DOCX، TXT · 3,5 ميغابايت كحد أقصى', dropBtn: 'أو اختر ملفاً',
      or: 'أو الصق النص', pasteLabel: 'نص السيرة',
      goalTitle: 'هدفك', lContract: 'نوع العقد', lRole: 'الوظيفة المستهدفة',
      lCity: 'المدينة', lMode: 'النمط', lAvailability: 'التوفر',
      analyzeBtn: 'اقرأ سيرتي',
      scanTitle: 'جارٍ قراءة مسارك…', scanSub: 'رصد المهارات',
      scanStatuses: ['رصد المهارات', 'قراءة التكوينات والشهادات', 'المقارنة مع هدفك'],
      resultKicker: 'ملفك في لمحة', ringLabel: 'الاكتمال',
      blockSkills: 'المهارات', blockFormations: 'التكوينات', blockCerts: 'الشهادات', blockLangues: 'اللغات',
      insightTitle: 'أقوى زاوية لديك',
      back: 'تعديل معلوماتي', toJobs: 'شاهد فرصي',
      jobsKicker: 'مطابق لملفك', jobsTitle: 'أين تبحث الآن', liveTitle: 'عروض مباشرة',
      back2: 'العودة إلى ملفي', restart: 'ابدأ بسيرة أخرى',
      ctaTitle: 'فصلك القادم يبدأ هنا.', ctaBtn: 'ارفع سيرتي',
      footNote: 'موجّه للطلاب والخريجين التونسيين.', footTop: 'العودة للأعلى ↑',
      disclaimer: 'أداة توجيه: الدرجات تقريبية ويجب التحقق من العروض في مصدرها. لا يتم إرسال أي ترشّح تلقائياً.',
      dyn: {
        candidate: 'مُرشّح', years: 'سنة خبرة مقدّرة', level: 'المستوى',
        entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير',
        none: 'غير مذكور', match: 'تطابق', view: 'عرض الوظيفة',
        jobsSubtitle: '{name}، تم تحليل {n} عرضاً حسب هدفك ومهاراتك.',
        archetype: 'ملفك قريب من ملف «{label}». هذه هي الزاوية التي يجب إبرازها في ترشّحاتك.',
        gaps: 'نقاط للتقوية: {list}', noJobs: 'لا توجد عروض مباشرة لهذا المرشّح. البوابات أعلاه تبقى أفضل طريق.',
        reasonSkills: '{n} مهارات مشتركة', reasonRole: 'عنوان قريب من هدفك',
        reasonLocation: 'موقع متوافق', reasonEntry: 'وظيفة مبتدئة',
        reasonSenior: 'وظيفة خبيرة', reasonSeniorReq: 'مطلوب ملف خبير',
        errFormat: 'الصيغ المقبولة: PDF، DOCX، TXT، MD.', errSize: 'الملف كبير جداً (3,5 ميغابايت كحد أقصى).',
        errNeed: 'أضف ملفاً أو الصق بضعة أسطر من سيرتك.',
        errAnalyze: 'تعذّت القراءة. جرّب ملفاً آخر أو الصق نص السيرة.',
        errJobs: 'تعذّر تحميل العروض الآن. حاول بعد قليل.',
        restored: 'تمت استعادة الملف',
        engineAi: 'تحليل بالذكاء الاصطناعي', engineHeuristic: 'تحليل محلي',
        engineFallback: 'تعذّر التحليل بالذكاء الاصطناعي — تم استخدام التحليل المحلي.',
      },
      ph: { role: 'مثال: مطور React، محلل بيانات…', cv: 'الاسم، الخبرات، التكوينات، المهارات، اللغات…' },
      contract: { 'CDI': 'عقد دائم (CDI)', 'CDD': 'عقد محدد المدة (CDD)', 'Stage PFE': 'تربص / مشروع تخرج', 'SIVP': 'SIVP', 'CIVP': 'CIVP', 'Alternance': 'تكوين بالتناوب', 'Freelance': 'عمل حر' },
      mode: { 'Hybride': 'هجين', 'Sur site': 'في الموقع', 'Télétravail': 'عن بُعد' },
      availability: { 'Immédiate': 'فوراً', '1 mois': 'شهر واحد', '3 mois': '3 أشهر', 'En recherche active': 'في بحث نشط' },
    },
  };

  let lang = 'fr';
  let profile = null, jobsData = null, fileData = null;
  let filter = 'Tous', maxStep = 1, busy = false;
  const PROFILE_KEY = 'orient-tn-profile';

  const dict = () => I18N[lang];
  function t(key, vars = {}) {
    const parts = key.split('.');
    const d = dict();
    let val = parts.length > 1 ? parts.reduce((o, k) => (o || {})[k], d) : d[key];
    if (val == null) val = I18N.fr[key] ?? key;
    if (Array.isArray(val)) return val.map(v => String(v));
    return String(val).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
  }

  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); } catch (_) { /* private mode */ }
  }
  function clearProfile() {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem('orient-tn-session'); // legacy key from the pre-Vercel build
    } catch (_) { /* noop */ }
  }

  /* ---------- i18n ---------- */
  function translateOptions(select, group) {
    const map = dict()[group] || {};
    $$('option', select).forEach(o => { if (map[o.value] || map[o.textContent]) o.textContent = map[o.value] || map[o.textContent]; });
  }

  function applyI18n(next) {
    if (next) lang = next;
    const d = dict();
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach(el => { const v = d[el.dataset.i18n] ?? I18N.fr[el.dataset.i18n]; if (v != null) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = d[el.dataset.i18nHtml] ?? I18N.fr[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
    $$('.lang').forEach(b => b.classList.toggle('is-active', b.dataset.lang === lang));
    $('#targetRole').placeholder = d.ph.role;
    $('#cvText').placeholder = d.ph.cv;
    translateOptions($('#contract'), 'contract');
    translateOptions($('#mode'), 'mode');
    translateOptions($('#availability'), 'availability');
    if (profile) renderProfile();
    if (jobsData) renderJobs();
  }

  /* ---------- motion ---------- */
  function initMotion() {
    const reveals = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { reveals.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));

    if (!window.gsap) return; // CSS fallback already handles the reveals
    const g = window.gsap;
    g.timeline({ defaults: { ease: 'power3.out' } })
      .from('.nav', { y: -18, opacity: 0, duration: .55 })
      .from('.hero-copy > *', { y: 22, opacity: 0, stagger: .09, duration: .7 }, '-=.25')
      .from('.profile-card', { scale: .86, opacity: 0, rotationY: -16, duration: 1.1, ease: 'back.out(1.3)' }, '-=.7')
      .from('.float-chip', { scale: 0, opacity: 0, stagger: .1, duration: .5, ease: 'back.out(2)' }, '-=.55');
  }

  /* ---------- steps ---------- */
  function goStep(n, force = false) {
    if (n > maxStep && !force) return;
    $$('.panel').forEach(p => p.classList.toggle('is-active', Number(p.id.split('-')[1]) === n));
    $$('.step-pill').forEach(p => {
      const i = Number(p.dataset.goto);
      p.classList.toggle('is-active', i === n);
      p.classList.toggle('done', i < n);
      p.setAttribute('aria-current', i === n ? 'step' : 'false');
    });
    const top = $('#studio').getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------- file intake ---------- */
  function clearError() { $('#error').textContent = ''; }
  function showError(msg) { $('#error').textContent = msg || t('dyn.errAnalyze'); }

  function setFile(file) {
    if (!file) return;
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) return showError(t('dyn.errFormat'));
    if (file.size > 3.5 * 1024 * 1024) return showError(t('dyn.errSize'));
    const reader = new FileReader();
    reader.onload = () => {
      fileData = { name: file.name, data: String(reader.result).split(',')[1] || '' };
      $('#fileName').textContent = file.name;
      $('#fileChip').hidden = false;
      $('#cvText').value = '';
      clearError();
    };
    reader.onerror = () => showError(t('dyn.errAnalyze'));
    reader.readAsDataURL(file);
  }

  function initIntake() {
    const drop = $('#drop'), input = $('#file');
    drop.addEventListener('click', e => { if (e.target.closest('#clearFile')) return; input.click(); });
    drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    input.addEventListener('change', () => setFile(input.files[0]));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', e => setFile(e.dataTransfer?.files?.[0]));
    $('#clearFile').addEventListener('click', e => {
      e.stopPropagation();
      fileData = null; input.value = ''; $('#fileChip').hidden = true;
    });
    document.addEventListener('paste', e => {
      const f = Array.from(e.clipboardData?.files || [])[0];
      if (f) { e.preventDefault(); setFile(f); }
    });
  }

  /* ---------- analyze ---------- */
  function setBusy(v) {
    busy = v;
    $('#analyzeBtn').disabled = v;
    $('#analyzeBtn').style.opacity = v ? '.6' : '';
  }

  async function analyze() {
    if (busy) return;
    const text = $('#cvText').value.trim();
    if (!fileData && text.length < 60) return showError(t('dyn.errNeed'));
    clearError();
    const goals = {
      contract: $('#contract').value,
      targetRole: $('#targetRole').value.trim(),
      city: $('#city').value.trim(),
      mode: $('#mode').value,
      availability: $('#availability').value,
    };
    const statuses = t('scanStatuses');
    let i = 0, pct = 12;
    $('#scanning').hidden = false;
    $('#profileResult').hidden = true;
    $('#scanStatus').textContent = statuses[0];
    $('#scanBar').style.width = pct + '%';
    setBusy(true);
    goStep(2, true);
    const timer = setInterval(() => {
      i = Math.min(i + 1, statuses.length - 1);
      pct = Math.min(pct + 28, 92);
      $('#scanStatus').textContent = statuses[i];
      $('#scanBar').style.width = pct + '%';
    }, reduce ? 60 : 520);
    try {
      const payload = fileData ? { file: fileData, goals } : { text, goals };
      const res = await fetch('/api/analyze', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dyn.errAnalyze'));
      profile = data.profile;
      jobsData = null;
      maxStep = 2;
      saveProfile();
      $('#scanBar').style.width = '100%';
      await new Promise(r => setTimeout(r, reduce ? 0 : 420));
      $('#scanning').hidden = true;
      $('#profileResult').hidden = false;
      renderProfile();
    } catch (e) {
      showError(e.message || t('dyn.errAnalyze'));
      goStep(1, true);
    } finally {
      clearInterval(timer);
      setBusy(false);
    }
  }

  /* ---------- profile render ---------- */
  function fillList(el, items, emptyText) {
    el.innerHTML = items.length
      ? items.map(x => `<li>${esc(x)}</li>`).join('')
      : `<li class="empty">${esc(emptyText)}</li>`;
  }

  function renderProfile() {
    if (!profile) return;
    const d = dict(), dy = d.dyn;
    $('#pName').textContent = profile.name || dy.candidate;
    $('#pHeyebrow').textContent = [profile.headline, profile.goals?.city, dy[profile.level] || dy.mid]
      .filter(Boolean).join(' · ');
    const isAI = profile.engine === 'ai';
    const badge = $('#engineBadge');
    badge.hidden = false;
    badge.textContent = t(isAI ? 'dyn.engineAi' : 'dyn.engineHeuristic');
    badge.classList.toggle('is-ai', isAI);
    const note = $('#engineNote');
    note.hidden = !profile.notice;
    note.textContent = profile.notice ? t('dyn.engineFallback') : '';
    const pct = Number(profile.completeness) || 0;
    $('#ring').style.setProperty('--pct', pct);
    $('#ringVal').textContent = pct + '%';
    $('#skillsCount').textContent = profile.skills?.length || 0;
    $('#formationsCount').textContent = profile.formations?.length || 0;
    $('#certsCount').textContent = profile.certifications?.length || 0;

    $('#skills').innerHTML = profile.skills?.length
      ? profile.skills.map(s => `<span>${esc(s)}</span>`).join('')
      : `<span class="empty">${esc(dy.none)}</span>`;
    fillList($('#formations'), profile.formations || [], dy.none);
    fillList($('#certs'), profile.certifications || [], dy.none);
    $('#languages').innerHTML = profile.languages?.length
      ? profile.languages.map(l => `<span>${esc(l.name)}${l.level && l.level !== '—' ? ' · ' + esc(l.level) : ''}</span>`).join('')
      : `<span class="empty">${esc(dy.none)}</span>`;
    $('#expMeta').textContent = `${profile.years || 0} ${dy.years} · ${dy.level} ${dy[profile.level] || dy.mid}`;
    $('#archetypeText').textContent = t('dyn.archetype', { label: profile.archetype?.label || dy.candidate });
    $('#gapsText').textContent = profile.gaps?.length ? t('dyn.gaps', { list: profile.gaps.join(' · ') }) : '';
  }

  /* ---------- jobs render ---------- */
  function reasonText(r) {
    const m = String(r).match(/^(\d+) compétences? en commun$/);
    if (m) return t('dyn.reasonSkills', { n: m[1] });
    const map = {
      'intitulé proche de votre objectif': 'reasonRole', 'localisation compatible': 'reasonLocation',
      'niveau débutant': 'reasonEntry', 'niveau senior': 'reasonSenior', 'profil senior demandé': 'reasonSeniorReq',
    };
    return map[r] ? t('dyn.' + map[r]) : r;
  }

  function renderJobs() {
    if (!jobsData || !profile) return;
    const d = dict(), dy = d.dyn;
    $('#jobsSubtitle').textContent = t('dyn.jobsSubtitle', { name: profile.name, n: jobsData.liveCount ?? jobsData.jobs.length });
    $('#portals').innerHTML = (jobsData.links || []).map(b => `
      <a class="portal" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer" style="--pc:${esc(b.color || '#2563EB')}">
        <div class="portal-top"><b>${esc(b.name)}</b><span class="portal-match">${Number(b.match) || 0}% ${esc(dy.match)}</span></div>
        <p>${esc(b.note)}</p>
        <div class="portal-tags">${(b.tags || []).map(x => `<span>${esc(x)}</span>`).join('')}</div>
        <svg aria-hidden="true"><use href="#i-ext"/></svg>
      </a>`).join('');

    const jobs = jobsData.jobs || [];
    $('#jobs').innerHTML = jobs.length ? jobs.map(j => {
      const color = j.score >= 80 ? '#16A34A' : j.score >= 65 ? '#2563EB' : '#D97706';
      return `<article class="job">
        <div>
          <h5>${esc(j.title)}</h5>
          <div class="job-meta">
            <span>${esc(j.company)}</span><span>${esc(j.location)}</span>
            <span>${esc(j.source)}</span><span>${esc(j.contract)}</span>
          </div>
          ${(j.reasons || []).length ? `<div class="job-reasons">${j.reasons.map(r => esc(reasonText(r))).join(' · ')}</div>` : ''}
          <a class="job-ext" href="${esc(j.url)}" target="_blank" rel="noopener noreferrer">${esc(dy.view)}<svg aria-hidden="true"><use href="#i-ext"/></svg></a>
        </div>
        <div class="job-score">
          <b style="--v:${j.score};--sc:${color}"><span>${j.score}</span></b>
          <small>${esc(dy.match)}</small>
        </div>
      </article>`;
    }).join('') : `<p class="notice">${esc(dy.noJobs)}</p>`;

    const notice = $('#jobsNotice');
    notice.textContent = jobsData.notice || '';
    notice.hidden = !jobsData.notice;
  }

  async function loadJobs() {
    if (!profile) return;
    maxStep = 3;
    goStep(3);
    $('#jobs').innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    $('#portals').innerHTML = '';
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ profile, contract: filter }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dyn.errJobs'));
      jobsData = data;
      renderJobs();
    } catch (e) {
      $('#jobs').innerHTML = `<p class="notice">${esc(e.message || t('dyn.errJobs'))}</p>`;
    }
  }

  function restart() {
    clearProfile();
    profile = null; jobsData = null; fileData = null; filter = 'Tous'; maxStep = 1;
    $('#file').value = ''; $('#fileChip').hidden = true; $('#cvText').value = '';
    $('#targetRole').value = ''; $('#city').value = 'Tunis';
    $('#contract').value = 'CDI'; $('#mode').value = 'Hybride'; $('#availability').value = 'Immédiate';
    $$('.filter').forEach(b => b.classList.toggle('is-active', b.dataset.filter === 'Tous'));
    clearError();
    goStep(1, true);
  }

  /* ---------- events ---------- */
  function initEvents() {
    $$('.lang').forEach(b => b.addEventListener('click', () => applyI18n(b.dataset.lang)));
    $$('.step-pill').forEach(b => b.addEventListener('click', () => goStep(Number(b.dataset.goto))));
    $('#analyzeBtn').addEventListener('click', analyze);
    $('#toJobs').addEventListener('click', loadJobs);
    $('#back1').addEventListener('click', () => goStep(1));
    $('#back2').addEventListener('click', () => goStep(2));
    $('#restart').addEventListener('click', restart);
    $$('.filter').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.filter;
      $$('.filter').forEach(x => x.classList.toggle('is-active', x === b));
      loadJobs();
    }));
    window.addEventListener('scroll', () => $('#top').classList.toggle('scrolled', window.scrollY > 8), { passive: true });
  }

  function restore() {
    let saved = null;
    try { saved = localStorage.getItem(PROFILE_KEY); } catch (_) { /* noop */ }
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.skills) || typeof parsed.goals !== 'object') return;
      profile = parsed;
      jobsData = null;
      maxStep = 2;
      $('#scanning').hidden = true;
      $('#profileResult').hidden = false;
      applyI18n();
      goStep(2, true);
    } catch (_) { clearProfile(); /* corrupt state: fresh start */ }
  }

  applyI18n();
  initEvents();
  initIntake();
  initMotion();
  $('#year').textContent = new Date().getFullYear();
  restore();
})();
