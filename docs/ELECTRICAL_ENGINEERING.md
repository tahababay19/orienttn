# Electrical Engineering Extension

This document describes the academic extension added to Orient TN so that the app also serves **electrical engineering / automation** profiles, not only software profiles.

## Why this extension exists

The original heuristic engine was built around software-development keywords (React, Node.js, Docker...). An electrical-engineering CV would therefore be classified as `Profil polyvalent` and its most important skills would be ignored. The extension adds domain-aware detection, scoring, and career content while keeping the original architecture intact: no framework, no database, no server sessions.

## Files changed

| File | Change |
|---|---|
| `lib/profile.mjs` | Added 15 electrical-engineering skills (FR/EN variants), a `Génie électrique / Automatisme` archetype, EE degrees/certifications (`habilitation électrique`, `BS/BE`, `H0V`, `Consuel`), and EE job-title hints for experience detection. |
| `lib/jobs.mjs` | The live-job filter now accepts EE titles (`ingénieur électrique`, `électricien industriel`, `automatique`, `SCADA`, `photovoltaïque`, ...). Portal search queries use a clean EE role instead of the raw archetype label. |
| `lib/career.mjs` | Job-description keyword extraction recognises EE tools. Gap roadmap entries and interview questions now include EE-specific actions and mini-projects. |
| `test/electrical.test.mjs` | Automated tests using a realistic EE CV. |
| `.github/workflows/ci.yml` | Runs `npm run check` and `npm test` on every push/PR. |

## Detected skills

`Électricité industrielle`, `Automatisme / API-PLC`, `SCADA / HMI`, `Moteurs & variateurs`, `Transformateurs`, `Protection électrique`, `Réseaux électriques`, `Énergies renouvelables`, `Éolien`, `Instrumentation & mesure`, `Câblage & armoires`, `MATLAB / Simulink`, `ETAP / PSCAD`, `AutoCAD Electrical`, `Arduino / ESP32`, `Maintenance industrielle`.

## Example CV used in tests

The full fixture lives in `test/electrical.test.mjs`. It is a French CV for an `Ingénieur électrique` with PLC/SCADA, motor drives, protection, photovoltaics, ETAP, AutoCAD Electrical, an EE engineering degree, and electrical safety certification.

Expected results:

- `archetype.id === 'electrical'`
- `archetype.label === 'Génie électrique / Automatisme'`
- EE skills detected from both the skills section and free text
- `Habilitation électrique` detected as a certification
- Portal searches built around `ingénieur électrique`
- Matching EE job offers score above the neutral baseline (48) with visible reasons
- Gap roadmap proposes EE projects (solar sizing, protection coordination, PLC automation, etc.)
- Interview prep includes EE technical questions (cable sizing, protection relays, VFD commissioning, transformer losses)

## Verify locally

```bash
npm install
npm run check   # syntax check of every source file
npm test        # 3 electrical-engineering tests
```

The GitHub Actions workflow repeats these two commands on `main` for every push and pull request.

## Design notes and limitations

- Detection stays **heuristic and transparent**: every match comes from a documented regular expression, and no skill is invented. The optional Claude integration still enriches the same profile shape.
- Patterns accept French and English spellings (`électricité`/`electricite`, `automatismes`/`automation`). Arabic terms are handled by the existing UI, not by the extraction regexes.
- A broad keyword such as `PV` or `BT` may occasionally match unrelated text; these are intentionally kept simple and readable rather than using a machine-learning classifier.
- The app still never stores CVs on the server and never auto-applies to offers.
