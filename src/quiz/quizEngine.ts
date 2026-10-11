import type { AnswerId, AnswerOption, Question } from '../types/question'

export type AnswerMap = Partial<Record<string, AnswerId>>
export type AnswerOrderMap = Partial<Record<string, AnswerId[]>>

export interface QuizQuestionResult {
  questionId: string
  selectedAnswerId: AnswerId | null
  correctAnswerId: AnswerId | null
  isCorrect: boolean
  isAnswered: boolean
}

export interface QuizScore {
  total: number
  correct: number
  incorrect: number
  unanswered: number
  percentage: number
  results: QuizQuestionResult[]
}

export function shuffleQuestions<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1))
    const safeIndex = Math.max(0, Math.min(index, randomIndex))
    ;[shuffled[index], shuffled[safeIndex]] = [shuffled[safeIndex], shuffled[index]]
  }

  return shuffled
}

export function createAnswerOrders(
  questions: readonly Question[],
  random: () => number = Math.random,
): AnswerOrderMap {
  return Object.fromEntries(
    questions.map((question) => [
      question.id,
      shuffleQuestions(question.answers, random).map((answer) => answer.id),
    ]),
  )
}

export function questionWithAnswerOrder(
  question: Question,
  answerOrder: readonly AnswerId[] | undefined,
): Question {
  if (!answerOrder) return question

  const answersById = new Map<AnswerId, AnswerOption>(
    question.answers.map((answer) => [answer.id, answer]),
  )
  const orderedAnswers = answerOrder
    .map((answerId) => answersById.get(answerId))
    .filter((answer): answer is AnswerOption => Boolean(answer))

  return orderedAnswers.length === question.answers.length
    ? { ...question, answers: orderedAnswers }
    : question
}

export function selectRandomQuestions<T>(
  questions: readonly T[],
  requestedCount: number,
  random: () => number = Math.random,
): T[] {
  const count = Math.max(0, Math.min(questions.length, Math.floor(requestedCount)))
  return shuffleQuestions(questions, random).slice(0, count)
}

export function scoreAnswers(questions: readonly Question[], answers: AnswerMap): QuizScore {
  const results = questions.map<QuizQuestionResult>((question) => {
    const selectedAnswerId = answers[question.id] ?? null
    const isAnswered = selectedAnswerId !== null
    const isCorrect =
      isAnswered && question.correctAnswerId !== null && selectedAnswerId === question.correctAnswerId

    return {
      questionId: question.id,
      selectedAnswerId,
      correctAnswerId: question.correctAnswerId,
      isCorrect,
      isAnswered,
    }
  })
  const correct = results.filter((result) => result.isCorrect).length
  const unanswered = results.filter((result) => !result.isAnswered).length
  const total = questions.length

  return {
    total,
    correct,
    incorrect: total - correct,
    unanswered,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    results,
  }
}
