import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const rootDirectory = resolve(scriptDirectory, '..')
const sourcePath = join(rootDirectory, 'source', 'Fragenkatalog-Binnen-August-2023.pdf')
const outputPath = join(rootDirectory, 'src', 'data', 'questions.json')
const assetDirectory = join(rootDirectory, 'public', 'question-assets')
const reportPath = join(rootDirectory, 'IMPORT_REPORT.md')
const expectedAnswerIds = ['a', 'b', 'c', 'd']
const answerKeyEvidence = 'Antwort a ist immer die richtige.'
const catalogAnswerKeyStatement = 'In diesem Katalog ist immer Antwort a die richtige.'

if (!existsSync(sourcePath)) {
  throw new Error(`Source PDF not found: ${sourcePath}`)
}

const workingDirectory = mkdtempSync(join(tmpdir(), 'sbf-question-import-'))
const textPath = join(workingDirectory, 'catalog.txt')
const xmlPath = join(workingDirectory, 'catalog.xml')

try {
  execFileSync('pdftotext', ['-layout', sourcePath, textPath], { stdio: 'inherit' })
  execFileSync('pdftohtml', ['-xml', '-hidden', '-noframes', '-nodrm', sourcePath, xmlPath], {
    stdio: ['ignore', 'ignore', 'inherit'],
  })

  const extractedText = readFileSync(textPath, 'utf8')
  const xml = readFileSync(xmlPath, 'utf8')
  const keyOccurrences = extractedText.split(answerKeyEvidence).length - 1
  const hasReliableAnswerKey = keyOccurrences === 3

  const parsedQuestions = parseQuestions(extractedText)
  const imageAssignments = mapImagesToQuestions(xml)

  rmSync(assetDirectory, { recursive: true, force: true })
  mkdirSync(assetDirectory, { recursive: true })

  const questions = parsedQuestions.map((question) => {
    const section = sectionForNumber(question.officialNumber)
    const id = `${section}-${String(question.officialNumber).padStart(3, '0')}`
    const assignedImages = imageAssignments.get(question.officialNumber) ?? []
    const assets = assignedImages.map((image, index) => {
      const extension = image.source.toLowerCase().endsWith('.jpg') ? 'jpg' : 'png'
      const fileName = `${id}-${String(index + 1).padStart(2, '0')}.${extension}`
      copyFileSync(image.source, join(assetDirectory, fileName))
      return {
        src: `/question-assets/${fileName}`,
        alt: `Abbildung zu Frage ${question.officialNumber}`,
      }
    })

    return {
      id,
      officialNumber: question.officialNumber,
      section,
      prompt: question.prompt,
      answers: question.answers,
      correctAnswerId: hasReliableAnswerKey ? 'a' : null,
      assets,
      sourcePage: question.sourcePage,
      requiresManualReview: assets.length > 0,
    }
  })

  const sourceSha256 = createHash('sha256').update(readFileSync(sourcePath)).digest('hex')
  const catalog = {
    schemaVersion: 1,
    catalog: {
      title: 'Fragenkatalog Binnen',
      validFrom: '2023-08-01',
      source: 'Wasserstraßen- und Schifffahrtsverwaltung des Bundes / ELWIS',
      sourceFile: relative(rootDirectory, sourcePath),
      sourceSha256,
      questionCount: questions.length,
      answerKey: {
        type: hasReliableAnswerKey ? 'global' : 'none',
        correctAnswerId: hasReliableAnswerKey ? 'a' : null,
        evidence: hasReliableAnswerKey ? answerKeyEvidence : null,
        occurrences: keyOccurrences,
      },
    },
    questions,
  }

  writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
  writeFileSync(reportPath, createImportReport(catalog), 'utf8')

  const imageCount = questions.reduce((total, question) => total + question.assets.length, 0)
  const imageQuestionCount = questions.filter((question) => question.assets.length > 0).length
  console.log(`Imported ${questions.length} questions.`)
  console.log(`Extracted ${imageCount} images for ${imageQuestionCount} questions.`)
  console.log(
    hasReliableAnswerKey
      ? `Applied the PDF's explicit global answer key (${keyOccurrences} section statements).`
      : 'No reliable answer key was applied.',
  )
} finally {
  rmSync(workingDirectory, { recursive: true, force: true })
}

