# Codex Maintenance Guide

## Purpose

This repository contains **Binnenkurs**, a local React learning trainer for the German SBF Binnen Segeln theory questions. It is a single-user, browser-only application: there is no backend, database, authentication, external API, or runtime network dependency.

Before implementing any change, read [README.md](README.md) and [PROJECT_STATUS.md](PROJECT_STATUS.md). After a meaningful change, update the relevant documentation and the status date.

## Stack and structure

- React 19 + TypeScript (strict mode), Vite, Tailwind CSS v4.
- `src/App.tsx` and `src/layouts/` provide hash-based navigation and the responsive shell.
- `src/pages/` contains dashboard, catalog, practice, exam, bookmarks, mistakes, and settings screens.
- `src/components/` contains reusable question and UI components.
- `src/quiz/` contains pure selection, scoring, answer-order, and reducer logic.
- `src/state/` connects React UI to persisted progress; `src/storage/` owns the versioned storage schema.
- `src/types/` contains shared TypeScript interfaces; `src/data/` contains the imported catalog and catalog tests.
- `scripts/` contains the PDF importer and validator; `source/` contains the source PDF; extracted images live in `public/question-assets/`.
- `e2e/` contains Playwright browser workflows.

## Data and import architecture

`src/data/questions.json` is generated from `source/Fragenkatalog-Binnen-August-2023.pdf` and loaded statically by `src/data/catalog.ts`. The importer uses Poppler `pdftotext -layout` for embedded text and `pdftohtml -xml` for image/page coordinates; it joins wrapped/page-boundary text, preserves official numbering and source answer order, and writes image references under `/question-assets/`. Re-import with `npm run import:questions`, then run `npm run validate:questions`.

Each `Question` has a stable `id`, `officialNumber`, `prompt`, four `answers` with stable `AnswerId` values (`a`–`d`), `correctAnswerId`, optional `assets`, source page, and review metadata. The PDF explicitly states that answer `a` is always correct; the generated catalog records that global evidence rather than inferring correctness from sailing knowledge.

At quiz-session initialization, `createAnswerOrders` makes a copy of each question's answer array and applies Fisher–Yates. The reducer stores the resulting answer-ID order once in `answerOrders`; rendering maps those IDs back to the original answer objects and labels their displayed positions A–D. Selection and scoring always use the stable original answer ID, so shuffling never changes correctness or mutates `questions.json`.

## Development conventions

- Keep TypeScript strict and preserve the existing small, functional architecture.
- Prefer pure functions for quiz/storage logic and narrow props for UI components.
- Keep question wording, numbering, answer IDs, and source provenance unchanged when editing imported data.
- Do not add a backend, database, authentication, external API, or unnecessary dependency.
- Use accessible semantic controls, visible focus states, keyboard-friendly interactions, and responsive Tailwind classes.
- Use `apply_patch` for source/documentation edits; do not commit or create branches unless explicitly requested.

## Verification

Run the focused checks relevant to a change, then the full gate when practical:

```bash
npm test
npm run test:e2e
npm run validate:questions
npm run build
```

Tests should cover scoring, random selection without duplicates, answer-order stability, persistence, catalog integrity, images, and important browser workflows. Update tests when behavior changes, and update `README.md`/`PROJECT_STATUS.md` after meaningful architectural or feature changes.
