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
      portalsKicker: 'PORTAILS TUNISIENS', portalsTitle: 'Les bons endroits pour postuler.',
      portalsSub: 'Orient TN vous oriente vers les portails les plus pertinents pour votre profil. Vous postulez toujours vous-même, directement à la source.',
      portalBadgePopular: 'Populaire', portalBadgeGeneral: 'Généraliste', portalBadgePublic: 'Public', portalBadgePro: 'Réseau pro', portalBadgeTech: 'Tech',
      portalTanitDesc: 'N°1 en Tunisie pour CDI, CDD et stages PFE.',
      portalKeejobDesc: 'Offres CDI, CDD, stages et freelance en Tunisie.',
      portalAnetiDesc: 'Programmes SIVP/CIVP et insertion des diplômés.',
      portalLinkedinDesc: 'Postes tech, multinationaux et opportunités internationales.',
      portalLcfDesc: 'Offres tech vérifiées à Tunis et en remote.',
      portalTagPublic: 'Public', portalTagNetwork: 'Réseau',
      portalsNote: 'Conseil : après analyse de votre CV, Orient TN pré-remplit des recherches adaptées à votre profil sur ces portails.',
      heroEyebrow: 'ORIENTATION · INSERTION · TUNISIE',
      heroTitle: 'Votre CV mérite<br/>mieux qu’un <em>dossier</em>.',
      heroLede: 'Déposez votre CV. On lit votre parcours, on comprend votre objectif — CDI, stage PFE ou SIVP — et on vous montre les portails et les offres qui correspondent vraiment.',
      heroCta: 'Analyser mon CV', heroSee: 'Voir comment ça marche',
      heroMeta1: 'Gratuit, sans compte', heroMeta2: 'Vos données restent sur votre appareil',
      pcName: 'Cheker Hassan', pcRole: 'Ingénieure informatique · Tunis', pcBadge: 'Profil détecté',
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
      cvKicker: 'CV ADAPTÉ À L’OFFRE',
      cvTitle: 'Générez un CV adapté à l’offre',
      cvSub: 'Collez la description du poste. L’application analyse les mots-clés localement et génère un CV amélioré dans un format professionnel, sans API externe.',
      cvJdLabel: 'Description du poste',
      cvRoleLabel: 'Intitulé du poste (optionnel)',
      cvGenerate: 'Générer mon CV',
      cvDownload: 'Télécharger HTML',
      cvPrint: 'Imprimer / PDF',
      cvPreview: 'Aperçu du CV généré',
      cvMatched: 'Mots-clés couverts',
      cvMissing: 'À renforcer si vrai',
      cvMatchLabel: 'match ATS',
      cvCompanyLabel: 'Entreprise (optionnel)', cvLangLabel: 'Langue du CV', cvJdFileLabel: 'Ou importer la JD (PDF/DOCX/TXT)',
      cvCoverBtn: 'Lettre de motivation', cvPrepBtn: 'Préparation entretien', cvGapBtn: 'Plan de progression', cvSaveBtn: 'Sauver version', cvDemoJd: 'Exemple JD', clearWorkspace: 'Effacer données locales',
      coverTitle: 'Lettre de motivation', prepTitle: 'Préparation entretien', gapTitle: 'Plan de progression', copyText: 'Copier',
      trackerKicker: 'SUIVI LOCAL', trackerTitle: 'Suivi des candidatures & versions CV', trackerSub: 'Stocké localement dans votre navigateur. Exportez/importez en JSON.',
      trCompany: 'Entreprise', trRole: 'Poste', trStatus: 'Statut', trLink: 'Lien', trAdd: 'Ajouter au suivi', trExport: 'Exporter JSON', trImport: 'Importer JSON', trList: 'Candidatures', cvVersions: 'Versions CV',
      dyn: {
        candidate: 'Candidat', years: 'années d’expérience estimées', level: 'Niveau',
        entry: 'Débutant', mid: 'Intermédiaire', senior: 'Senior',
        none: 'Non renseigné', noKw: 'Aucun mot-clé tech détecté — collez une JD plus détaillée', noGap: 'Aucun écart — votre profil couvre tous les mots-clés', match: 'match', view: 'Voir l’offre',
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
        errCvNeed: 'Collez une description de poste (au moins 40 caractères).',
        errCvProfile: 'Analysez d’abord votre CV pour générer un CV adapté.',
        errCvGen: 'Impossible de générer le CV pour le moment.',
        cvGenerating: 'Génération du CV…',
        cvReady: 'CV adapté généré — vous pouvez le télécharger ou l’imprimer en PDF.',
        errCover: 'Impossible de générer la lettre de motivation.',
        errPrep: 'Impossible de générer la préparation entretien.',
        errGap: 'Impossible de générer le plan de progression.',
        cvSaved: 'Version CV sauvegardée localement.',
        cvDone: 'CV généré ✓', coverDone: 'Lettre générée ✓',
        workspaceCleared: 'Données locales effacées.',
        copied: 'Copié.',
        trackerEmpty: 'Aucune candidature suivie.',
        versionsEmpty: 'Aucune version sauvegardée.',
        tailorJob: 'Adapter mon CV',
        loadVersion: 'Charger',
        cvEvidence: 'Preuves',
        cvGuardrails: 'Garde-fous',
        noGaps: 'Aucun écart majeur détecté.',

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
      portalsKicker: 'TUNISIAN PORTALS', portalsTitle: 'The right places to apply.',
      portalsSub: 'Orient TN points you to the portals most relevant to your profile. You always apply yourself, directly at the source.',
      portalBadgePopular: 'Popular', portalBadgeGeneral: 'General', portalBadgePublic: 'Public', portalBadgePro: 'Professional', portalBadgeTech: 'Tech',
      portalTanitDesc: 'No. 1 in Tunisia for full-time, fixed-term, and PFE internships.',
      portalKeejobDesc: 'Full-time, fixed-term, internship, and freelance offers in Tunisia.',
      portalAnetiDesc: 'SIVP/CIVP programs and graduate employment support.',
      portalLinkedinDesc: 'Tech roles, multinationals, and international opportunities.',
      portalLcfDesc: 'Verified tech offers in Tunis and remote.',
      portalTagPublic: 'Public', portalTagNetwork: 'Network',
      portalsNote: 'Tip: after analyzing your CV, Orient TN pre-fills searches tailored to your profile on these portals.',
      heroEyebrow: 'GUIDANCE · EMPLOYMENT · TUNISIA',
      heroTitle: 'Your CV deserves<br/>more than a <em>folder</em>.',
      heroLede: 'Upload your CV. We read your background, understand your goal — permanent role, internship or SIVP — and show you the portals and offers that actually fit.',
      heroCta: 'Analyze my CV', heroSee: 'See how it works',
      heroMeta1: 'Free, no account', heroMeta2: 'Your data stays on your device',
      pcName: 'Cheker Hassan', pcRole: 'Computer engineer · Tunis', pcBadge: 'Profile detected',
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
      cvKicker: 'CV TAILORED TO THE JOB',
      cvTitle: 'Generate a CV tailored to the job',
      cvSub: 'Paste the job description. The app analyzes keywords locally and generates an improved CV in a professional format, with no external APIs.',
      cvJdLabel: 'Job description',
      cvRoleLabel: 'Job title (optional)',
      cvGenerate: 'Generate my CV',
      cvDownload: 'Download HTML',
      cvPrint: 'Print / PDF',
      cvPreview: 'Generated CV preview',
      cvMatched: 'Matched keywords',
      cvMissing: 'Strengthen if true',
      cvMatchLabel: 'ATS match',
      cvCompanyLabel: 'Company (optional)', cvLangLabel: 'CV language', cvJdFileLabel: 'Or import JD (PDF/DOCX/TXT)',
      cvCoverBtn: 'Cover letter', cvPrepBtn: 'Interview prep', cvGapBtn: 'Gap roadmap', cvSaveBtn: 'Save version', cvDemoJd: 'Example JD', clearWorkspace: 'Clear local data',
      coverTitle: 'Cover letter', prepTitle: 'Interview preparation', gapTitle: 'Gap roadmap', copyText: 'Copy',
      trackerKicker: 'LOCAL TRACKER', trackerTitle: 'Application tracker & CV versions', trackerSub: 'Stored locally in your browser. Export/import JSON.',
      trCompany: 'Company', trRole: 'Role', trStatus: 'Status', trLink: 'Link', trAdd: 'Add to tracker', trExport: 'Export JSON', trImport: 'Import JSON', trList: 'Applications', cvVersions: 'CV versions',
      dyn: {
        candidate: 'Candidate', years: 'years of experience estimated', level: 'Level',
        entry: 'Entry', mid: 'Mid-level', senior: 'Senior',
        none: 'Not listed', noKw: 'No tech keywords found — paste a more detailed JD', noGap: 'No gaps — your profile covers all keywords', match: 'match', view: 'View job',
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
        errCvNeed: 'Paste a job description (at least 40 characters).',
        errCvProfile: 'Analyze your CV first to generate a tailored CV.',
        errCvGen: 'Could not generate the CV right now.',
        cvGenerating: 'Generating CV…',
        cvReady: 'Tailored CV generated — you can download it or print to PDF.',
        errCover: 'Could not generate cover letter.',
        errPrep: 'Could not generate interview prep.',
        errGap: 'Could not generate gap roadmap.',
        cvSaved: 'CV version saved locally.',
        cvDone: 'CV generated ✓', coverDone: 'Letter generated ✓',
        workspaceCleared: 'Local data cleared.',
        copied: 'Copied.',
        trackerEmpty: 'No tracked applications.',
        versionsEmpty: 'No saved versions.',
        tailorJob: 'Tailor my CV',
        loadVersion: 'Load',
        cvEvidence: 'Evidence',
        cvGuardrails: 'Guardrails',
        noGaps: 'No major gaps detected.',

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
      portalsKicker: 'البوابات التونسية', portalsTitle: 'أفضل الأماكن للتقديم.',
      portalsSub: 'يوجهك Orient TN نحو البوابات الأنسب لملفك. أنت دائماً من يتقدم بنفسه، مباشرة من المصدر.',
      portalBadgePopular: 'شائع', portalBadgeGeneral: 'عام', portalBadgePublic: 'عمومي', portalBadgePro: 'مهني', portalBadgeTech: 'تقني',
      portalTanitDesc: 'الأول في تونس لعقود CDI وCDD وتربصات PFE.',
      portalKeejobDesc: 'عروض CDI وCDD وتربصات وعمل حر في تونس.',
      portalAnetiDesc: 'برامج SIVP/CIVP وإدماج حاملي الشهادات.',
      portalLinkedinDesc: 'وظائف تقنية، شركات متعددة الجنسيات وفرص دولية.',
      portalLcfDesc: 'عروض تقنية موثقة في تونس وعن بعد.',
      portalTagPublic: 'عمومي', portalTagNetwork: 'شبكة',
      portalsNote: 'نصيحة: بعد تحليل سيرتك الذاتية، يملأ Orient TN عمليات بحث مناسبة لملفك على هذه البوابات.',
      heroEyebrow: 'توجيه · تشغيل · تونس',
      heroTitle: 'سيرتك الذاتية تستحق<br/>أكثر من <em>ملف</em>.',
      heroLede: 'ارفع سيرتك الذاتية. نقرأ مسارك ونفهم هدفك — عقد دائم، تربص أو SIVP — ونعرض لك البوابات والعروض التي تناسبك فعلاً.',
      heroCta: 'حلّل سيرتي', heroSee: 'شاهد كيف يعمل',
      heroMeta1: 'مجاني، دون حساب', heroMeta2: 'بياناتك تبقى على جهازك',
      pcName: 'Cheker Hassan', pcRole: 'مهندسة إعلامية · تونس', pcBadge: 'تم رصد الملف',
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
      cvKicker: 'سيرة ذاتية مكيّفة مع العرض',
      cvTitle: 'أنشئ سيرة ذاتية مكيّفة مع الوظيفة',
      cvSub: 'الصق وصف الوظيفة. يحلل التطبيق الكلمات المفتاحية محلياً ويولّد سيرة ذاتية محسّنة بتنسيق احترافي، بدون أي API خارجي.',
      cvJdLabel: 'وصف الوظيفة',
      cvRoleLabel: 'اسم الوظيفة (اختياري)',
      cvGenerate: 'أنشئ سيرتي الذاتية',
      cvDownload: 'تحميل HTML',
      cvPrint: 'طباعة / PDF',
      cvPreview: 'معاينة السيرة الذاتية',
      cvMatched: 'الكلمات المفتاحية المطابقة',
      cvMissing: 'للتعزيز إذا كان صحيحاً',
      cvMatchLabel: 'تطابق ATS',
      cvCompanyLabel: 'الشركة (اختياري)', cvLangLabel: 'لغة السيرة الذاتية', cvJdFileLabel: 'أو استيراد وصف الوظيفة (PDF/DOCX/TXT)',
      cvCoverBtn: 'خطاب التحفيز', cvPrepBtn: 'تحضير المقابلة', cvGapBtn: 'خطة التطوير', cvSaveBtn: 'حفظ النسخة', cvDemoJd: 'مثال JD', clearWorkspace: 'مسح البيانات المحلية',
      coverTitle: 'خطاب التحفيز', prepTitle: 'تحضير المقابلة', gapTitle: 'خطة التطوير', copyText: 'نسخ',
      trackerKicker: 'تتبع محلي', trackerTitle: 'تتبع الترشيحات ونسخ السيرة الذاتية', trackerSub: 'محفوظ محلياً في متصفحك. تصدير/استيراد JSON.',
      trCompany: 'الشركة', trRole: 'الوظيفة', trStatus: 'الحالة', trLink: 'الرابط', trAdd: 'إضافة للتتبع', trExport: 'تصدير JSON', trImport: 'استيراد JSON', trList: 'الترشيحات', cvVersions: 'نسخ السيرة الذاتية',
      dyn: {
        candidate: 'مُرشّح', years: 'سنة خبرة مقدّرة', level: 'المستوى',
        entry: 'مبتدئ', mid: 'متوسط', senior: 'خبير',
        none: 'غير مذكور', noKw: 'لا كلمات تقنية — الصق وصفاً أكثر تفصيلاً', noGap: 'لا فجوات — ملفك يغطي جميع الكلمات', match: 'تطابق', view: 'عرض الوظيفة',
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
        errCvNeed: 'الصق وصف الوظيفة (40 حرفاً على الأقل).',
        errCvProfile: 'حلّل سيرتك الذاتية أولاً لإنشاء سيرة مكيّفة.',
        errCvGen: 'تعذّر إنشاء السيرة الذاتية الآن.',
        cvGenerating: 'جارٍ إنشاء السيرة الذاتية…',
        cvReady: 'تم إنشاء السيرة الذاتية المكيّفة — يمكنك تحميلها أو طباعتها كـ PDF.',
        errCover: 'تعذر إنشاء خطاب التحفيز.',
        errPrep: 'تعذر إنشاء تحضير المقابلة.',
        errGap: 'تعذر إنشاء خطة التطوير.',
        cvSaved: 'تم حفظ نسخة السيرة الذاتية محلياً.',
        cvDone: 'تم إنشاء السيرة ✓', coverDone: 'تم إنشاء الخطاب ✓',
        workspaceCleared: 'تم مسح البيانات المحلية.',
        copied: 'تم النسخ.',
        trackerEmpty: 'لا توجد ترشيحات متتبعة.',
        versionsEmpty: 'لا توجد نسخ محفوظة.',
        tailorJob: 'كيّف سيرتي الذاتية',
        loadVersion: 'تحميل',
        cvEvidence: 'الأدلة',
        cvGuardrails: 'ضوابط',
        noGaps: 'لم يتم اكتشاف فجوات كبيرة.',

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
  let cvGenerated = null, coverGenerated = null;
  const TRACK_KEY = 'orient-tn-tracker-v1';
  const VERSIONS_KEY = 'orient-tn-cv-versions-v1';
  const loadJSON = (k, fb) => { try { return JSON.parse(localStorage.getItem(k) || '') ?? fb; } catch { return fb; } };
  const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  let tracker = loadJSON(TRACK_KEY, []);
  let cvVersions = loadJSON(VERSIONS_KEY, []);
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
    if (next && next !== lang && window.orientLoader) {
      window.orientLoader.show();
      setTimeout(() => {
        lang = next;
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
        renderTracker();
        renderVersions();
        window.orientLoader.hide();
      }, 600);
      return;
    }
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
    renderTracker();
    renderVersions();
  }

  /* ---------- motion ---------- */
  function initMotion() {
    const reveals = $$('.reveal');
    if (reduce || !('IntersectionObserver' in window)) { reveals.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
    // Safety net: never leave above-the-fold content permanently invisible.
    setTimeout(() => reveals.forEach(el => {
      if (el.classList.contains('in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight + 120) el.classList.add('in');
    }), 1800);

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
    // input is an invisible overlay over the drop zone; clicks natively open file picker
    drop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); } });
    $('#clearFile')?.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); fileData = null; input.value = ''; $('#fileChip').hidden = true; });
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
    $('#jobPortals').innerHTML = (jobsData.links || []).map(b => `
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
          <div class="job-actions">
            <a class="job-ext" href="${esc(j.url)}" target="_blank" rel="noopener noreferrer">${esc(dy.view)}<svg aria-hidden="true"><use href="#i-ext"/></svg></a>
            <button class="btn btn-ghost btn-sm job-tailor" type="button" data-job-idx="${jobs.indexOf(j)}">${esc(dy.tailorJob)}</button>
          </div>
        </div>
        <div class="job-score">
          <b style="--v:${j.score};--sc:${color}"><span>${j.score}</span></b>
          <small>${esc(dy.match)}</small>
        </div>
      </article>`;
    }).join('') : `<p class="notice">${esc(dy.noJobs)}</p>`;

    $$('#jobs .job-tailor').forEach(btn => btn.addEventListener('click', () => {
      const j = (jobsData.jobs||[])[Number(btn.dataset.jobIdx)];
      if (!j) return;
      $('#cvRole').value = j.title || '';
      $('#cvCompany').value = j.company || '';
      const jdStub = [j.title, j.company ? 'Company: '+j.company : '', j.location ? 'Location: '+j.location : '', j.contract ? 'Contract: '+j.contract : '', j.url ? 'URL: '+j.url : '', j.reasons?.length ? 'Match reasons: '+j.reasons.join(', ') : '', '', 'Collez la description complète du poste ici pour un meilleur résultat.'].filter(Boolean).join('\n');
      const jd = $('#cvJd'); if (jd && jd.value.trim().length < 40) jd.value = jdStub;
      goStep(2);
      setTimeout(()=>$('#cvTailor')?.scrollIntoView({behavior:'smooth',block:'start'}), 150);
    }));
    const notice = $('#jobsNotice');
    notice.textContent = jobsData.notice || '';
    notice.hidden = !jobsData.notice;
  }

  async function loadJobs() {
    if (!profile) return;
    maxStep = 3;
    goStep(3);
    $('#jobs').innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    $('#jobPortals').innerHTML = '';
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

  function resetCV() {
    cvGenerated = null; coverGenerated = null;
    const r = $('#cvResult'); if (r) r.hidden = true;
    ['#coverResult','#prepResult','#gapResult'].forEach(id=>{ const el=$(id); if(el) el.hidden=true; });
    const s = $('#cvStatus'); if (s) s.textContent = '';
    ['#cvDownloadBtn','#cvPrintBtn','#cvSaveBtn'].forEach(id=>{ const el=$(id); if(el) el.hidden=true; });
    const f = $('#cvPreviewFrame'); if (f) f.removeAttribute('srcdoc');
    const m = $('#cvMatched'); if (m) m.innerHTML = '';
    const x = $('#cvMissing'); if (x) x.innerHTML = '';
    const pct = $('#cvMatchPct'); if (pct) pct.textContent = '—';
    const eg = $('#cvEvidenceGuard'); if (eg) eg.innerHTML = '';
    const ct = $('#coverText'); if (ct) ct.textContent = '';
    const pc = $('#prepContent'); if (pc) pc.innerHTML = '';
    const gc = $('#gapContent'); if (gc) gc.innerHTML = '';
  }

  function restart() {
    clearProfile();
    profile = null; jobsData = null; fileData = null; filter = 'Tous'; maxStep = 1;
    $('#file').value = ''; $('#fileChip').hidden = true; $('#cvText').value = '';
    $('#targetRole').value = ''; $('#city').value = 'Tunis';
    $('#contract').value = 'CDI'; $('#mode').value = 'Hybride'; $('#availability').value = 'Immédiate';
    const jr = $('#cvJd'); if (jr) jr.value = '';
    const cr = $('#cvRole'); if (cr) cr.value = '';
    const cc = $('#cvCompany'); if (cc) cc.value = '';
    const pr = $('#profileResult'); if (pr) pr.hidden = true;
    const sc = $('#scanning'); if (sc) sc.hidden = true;
    resetCV();
    $$('.filter').forEach(b => b.classList.toggle('is-active', b.dataset.filter === 'Tous'));
    clearError();
    goStep(1, true);
  }


  /* ---------- tracker & CV versions (localStorage) ---------- */
  function renderTracker() {
    const el = $('#trackerList'); if (!el) return;
    if (!tracker.length) { el.innerHTML = '<p class="muted small-note">'+esc(t('dyn.trackerEmpty'))+'</p>'; }
    else el.innerHTML = tracker.map((it,i)=>`<div class="tracker-item"><div><strong>${esc(it.company||'—')}</strong> <span class="muted">${esc(it.role||'')}</span><div class="muted small-note">${esc(it.status||'Saved')} ${it.date? '· '+esc(it.date):''} ${it.link? '· <a href="'+esc(it.link)+'" target="_blank" rel="noopener">link</a>':''}</div></div><button class="btn btn-ghost btn-sm" data-tr-del="${i}">×</button></div>`).join('');
    el.querySelectorAll('[data-tr-del]').forEach(b=>b.addEventListener('click',()=>{ tracker.splice(Number(b.dataset.trDel),1); saveJSON(TRACK_KEY,tracker); renderTracker(); }));
  }
  function renderVersions() {
    const el = $('#cvVersions'); if (!el) return;
    if (!cvVersions.length) { el.innerHTML = '<p class="muted small-note">'+esc(t('dyn.versionsEmpty'))+'</p>'; }
    else el.innerHTML = cvVersions.map((v,i)=>`<div class="tracker-item"><div><strong>${esc(v.title||'CV')}</strong><div class="muted small-note">${esc(v.date||'')} ${v.match? '· '+v.match+'%':''}</div></div><div style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" data-v-load="${i}">${esc(t('dyn.loadVersion'))}</button><button class="btn btn-ghost btn-sm" data-v-del="${i}">×</button></div></div>`).join('');
    el.querySelectorAll('[data-v-del]').forEach(b=>b.addEventListener('click',()=>{ cvVersions.splice(Number(b.dataset.vDel),1); saveJSON(VERSIONS_KEY,cvVersions); renderVersions(); }));
    el.querySelectorAll('[data-v-load]').forEach(b=>b.addEventListener('click',()=>{ const v=cvVersions[Number(b.dataset.vLoad)]; if(v?.html){ const data={...v, match: v.matchData || (typeof v.match==='object'?v.match:{pct:Number(v.match)||0})}; cvGenerated=data; renderCVResult(data); $('#cvStatus').textContent=''; } }));
  }
  function addTrackerItem(item) { tracker.unshift({ ...item, date: new Date().toISOString().slice(0,10) }); tracker = tracker.slice(0,50); saveJSON(TRACK_KEY,tracker); renderTracker(); }
  function saveCVVersion() {
    if (!cvGenerated?.html) return;
    const title = ($('#cvRole')?.value || cvGenerated.headline || 'CV').slice(0,80);
    cvVersions.unshift({ title, date: new Date().toISOString().slice(0,10), match: cvGenerated.match?.pct, html: cvGenerated.html, filename: cvGenerated.filename, matchData: cvGenerated.match, evidence: cvGenerated.evidence, guardrails: cvGenerated.guardrails });
    cvVersions = cvVersions.slice(0,12);
    saveJSON(VERSIONS_KEY, cvVersions); renderVersions();
    setCvStatus(t('dyn.cvSaved'), 'success');
  }
  function exportTracker() {
    const blob = new Blob([JSON.stringify({ tracker, cvVersions: cvVersions.map(v=>({...v, html: undefined})) }, null, 2)], {type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='orienttn-tracker.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function importTracker(file) {
    const r=new FileReader(); r.onload=()=>{ try{ const d=JSON.parse(String(r.result||'{}')); if(Array.isArray(d.tracker)) tracker=d.tracker.slice(0,50); if(Array.isArray(d.cvVersions)) cvVersions=d.cvVersions.slice(0,12); saveJSON(TRACK_KEY,tracker); saveJSON(VERSIONS_KEY,cvVersions); renderTracker(); renderVersions(); }catch{} };
    r.readAsText(file);
  }

  function loadDemoJD() {
    const lang = ($('#cvLang')?.value || 'fr');
    const demo = lang === 'en'
      ? `Full-Stack Developer (React / Node.js)\nCompany: Tunis Tech\nLocation: Tunis (Hybrid)\nContract: CDI\n\nResponsibilities:\n- Build and maintain web applications using React, TypeScript, and Node.js\n- Design REST APIs and integrate PostgreSQL databases\n- Write clean, tested code and participate in code reviews\n- Collaborate with product/design teams in Agile/Scrum\n- Use Git, CI/CD pipelines, and Docker for delivery\n\nRequirements:\n- 2+ years experience in web development\n- Strong JavaScript/TypeScript, React, Node.js\n- SQL/PostgreSQL, Git, REST APIs\n- Good communication in French and English\nNice to have: Docker, AWS, testing, Next.js`
      : `Développeur Full-Stack (React / Node.js)\nEntreprise : Tunis Tech\nLieu : Tunis (Hybride)\nContrat : CDI\n\nMissions :\n- Développer et maintenir des applications web avec React, TypeScript et Node.js\n- Concevoir des API REST et intégrer des bases PostgreSQL\n- Écrire du code propre, testé, et participer aux revues de code\n- Collaborer avec les équipes produit/design en Agile/Scrum\n- Utiliser Git, pipelines CI/CD et Docker pour la livraison\n\nProfil recherché :\n- 2+ ans d'expérience en développement web\n- Solide maîtrise JavaScript/TypeScript, React, Node.js\n- SQL/PostgreSQL, Git, API REST\n- Bonne communication en français et anglais\nAtouts : Docker, AWS, tests, Next.js`;
    $('#cvJd').value = demo;
    if (!$('#cvRole')?.value) $('#cvRole').value = lang === 'en' ? 'Full-Stack Developer React/Node.js' : 'Développeur Full-Stack React/Node.js';
    if (!$('#cvCompany')?.value) $('#cvCompany').value = 'Tunis Tech';
    $('#cvStatus').textContent = lang === 'en' ? 'Example JD loaded — you can edit it.' : 'Exemple JD chargé — vous pouvez le modifier.';
  }

  function clearWorkspace() {
    const ok = confirm(lang === 'en' ? 'Clear local profile, tracker, and CV versions from this browser?' : lang === 'ar' ? 'مسح الملف الشخصي والتتبع ونسخ السيرة من هذا المتصفح؟' : 'Effacer le profil local, le suivi et les versions CV de ce navigateur ?');
    if (!ok) return;
    try { localStorage.removeItem(PROFILE_KEY); localStorage.removeItem(TRACK_KEY); localStorage.removeItem(VERSIONS_KEY); localStorage.removeItem('orient-tn-session'); } catch {}
    profile = null; jobsData = null; fileData = null; tracker = []; cvVersions = [];
    resetCV();
    renderTracker(); renderVersions();
    const pr = $('#profileResult'); if (pr) pr.hidden = true;
    const sc = $('#scanning'); if (sc) sc.hidden = true;
    $('#file').value = ''; $('#fileChip').hidden = true; $('#cvText').value = '';
    $('#targetRole').value = ''; $('#city').value = 'Tunis';
    $('#contract').value = 'CDI'; $('#mode').value = 'Hybride'; $('#availability').value = 'Immédiate';
    const jr = $('#cvJd'); if (jr) jr.value = '';
    const cr = $('#cvRole'); if (cr) cr.value = '';
    const cc = $('#cvCompany'); if (cc) cc.value = '';
    $('#jobs').innerHTML = ''; $('#jobPortals').innerHTML = '';
    maxStep = 1; goStep(1, true);
    setCvStatus(t('dyn.workspaceCleared'), 'success');
  }

  async function handleJdFile(file) {
    if (!file) return;
    if (!/\.(pdf|docx|txt|md)$/i.test(file.name)) { $('#cvStatus').textContent = t('dyn.errFormat'); return; }
    setCvStatus('...', '')
    try {
      if (/\.(txt|md)$/i.test(file.name)) {
        const text = await file.text();
        $('#cvJd').value = text.slice(0, 30000);
        $('#cvStatus').textContent = '';
        return;
      }
      const data = await new Promise((res, rej) => { const r=new FileReader(); r.onload=()=>res(String(r.result).split(',')[1]||''); r.onerror=rej; r.readAsDataURL(file); });
      const resp = await fetch('/api/extract', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ file: { name: file.name, data } }) });
      const out = await resp.json();
      if (!resp.ok) throw new Error(out.error || 'Extract failed');
      $('#cvJd').value = out.text || '';
      $('#cvStatus').textContent = '';
    } catch (e) { $('#cvStatus').textContent = e.message || 'Extract failed'; }
  }

  /* ---------- CV generation (local, no external API) ---------- */
  function renderCVResult(data) {
    cvGenerated = data;
    const pct = Number(data.match?.pct || 0);
    $('#cvMatchPct').textContent = pct > 0 ? `${pct}%` : '—';
    const matched = data.match?.matched || [];
    const missing = data.match?.missing || [];
    $('#cvMatched').innerHTML = matched.length ? matched.map(s => `<span class="chip hit">${esc(s)}</span>`).join('') : `<span class="empty">${esc(t('dyn.noKw'))}</span>`;
    $('#cvMissing').innerHTML = missing.length ? missing.map(s => `<span class="chip gap">${esc(s)}</span>`).join('') : `<span class="empty">${esc(t('dyn.noGap'))}</span>`;
    const frame = $('#cvPreviewFrame'); if (frame) frame.srcdoc = data.html || '';
    let extra = $('#cvEvidenceGuard');
    if (!extra) { extra = document.createElement('div'); extra.id='cvEvidenceGuard'; extra.className='cv-extra'; $('#cvResult .cv-match-summary')?.appendChild(extra); }
    const ev = (data.evidence||[]).slice(0,6).map(e=>`<li><strong>${esc(e.skill)}</strong>: ${esc((e.foundIn||[]).join(', ')||'profile')}</li>`).join('');
    const gr = (data.guardrails||[]).map(g=>`<li>${esc(g)}</li>`).join('');
    extra.innerHTML = `${ev?'<div class="cv-match-label">'+esc(t('dyn.cvEvidence'))+'</div><ul class="small-list">'+ev+'</ul>':''}${gr?'<div class="cv-match-label">'+esc(t('dyn.cvGuardrails'))+'</div><ul class="small-list">'+gr+'</ul>':''}`;
    $('#cvResult').hidden = false;
    $('#cvDownloadBtn').hidden = false; $('#cvPrintBtn').hidden = false; $('#cvSaveBtn').hidden = false;
    $('#cvStatus').textContent = t('dyn.cvReady');
  }

  function flashSuccess(btn, label) {
    const orig = btn.innerHTML;
    btn.classList.add('btn-success');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ' + esc(label);
    setTimeout(() => { btn.classList.remove('btn-success'); btn.innerHTML = orig; }, 2200);
  }
  function setCvStatus(msg, type) {
    const el = $('#cvStatus'); if (!el) return;
    el.textContent = msg || '';
    el.classList.remove('is-error','is-success');
    if (type === 'error') el.classList.add('is-error');
    else if (type === 'success') el.classList.add('is-success');
  }
  async function generateCV() {
    if (!profile) { setCvStatus(t('dyn.errCvProfile'), 'error'); return; }
    const jdText = ($('#cvJd')?.value || '').trim();
    const jdTitle = ($('#cvRole')?.value || '').trim();
    const lang = ($('#cvLang')?.value || 'fr');
    if (jdText.length < 40) { setCvStatus(t('dyn.errCvNeed'), 'error'); return; }
    const btn = $('#cvGenerateBtn'); btn.disabled = true; btn.style.opacity = '.6';
    setCvStatus(t('dyn.cvGenerating'), ''); $('#cvResult').hidden = true;
    try {
      const res = await fetch('/api/cv', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ profile, jdText, jdTitle, lang }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('dyn.errCvGen'));
      renderCVResult(data);
      flashSuccess(btn, t('dyn.cvDone'));
    } catch (e) { setCvStatus(e.message || t('dyn.errCvGen'), 'error'); }
    finally { btn.disabled = false; btn.style.opacity = ''; }
  }

  async function generateCoverLetter() {
    if (!profile) { setCvStatus(t('dyn.errCvProfile'), 'error'); return; }
    const jdText = ($('#cvJd')?.value || '').trim(); if (jdText.length < 40) { setCvStatus(t('dyn.errCvNeed'), 'error'); return; }
    setCvStatus('...', '')
    try {
      const res = await fetch('/api/cover-letter', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ profile, jdText, jdTitle: $('#cvRole')?.value||'', company: $('#cvCompany')?.value||'', lang: $('#cvLang')?.value||'fr' }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error||t('dyn.errCover'));
      coverGenerated = data; $('#coverText').textContent = data.text || ''; $('#coverResult').hidden = false; $('#cvStatus').textContent = '';
      flashSuccess($('#cvCoverBtn'), t('dyn.coverDone'));
    } catch(e){ setCvStatus(e.message||t('dyn.errCover'), 'error'); }
  }
  async function generatePrep() {
    if (!profile) { setCvStatus(t('dyn.errCvProfile'), 'error'); return; }
    const jdText = ($('#cvJd')?.value || '').trim(); if (jdText.length < 40) { setCvStatus(t('dyn.errCvNeed'), 'error'); return; }
    const lang = ($('#cvLang')?.value || 'fr');
    setCvStatus('...', '')
    try {
      const res = await fetch('/api/interview-prep', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ profile, jdText, jdTitle: $('#cvRole')?.value||'', lang }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error||t('dyn.errPrep'));
      const labels = lang === 'en'
        ? { tech:'Technical', beh:'Behavioral', role:'Role', gaps:'Gaps to prepare' }
        : { tech:'Technique', beh:'Comportemental', role:'Rôle', gaps:'Points à préparer' };
      const sec = (title, items) => '<div class="prep-sec"><h5>'+esc(title)+'</h5>'+items.map(i=>'<div class="prep-q"><strong>'+esc(i.q)+'</strong><div class="muted small-note">'+esc(i.why||'')+'</div><div class="small-note">STAR: '+esc(i.star||'')+'</div></div>').join('')+'</div>';
      $('#prepContent').innerHTML = sec(labels.tech, data.technical||[]) + sec(labels.beh, data.behavioral||[]) + sec(labels.role, data.roleQuestions||[]) + (data.gapsToPrepare?.length?'<div class="prep-sec"><h5>'+esc(labels.gaps)+'</h5><ul class="small-list">'+data.gapsToPrepare.map(g=>'<li>'+esc(g)+'</li>').join('')+'</ul></div>':'');
      $('#prepResult').hidden = false; $('#cvStatus').textContent = '';
    } catch(e){ setCvStatus(e.message||t('dyn.errPrep'), 'error'); }
  }
  async function generateGap() {
    if (!profile) { setCvStatus(t('dyn.errCvProfile'), 'error'); return; }
    const jdText = ($('#cvJd')?.value || '').trim(); if (jdText.length < 40) { setCvStatus(t('dyn.errCvNeed'), 'error'); return; }
    const lang = ($('#cvLang')?.value || 'fr');
    setCvStatus('...', '')
    try {
      const res = await fetch('/api/gap-roadmap', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ profile, jdText, lang }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error||t('dyn.errGap'));
      $('#gapContent').innerHTML = (data.roadmap||[]).map(r=>'<div class="prep-q"><strong>'+esc(r.skill)+'</strong><div class="small-note">'+esc(r.action)+'</div><div class="small-note muted">'+esc(r.resource)+'</div><div class="small-note">'+esc(r.project)+'</div><div class="small-note muted">'+esc(r.honest)+'</div></div>').join('') || '<p class="muted">'+esc(t('dyn.noGaps'))+'</p>';
      $('#gapResult').hidden = false; $('#cvStatus').textContent = '';
    } catch(e){ setCvStatus(e.message||t('dyn.errGap'), 'error'); }
  }

  function downloadCV() {
    if (!cvGenerated?.html) return;
    const blob = new Blob([cvGenerated.html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = cvGenerated.filename || 'cv-adapte.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function printCV() {
    if (!cvGenerated?.html) return;
    const frame = $('#cvPreviewFrame');
    if (frame?.contentWindow) {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      return;
    }
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(cvGenerated.html);
    w.document.close();
    w.focus();
    w.print();
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
    $('#cvGenerateBtn')?.addEventListener('click', generateCV);
    $('#cvDownloadBtn')?.addEventListener('click', downloadCV);
    $('#cvPrintBtn')?.addEventListener('click', printCV);
    $('#cvCoverBtn')?.addEventListener('click', generateCoverLetter);
    $('#cvPrepBtn')?.addEventListener('click', generatePrep);
    $('#cvGapBtn')?.addEventListener('click', generateGap);
    $('#cvSaveBtn')?.addEventListener('click', saveCVVersion);
    $('#cvDemoJdBtn')?.addEventListener('click', loadDemoJD);
    $('#cvJdFile')?.addEventListener('change', e => { handleJdFile(e.target.files?.[0]); e.target.value=''; });
    $('#coverCopyBtn')?.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText($('#coverText').textContent||''); $('#cvStatus').textContent=t('dyn.copied'); }catch{} });
    $('#coverDownloadBtn')?.addEventListener('click', ()=>{ if(!coverGenerated?.html) return; const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([coverGenerated.html],{type:'text/html;charset=utf-8'})); a.download='cover-letter.html'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });
    $('#trAddBtn')?.addEventListener('click', ()=>{ addTrackerItem({ company: $('#trCompany').value.trim(), role: $('#trRole').value.trim(), status: $('#trStatus').value, link: $('#trLink').value.trim() }); ['#trCompany','#trRole','#trLink'].forEach(id=>$(id).value=''); });
    $('#trExportBtn')?.addEventListener('click', exportTracker);
    $('#trImportInput')?.addEventListener('change', e=>{ if(e.target.files?.[0]) importTracker(e.target.files[0]); e.target.value=''; });
    $('#clearWorkspaceBtn')?.addEventListener('click', clearWorkspace);
    document.addEventListener('click', e => { const btn = e.target.closest('[data-close]'); if (btn) { const id = btn.dataset.close; const el = document.getElementById(id); if (el) el.hidden = true; } });
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
  renderTracker();
  renderVersions();
  initIntake();
  initMotion();
  $('#year').textContent = new Date().getFullYear();
  restore();
})();