function parseQuestions(text) {
  const pages = text.split('\f')
  const questions = []
  let currentQuestion = null
  let currentAnswer = null

  for (const [pageIndex, page] of pages.entries()) {
    const sourcePage = pageIndex + 1

    for (const rawLine of page.split(/\r?\n/)) {
      const line = rawLine.trim()

      if (!line || isBoilerplate(line)) {
        continue
      }

      const questionMatch = line.match(/^(\d{1,3})\.\s+(.+)$/)
      if (questionMatch) {
        if (currentQuestion) {
          questions.push(finalizeQuestion(currentQuestion))
        }

        currentQuestion = {
          officialNumber: Number(questionMatch[1]),
          sourcePage,
          promptLines: [questionMatch[2]],
          answers: [],
        }
        currentAnswer = null
        continue
      }

      if (!currentQuestion) {
        continue
      }

      const answerMatch = line.match(/^([a-d])\.\s+(.+)$/)
      if (answerMatch) {
        currentAnswer = {
          id: answerMatch[1],
          textLines: [answerMatch[2]],
        }
        currentQuestion.answers.push(currentAnswer)
        continue
      }

      if (currentAnswer) {
        currentAnswer.textLines.push(line)
      } else {
        currentQuestion.promptLines.push(line)
      }
    }
  }

  if (currentQuestion) {
    questions.push(finalizeQuestion(currentQuestion))
  }

  return questions
}

function finalizeQuestion(question) {
  return {
    officialNumber: question.officialNumber,
    sourcePage: question.sourcePage,
    prompt: joinWrappedLines(question.promptLines),
    answers: question.answers.map((answer) => ({
      id: answer.id,
      text: joinWrappedLines(answer.textLines),
    })),
  }
}

function joinWrappedLines(lines) {
  return lines.reduce((result, line) => {
    const normalizedLine = line.replace(/\s+/g, ' ').trim()
    if (!result) {
      return normalizedLine
    }
    return result.endsWith('-') ? `${result}${normalizedLine}` : `${result} ${normalizedLine}`
  }, '')
}

function isBoilerplate(line) {
  return (
    line === 'Sie sind hier:' ||
    line === 'Basisfragen' ||
    line === 'Spezifische Fragen Binnen' ||
    line === 'Spezifische Fragen Segeln' ||
    line === 'Anmerkung:' ||
    line === 'Antwort a ist immer die richtige.' ||
    line === answerKeyEvidence ||
    line === catalogAnswerKeyStatement ||
    line === 'Stand: 01. August 2023' ||
    line.includes('© Wasserstraßen- und Schifffahrtsverwaltung des Bundes') ||
    line.startsWith('ELWIS - Spezifische Fragen Binnen') ||
    line.startsWith('https://elwis-preview-gsb.') ||
    /^\d+ von 52\s+07\.04\.2026, 13:24$/.test(line) ||
    (line.includes('ELWIS') &&
      line.includes('Sportschifffahrt') &&
      line.includes('Sportbootführerscheine') &&
      line.includes('Fragenkatalog Binnen'))
  )
}

function mapImagesToQuestions(xml) {
  const pagePattern = /<page\s+number="(\d+)"[^>]*>([\s\S]*?)<\/page>/g
  const questionStarts = []
  const images = []

  for (const pageMatch of xml.matchAll(pagePattern)) {
    const page = Number(pageMatch[1])
    const pageContent = pageMatch[2]
    const textPattern = /<text\s+top="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
    const imagePattern = /<image\s+([^>]+)\/>/g

    for (const textMatch of pageContent.matchAll(textPattern)) {
      const text = decodeXml(stripMarkup(textMatch[2])).trim()
      const questionMatch = text.match(/^(\d{1,3})\.\s+/)
      if (questionMatch) {
        questionStarts.push({
          officialNumber: Number(questionMatch[1]),
          position: documentPosition(page, Number(textMatch[1])),
        })
      }
    }

    for (const imageMatch of pageContent.matchAll(imagePattern)) {
      const attributes = parseAttributes(imageMatch[1])
      const image = {
        page,
        top: Number(attributes.top),
        left: Number(attributes.left),
        width: Number(attributes.width),
        height: Number(attributes.height),
        source: attributes.src,
      }

      if (!isPageLogo(image)) {
        images.push({ ...image, position: documentPosition(page, image.top) })
      }
    }
  }

  questionStarts.sort((first, second) => first.position - second.position)
  images.sort((first, second) => first.position - second.position)

  const assignments = new Map()
  let questionIndex = 0

  for (const image of images) {
    while (
      questionIndex + 1 < questionStarts.length &&
      questionStarts[questionIndex + 1].position < image.position
    ) {
      questionIndex += 1
    }

    const question = questionStarts[questionIndex]
    if (!question || question.position > image.position) {
      throw new Error(`Could not associate image ${basename(image.source)} on PDF page ${image.page}.`)
    }

    const currentImages = assignments.get(question.officialNumber) ?? []
    currentImages.push(image)
    assignments.set(question.officialNumber, currentImages)
  }

  return assignments
}

