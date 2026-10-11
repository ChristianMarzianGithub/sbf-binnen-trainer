# SBF Binnen Segeln Lerntrainer – Implementation Plan

## 1. Repository and source inspection

- The repository currently contains only `source/Fragenkatalog-Binnen-August-2023.pdf`.
- The PDF is the official WSV/ELWIS catalog dated 1 August 2023.
- It is an 85-page, tagged, non-encrypted A4 PDF with a usable text layer and embedded diagrams.
- The catalog contains 300 questions in three sections:
  - Basisfragen: questions 1–72
  - Spezifische Fragen Binnen: questions 73–253
  - Spezifische Fragen Segeln: questions 254–300
- The source document states that answer `a` is always correct. The app should randomize displayed answers at runtime so position does not reveal the solution.
- No questions are imported during the initial scaffold. Placeholder screens and an empty JSON data file are used instead.

## 2. Product scope

The application is a local-first, single-user learning tool with no server-side components. It should support:

1. A dashboard with progress, accuracy, bookmarks, and recent activity.
2. A searchable/filterable question browser.
3. Randomized practice sessions with immediate feedback.
4. Configurable simulated exams with feedback after completion.
5. Focused review of incorrectly answered questions.
6. Bookmarks for difficult questions.
7. Persistent progress and settings in `localStorage`.
8. A clearly confirmed progress reset action.
9. Responsive desktop and mobile layouts.

## 3. Technical approach

- **Framework:** React with TypeScript and Vite.
- **Styling:** Tailwind CSS using the Vite integration.
- **Question source:** Static JSON bundled with the application.
- **Persistence:** A versioned `localStorage` document behind a small storage module.
- **Navigation:** Lightweight hash-based client-side navigation. This avoids a router dependency while keeping refresh-safe local URLs.
- **Offline behavior:** All code, fonts, icons, question data, and question images are local build assets. No runtime network requests are required.
- **Accessibility:** Semantic landmarks, visible focus states, adequate contrast, button labels, and keyboard-friendly answer controls.

## 4. Proposed project structure

```text
.
├── PLAN.md
├── source/
│   └── Fragenkatalog-Binnen-August-2023.pdf
├── public/
│   └── question-assets/        # Imported diagrams in a later phase
├── scripts/
│   └── import-questions.mjs    # PDF import script in a later phase
├── src/
│   ├── components/             # Shared visual components
│   ├── data/
│   │   └── questions.json      # Empty until the import phase
│   ├── layouts/                # Application shell/navigation
│   ├── pages/                  # Route-level screens
│   ├── storage/                # Versioned localStorage access
│   ├── types/                  # Shared TypeScript models
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
└── vite.config.ts
```

The initial scaffold may keep closely related placeholder components together. Files should be split only when real behavior makes the boundary useful.

## 5. Question data format

`src/data/questions.json` will contain a versioned catalog object rather than an unstructured array.

```json
{
  "schemaVersion": 1,
  "catalog": {
    "title": "Fragenkatalog Binnen",
    "validFrom": "2023-08-01",
    "source": "WSV / ELWIS",
    "questionCount": 300
  },
  "questions": [
    {
      "id": "basis-001",
      "officialNumber": 1,
      "section": "basis",
      "prompt": "Question text",
      "answers": [
        { "id": "a", "text": "Answer text" },
        { "id": "b", "text": "Answer text" },
        { "id": "c", "text": "Answer text" },
        { "id": "d", "text": "Answer text" }
      ],
      "correctAnswerId": "a",
      "assets": [
        {
          "src": "/question-assets/basis-001-01.png",
          "alt": "Description of the diagram"
        }
      ],
      "sourcePage": 2
    }
  ]
}
```

### Data rules

- `id` is stable and independent of list order.
- `officialNumber` preserves the catalog numbering.
- `section` is one of `basis`, `binnen`, or `segeln`.
- `answers` remain in official source order in JSON; display order is shuffled per session.
- `correctAnswerId` points to an answer ID rather than an array index.
- `assets` is optional and supports multiple diagrams.
- `sourcePage` helps auditing and manual correction.
- Formatting is stored as plain text where possible. Only a deliberately limited rich-text representation should be introduced if formulas or symbols require it.

## 6. Progress and settings format

One versioned object will be stored under `sbf-binnen-segeln:v1`.

```ts
interface StoredAppState {
  version: 1;
  progress: Record<string, {
    attempts: number;
    correctAttempts: number;
    lastAnsweredAt: string;
    lastAnswerCorrect: boolean;
  }>;
  bookmarks: string[];
  settings: {
    defaultPracticeCount: number;
    defaultExamCount: number;
    shuffleAnswers: boolean;
  };
}
```

Storage reads must validate the top-level version and safely fall back to defaults if data is missing or malformed. Future schema changes should use explicit migrations.

## 7. PDF import strategy

The import will be an explicit build-time/development script, never runtime application code.

1. **Extract text:** Run `pdftotext -layout` so question numbers, answer labels, headings, and wrapped lines retain useful spatial structure.
2. **Detect sections:** Use the three catalog headings and validated number ranges to assign `basis`, `binnen`, and `segeln`.
3. **Parse questions:** Split on numbered question headings, then parse answer blocks `a.` through `d.`. Normalize whitespace while preserving punctuation and symbols.
4. **Assign solutions:** Set `correctAnswerId` to `a`, based on the source catalog statement, while retaining source order.
5. **Extract diagrams:** Use `pdfimages` or rendered, cropped page regions for diagrams. Associate them with questions using page coordinates from `pdftotext -bbox-layout`/Poppler output rather than image sequence alone.
6. **Create accessible assets:** Save deterministic filenames under `public/question-assets/`. Add manually reviewed German alternative text for instructional images.
7. **Validate automatically:** Fail import unless there are exactly 300 unique official numbers, the expected section ranges, four answers per question (unless a verified exception exists), valid answer references, and all referenced assets exist.
8. **Review manually:** Compare every generated record with the PDF, with extra attention to diagrams, sound-signal symbols, units, special characters, and answers spanning page breaks.
9. **Record provenance:** Keep catalog date, source organization, source page, and a checksum of the PDF in generated metadata. Confirm the applicable reuse/redistribution terms before distributing the extracted catalog.

The generated JSON should be committed so normal development and production builds do not require PDF tooling.

## 8. Implementation phases

### Phase 1 — scaffold (current task)

- Configure Vite, React, TypeScript, and Tailwind CSS.
- Add the application shell and responsive navigation.
- Add polished placeholder screens for all requested areas.
- Add an empty versioned question catalog.
- Verify a production build.

### Phase 2 — import

- Implement and validate the PDF importer.
- Review generated questions and extracted images.
- Replace placeholder counts with real catalog data.

### Phase 3 — learning flows

- Implement practice, answer shuffling, and immediate feedback.
- Implement exam configuration, exam sessions, and results.
- Implement browser filters, incorrect-answer review, and bookmarks.

### Phase 4 — persistence and quality

- Add versioned progress/settings storage and reset confirmation.
- Add focused unit tests for scoring, shuffling, storage migration, and session generation.
- Test responsive behavior, keyboard navigation, and offline operation.

## 9. Completion criteria for the scaffold

- `npm run dev` starts the local Vite application.
- All placeholder screens are reachable through desktop and mobile navigation.
- The layout is responsive and visually coherent.
- No question text is extracted into the application yet.
- `npm run build` completes without errors.
