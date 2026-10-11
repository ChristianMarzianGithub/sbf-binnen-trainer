# Project Status

Last updated: 2026-10-11

## Current implementation

Binnenkurs is a Vite-served React/TypeScript SPA for practicing the 300-question SBF Binnen Segeln theory catalog imported from the August 2023 PDF. Navigation uses the URL hash, catalog data is bundled as JSON, and all learner data stays in browser `localStorage`.

## Completed features

- Responsive dashboard with practiced-question count, accuracy, completed exams, bookmarks, and catalog status.
- Searchable/filterable catalog with original question numbering, four source answer choices, answer reveal, bookmark controls, and extracted diagrams.
- Randomized practice mode with one-question-at-a-time flow, immediate feedback, correct-answer highlighting, score summary, and bookmarks.
- Mistakes-only practice based on the latest stored result for each question.
- Configurable exam simulation with random unique question selection, no answer feedback before submission, final percentage, and detailed mistake review.
- Fisher–Yates answer randomization in practice and exams. Stable answer IDs are retained for selection/scoring while displayed positions are labeled A–D.
- Progress persistence, latest per-question result, exam history, bookmarks, malformed-storage sanitization, and full reset from Settings.
- PDF importer, image extraction, import report, catalog validator, 21 Vitest tests, and four Playwright browser workflows.
- Production build and responsive/mobile styling with accessible form controls and visible focus states.

## Known limitations

- The bundled catalog is dated 1 August 2023. It is not automatically synchronized with a newer official catalog.
- The exam is explicitly a freely configurable learning simulation; it is not claimed to reproduce the current official exam format.
- The PDF answer key is a global statement that answer `a` is correct. This is documented provenance from the PDF, not an independently verified answer source.
- Questions with diagrams are flagged for manual review. Image files are extracted and referenced, but their instructional meaning and detailed German alt text have not been manually audited.
- An active practice/exam session is held only in React state and is lost on a page reload. Completed attempts and results survive reloads.
- The stored `defaultPracticeCount` setting is part of the schema but the current practice screen uses the full available pool and does not expose editable count controls.
- The Playwright configuration expects Google Chrome at `/usr/bin/google-chrome`; change `playwright.config.ts` if the local installation differs.
- There is no installable PWA/service worker, progress export/import, multi-user support, or content-editing UI.

## Unfinished work and possible next improvements

1. Review diagram associations and replace generic image alt text with meaningful descriptions.
2. Add a catalog update workflow and re-import/review process for future official PDF versions.
3. Decide whether to persist in-progress quiz sessions and, if so, version that storage separately from completed progress.
4. Add a real practice-count setting or remove the unused default field after deciding the desired UX.
5. Consider optional progress export/import and a service worker if offline installation is a product goal.
6. Keep exam-format wording and answer-key provenance current when the source material changes.

## How to continue development

1. Read `README.md` and `AGENTS.md`, then inspect this file for known limitations.
2. Run `npm install`, `npm test`, and `npm run validate:questions` before changing quiz or data behavior.
3. Keep catalog edits generated through `npm run import:questions`; do not hand-edit `questions.json` unless correcting a documented import issue.
4. Add or update focused Vitest tests for pure logic and Playwright coverage for user-visible flows.
5. Run `npm run test:e2e` and `npm run build` before handoff.
6. Update `README.md`, this status file, and import documentation whenever behavior, data provenance, commands, or limitations change.