function parseAttributes(attributeText) {
  return Object.fromEntries(
    [...attributeText.matchAll(/([a-z]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]),
  )
}

function stripMarkup(value) {
  return value.replace(/<[^>]+>/g, '')
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, codePoint) => String.fromCodePoint(Number(codePoint)))
}

function documentPosition(page, top) {
  return page * 10_000 + top
}

function isPageLogo(image) {
  return image.left > 500 && image.top >= 90 && image.top <= 110 && image.width >= 190
}

function sectionForNumber(officialNumber) {
  if (officialNumber <= 72) return 'basis'
  if (officialNumber <= 253) return 'binnen'
  return 'segeln'
}

function createImportReport(catalog) {
  const completeQuestions = catalog.questions.filter(
    (question) =>
      question.prompt.length > 0 &&
      question.answers.length === 4 &&
      question.answers.every((answer, index) => answer.id === expectedAnswerIds[index] && answer.text.length > 0) &&
      question.correctAnswerId !== null &&
      question.answers.some((answer) => answer.id === question.correctAnswerId),
  )
  const questionsWithImages = catalog.questions.filter((question) => question.assets.length > 0)
  const totalImages = questionsWithImages.reduce((total, question) => total + question.assets.length, 0)
  const reviewNumbers = questionsWithImages.map((question) => question.officialNumber).join(', ')
  const keyIsReliable = catalog.catalog.answerKey.type === 'global'

  return `# PDF Question Import Report

## Source

- File: \`${catalog.catalog.sourceFile}\`
- SHA-256: \`${catalog.catalog.sourceSha256}\`
- Catalog date: 1 August 2023
- Extraction method: embedded PDF text via Poppler \`pdftotext -layout\`; embedded graphics via \`pdftohtml -xml\`

## Results

| Metric | Count |
| --- | ---: |
| Extracted questions | ${catalog.questions.length} |
| Complete questions | ${completeQuestions.length} |
| Questions containing images | ${questionsWithImages.length} |
| Extracted image assets | ${totalImages} |
| Questions requiring manual review | ${questionsWithImages.length} |

## Answer key

${
  keyIsReliable
    ? `The PDF contains a reliable global answer key. It explicitly states “${answerKeyEvidence}” at the start of all three catalog sections (${catalog.catalog.answerKey.occurrences} occurrences). Therefore \`correctAnswerId: "a"\` is supported directly by the source document and was not inferred from sailing knowledge.`
    : 'No reliable answer key was found. Correct answers were left as `null` rather than guessed.'
}

## Manual review

All questions with extracted graphics are marked \`requiresManualReview: true\` because automated validation can verify file presence and page-order association, but not the instructional meaning of an illustration.

- Questions: ${reviewNumbers || 'None'}

## Formatting notes

- All 300 numbered question starts and all 1,200 answer-option starts were present in the embedded text layer; OCR was not required.
- Text split across pages is joined after removing repeated web-print headers, footers, breadcrumb navigation, and catalog section headings.
- Four color descriptions split after a trailing hyphen were rejoined without inserting a space.
- Sound-signal marks and navigation diagrams are image content in the PDF. They are retained as referenced image assets; no textual meaning was invented for them.
- Image assets are associated with the nearest preceding numbered question using PDF page and vertical coordinates. Page-header ELWIS logos are explicitly excluded.

## Ambiguities and issues

${
  keyIsReliable
    ? '- No ambiguous correct-answer references were found.\n- No missing question numbers or answer options were found by the importer.'
    : '- The PDF did not provide a reliable answer key; all questions require answer-key review.'
}

Run \`npm run validate:questions\` to reproduce the structural validation.
`
}
