# PDF Question Import Report

## Source

- File: `source/Fragenkatalog-Binnen-August-2023.pdf`
- SHA-256: `5e03fc0dbf4fb9a22b7dd1875856436cc18adbe8619b1635bb6ef017568ddd70`
- Catalog date: 1 August 2023
- Extraction method: embedded PDF text via Poppler `pdftotext -layout`; embedded graphics via `pdftohtml -xml`

## Results

| Metric | Count |
| --- | ---: |
| Extracted questions | 300 |
| Complete questions | 300 |
| Questions containing images | 74 |
| Extracted image assets | 78 |
| Questions requiring manual review | 74 |

## Answer key

The PDF contains a reliable global answer key. It explicitly states “Antwort a ist immer die richtige.” at the start of all three catalog sections (3 occurrences). Therefore `correctAnswerId: "a"` is supported directly by the source document and was not inferred from sailing knowledge.

## Manual review

All questions with extracted graphics are marked `requiresManualReview: true` because automated validation can verify file presence and page-order association, but not the instructional meaning of an illustration.

- Questions: 4, 5, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 107, 108, 110, 111, 112, 113, 114, 115, 116, 120, 121, 122, 123, 124, 125, 127, 129, 131, 132, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 162, 163, 164, 165, 166, 167, 180, 183, 185, 186, 188, 189, 192, 193, 196, 198, 199, 200, 201, 202, 203, 204, 243, 244, 295

## Formatting notes

- All 300 numbered question starts and all 1,200 answer-option starts were present in the embedded text layer; OCR was not required.
- Text split across pages is joined after removing repeated web-print headers, footers, breadcrumb navigation, and catalog section headings.
- Four color descriptions split after a trailing hyphen were rejoined without inserting a space.
- Sound-signal marks and navigation diagrams are image content in the PDF. They are retained as referenced image assets; no textual meaning was invented for them.
- Image assets are associated with the nearest preceding numbered question using PDF page and vertical coordinates. Page-header ELWIS logos are explicitly excluded.

## Ambiguities and issues

- No ambiguous correct-answer references were found.
- No missing question numbers or answer options were found by the importer.

Run `npm run validate:questions` to reproduce the structural validation.
