# Binnenkurs – SBF Binnen Segeln Trainer

Binnenkurs is a lightweight, locally hosted learning application for the German Sportbootführerschein Binnen sailing theory questions. It bundles the imported question catalog and diagrams, runs entirely in the browser, and stores learning progress on the current device. No backend, database, authentication, external API, or runtime network service is used.

## Requirements and setup

- Node.js 20+
- npm 10+

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

For a new PDF import, install Poppler so `pdftotext` and `pdftohtml` are available. Normal application use does not require Poppler because the generated JSON and image assets are committed locally.

## Learning modes

- **Dashboard:** See practiced questions, accuracy, completed exams, bookmarks, and catalog status.
- **Alle Fragen:** Search the 300-question catalog, filter by section, inspect answers/diagrams, and bookmark questions.
- **Freies Üben:** Work through the full catalog in randomized order, one question at a time, with immediate feedback and a running score.
- **Fehler wiederholen:** Practice questions whose latest stored attempt was incorrect.
- **Prüfung:** Choose a question count from 1–300. Questions are selected without duplicates; answers remain hidden until the exam is submitted, followed by a score and mistake review.
- **Merkliste:** Review bookmarked questions from any mode.
- **Einstellungen:** View local statistics and delete all progress, exam history, and bookmarks.

Answer choices are shuffled independently for every quiz session using Fisher–Yates. The displayed positions are labeled A–D, but the original answer IDs remain attached to their text, so scoring never depends on the source position.

## Commands

```bash
npm run dev                 # Start the Vite development server
npm run build               # Type-check and create a production build
npm test                    # Run Vitest unit, reducer, storage, and catalog tests
npm run test:e2e            # Run Playwright browser workflows
npm run validate:questions  # Validate catalog shape, numbering, answers, and images
npm run import:questions    # Re-import questions and images from the source PDF
npm run preview             # Preview the production build locally
```

The Playwright setup uses the locally installed Chrome executable at `/usr/bin/google-chrome`. Adjust `playwright.config.ts` if needed.

## Question import and data

The source PDF is `source/Fragenkatalog-Binnen-August-2023.pdf`. `scripts/import-questions.mjs`:

1. Extracts the embedded text with Poppler `pdftotext -layout` (OCR is not used).
2. Parses wrapped questions and answers across page boundaries while preserving official numbering and source answer order.
3. Extracts embedded graphics with `pdftohtml -xml` and associates them with the nearest preceding question by page coordinates.
4. Writes the typed JSON-shaped catalog to `src/data/questions.json`, copies images to `public/question-assets/`, and regenerates `IMPORT_REPORT.md`.

The PDF explicitly states “Antwort a ist immer die richtige.” at each of its three catalog sections. The importer records this as a global answer-key fact and sets `correctAnswerId: "a"`; it does not infer correctness from sailing knowledge. See `IMPORT_REPORT.md` for counts, provenance, and manual-review notes. Run `npm run validate:questions` after importing.

At runtime, `src/data/catalog.ts` loads the JSON with the `QuestionCatalog`/`Question` interfaces from `src/types/question.ts`. The application never edits the generated catalog.

## Project structure

```text
src/
├── components/          Reusable UI and question cards
├── data/                Generated catalog import and integrity tests
├── hooks/               Hash-based navigation hook
├── layouts/             Responsive application shell
├── pages/               Dashboard, catalog, practice, exam, bookmarks, settings
├── quiz/                Selection, Fisher–Yates answer order, scoring, reducer
├── state/               React progress context
├── storage/             Versioned localStorage schema and persistence helpers
└── types/               Shared TypeScript interfaces
scripts/                 PDF importer and catalog validator
source/                  Original PDF source
public/question-assets/  Extracted question diagrams and illustrations
e2e/                     Playwright browser tests
```

## Local progress storage

Progress is saved under `sbf-binnen-segeln:v1` in the browser's `localStorage`. It contains per-question attempt totals and latest correctness, up to 20 recent exam results, bookmarked question IDs, and settings defaults. The Settings reset action removes this key and restores empty progress; it does not remove the bundled catalog or assets. Active quiz sessions are not persisted across a page reload.

The exam simulation is intentionally configurable and is not presented as a verified copy of the official exam format.
