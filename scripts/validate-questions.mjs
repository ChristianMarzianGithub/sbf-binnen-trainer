import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const rootDirectory = resolve(scriptDirectory, '..')
const catalogPath = join(rootDirectory, 'src', 'data', 'questions.json')
const expectedNumbers = Array.from({ length: 300 }, (_, index) => index + 1)
const expectedAnswerIds = ['a', 'b', 'c', 'd']
const errors = []

const data = JSON.parse(readFileSync(catalogPath, 'utf8'))
const questions = Array.isArray(data.questions) ? data.questions : []

if (questions.length !== 300) {
  errors.push(`Expected 300 questions, found ${questions.length}.`)
}

if (data.catalog?.questionCount !== questions.length) {
  errors.push(
    `Catalog questionCount is ${String(data.catalog?.questionCount)}, but ${questions.length} records exist.`,
  )
}

const identifiers = new Set()
const numberCounts = new Map()
let missingImageCount = 0

for (const question of questions) {
  if (!question.id || typeof question.id !== 'string') {
    errors.push(`Question ${String(question.officialNumber)} has no valid identifier.`)
  } else if (identifiers.has(question.id)) {
    errors.push(`Duplicate question identifier: ${question.id}.`)
  } else {
    identifiers.add(question.id)
  }

  numberCounts.set(question.officialNumber, (numberCounts.get(question.officialNumber) ?? 0) + 1)

  if (!question.prompt || typeof question.prompt !== 'string' || !question.prompt.trim()) {
    errors.push(`Question ${question.id || String(question.officialNumber)} has empty text.`)
  }

  if (!Array.isArray(question.answers) || question.answers.length !== 4) {
    errors.push(`Question ${question.id} has ${question.answers?.length ?? 0} answer options instead of 4.`)
  } else {
    const answerIds = question.answers.map((answer) => answer.id)
    const uniqueAnswerIds = new Set(answerIds)

    if (uniqueAnswerIds.size !== answerIds.length) {
      errors.push(`Question ${question.id} has duplicated answer identifiers.`)
    }

    for (const [index, expectedId] of expectedAnswerIds.entries()) {
      const answer = question.answers[index]
      if (answer?.id !== expectedId) {
        errors.push(`Question ${question.id} is missing option ${expectedId} in its original position.`)
      }
      if (!answer?.text || typeof answer.text !== 'string' || !answer.text.trim()) {
        errors.push(`Question ${question.id} has empty option ${expectedId}.`)
      }
    }

    if (!answerIds.includes(question.correctAnswerId)) {
      errors.push(
        `Question ${question.id} references invalid correct answer ${String(question.correctAnswerId)}.`,
      )
    }
  }

  for (const asset of question.assets ?? []) {
    const assetPath = join(rootDirectory, 'public', asset.src.replace(/^\//, ''))
    if (!existsSync(assetPath)) {
      missingImageCount += 1
      errors.push(`Question ${question.id} references missing image ${asset.src}.`)
    }
  }
}

const missingNumbers = expectedNumbers.filter((number) => !numberCounts.has(number))
const duplicatedNumbers = [...numberCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([number]) => number)

if (missingNumbers.length > 0) {
  errors.push(`Missing official question numbers: ${missingNumbers.join(', ')}.`)
}
if (duplicatedNumbers.length > 0) {
  errors.push(`Duplicated official question numbers: ${duplicatedNumbers.join(', ')}.`)
}

const questionsWithImages = questions.filter((question) => question.assets?.length > 0)
const imageCount = questionsWithImages.reduce(
  (total, question) => total + question.assets.length,
  0,
)

console.log('Question catalog validation')
console.log(`- Total questions: ${questions.length}`)
console.log(`- Unique identifiers: ${identifiers.size}`)
console.log(`- Numbering gaps: ${missingNumbers.length}`)
console.log(`- Duplicated numbers: ${duplicatedNumbers.length}`)
console.log(`- Questions with images: ${questionsWithImages.length}`)
console.log(`- Referenced images: ${imageCount}`)
console.log(`- Missing images: ${missingImageCount}`)
console.log(`- Validation errors: ${errors.length}`)

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`)
  }
  process.exitCode = 1
} else {
  console.log('Validation passed.')
}
