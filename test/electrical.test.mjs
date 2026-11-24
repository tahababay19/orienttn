import test from 'node:test';
import assert from 'node:assert/strict';

import { analyzeProfile } from '../lib/profile.mjs';
import { boardLinks, isStageTitle, scoreJob } from '../lib/jobs.mjs';
import { generateCoverLetter, generateGapRoadmap, generateInterviewPrep } from '../lib/career.mjs';

const EE_CV = `NOM : Taha Babay
taha.babay@example.com
Ingénieur électrique — Génie électrique / Automatisme

COMPÉTENCES
Électricité industrielle, Automatisme / API-PLC Siemens S7-1200, SCADA HMI,
Moteurs asynchrone et variateurs de vitesse, Transformateurs, Protection électrique,
Réseaux électriques BT/HT, Énergies renouvelables photovoltaïque, MATLAB Simulink,
ETAP, AutoCAD Electrical, Instrumentation et mesure, Câblage d'armoires,
Maintenance préventive

FORMATIONS
Diplôme d'ingénieur en génie électrique — ENIT Tunis, 2024

CERTIFICATIONS
Habilitation électrique BS/BE, Consuel

EXPÉRIENCE
Technicien électrique chez Industrie Tunis, 2022-2024. Maintenance électrique,
câblage d'armoires et commande de moteurs avec variateur.

LANGUES
Français C1, Anglais B2, Arabe natif`;

const goals = { targetRole: 'Ingénieur électrique', contract: 'CDI', city: 'Tunis' };

test('extracts an electrical-engineering profile from a CV', () => {
  const p = analyzeProfile(EE_CV, goals);

  assert.equal(p.archetype.id, 'electrical');
  assert.equal(p.archetype.label, 'Génie électrique / Automatisme');

  for (const skill of [
    'Électricité industrielle',
    'Automatisme / API-PLC',
    'SCADA / HMI',
    'Moteurs & variateurs',
    'Protection électrique',
    'Énergies renouvelables',
    'MATLAB / Simulink',
    'ETAP / PSCAD',
    'AutoCAD Electrical',
    'Instrumentation & mesure',
  ]) {
    assert.ok(p.skills.includes(skill), `Expected skill to be detected: ${skill}`);
  }

  assert.ok(p.certifications.some(c => /habilitation/i.test(c)), 'Electrical certification not detected');
  assert.ok(p.formations.some(f => /génie électrique/i.test(f)), 'EE degree not detected');
  assert.ok(p.completeness >= 50, 'Completeness score should reflect a detailed CV');
});

test('keeps electrical job titles and scores them transparently', () => {
  assert.equal(isStageTitle('Technicien électrique'), false);
  assert.equal(isStageTitle('Stage PFE électrique'), true);

  const p = analyzeProfile(EE_CV, goals);
  const links = boardLinks(p);
  assert.ok(links[0].url.includes(encodeURIComponent('Ingénieur électrique')));

  const scored = scoreJob({
    title: 'Technicien électrique - maintenance',
    extra: 'Électricité industrielle, Automatisme / API-PLC, Moteurs & variateurs',
    company: 'Industrie Tunis',
    url: 'https://example.com/offre-electrique',
    location: 'Tunis',
    source: 'Test',
  }, p);

  assert.ok(scored.score > 48, 'A matching EE offer should score above the neutral baseline');
  assert.ok(scored.reasons.length > 0, 'Scoring reasons must be exposed to the user');
});

test('generates electrical-specific roadmap, interview prep and cover letter', () => {
  const p = analyzeProfile(EE_CV, goals);
  const jd = `Ingénieur automatique — Tunisie
Requirements: PLC programming, SCADA supervision, photovoltaïque sizing,
ETAP network study, instrumentation and protection électrique.`;

  const roadmap = generateGapRoadmap({ profile: p, jdText: jd });
  assert.ok(roadmap.roadmap.length > 0);
  assert.ok(roadmap.roadmap.some(r => /photovolta|protection|etap|scada|plc/i.test(`${r.skill} ${r.action}`)));

  const prep = generateInterviewPrep({ profile: p, jdText: jd });
  assert.ok(prep.technical.some(q => /câble|disjoncteur|variateur|différentiel/i.test(q.q)));

  const letter = generateCoverLetter({ profile: p, jdText: jd, jdTitle: 'Ingénieur électrique', lang: 'fr' });
  assert.ok(letter.text.includes('Génie électrique / Automatisme'));
});
