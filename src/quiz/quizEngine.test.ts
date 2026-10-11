import { describe, expect, it } from 'vitest'
import type { AnswerId, Question } from '../types/question'
import {
  createAnswerOrders,
  questionWithAnswerOrder,
  scoreAnswers,
  selectRandomQuestions,
  shuffleQuestions,
} from './quizEngine'

const questions: Question[] = [
  createQuestion('basis-001', 'a'),
  createQuestion('basis-002', 'b'),
  createQuestion('basis-003', 'c'),
  createQuestion('basis-004', 'd'),
]

describe('selectRandomQuestions', () => {
  it('selects the requested number without duplicates', () => {
    const selected = selectRandomQuestions(questions, 3, () => 0.25)

    expect(selected).toHaveLength(3)
    expect(new Set(selected.map((question) => question.id)).size).toBe(3)
  })

  it('caps selection at the available question count', () => {
    const selected = selectRandomQuestions(questions, 99, () => 0.5)

    expect(selected).toHaveLength(questions.length)
    expect(new Set(selected.map((question) => question.id))).toEqual(
      new Set(questions.map((question) => question.id)),
    )
  })

  it('does not mutate the source order while shuffling', () => {
    const originalOrder = questions.map((question) => question.id)

    shuffleQuestions(questions, () => 0)

    expect(questions.map((question) => question.id)).toEqual(originalOrder)
  })
})

describe('scoreAnswers', () => {
  it('calculates correct, incorrect, unanswered, and percentage values', () => {
    const score = scoreAnswers(questions, {
      'basis-001': 'a',
      'basis-002': 'a',
      'basis-003': 'c',
    })

    expect(score).toMatchObject({
      total: 4,
      correct: 2,
      incorrect: 2,
      unanswered: 1,
      percentage: 50,
    })
    expect(score.results.map((result) => result.isCorrect)).toEqual([true, false, true, false])
  })

  it('returns a zero percentage for an empty quiz', () => {
    expect(scoreAnswers([], {})).toMatchObject({
      total: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      percentage: 0,
    })
  })

  it('scores by stable answer ID after options are shuffled', () => {
    const question = questions[3]
    const answerOrders = createAnswerOrders([question], () => 0)
    const shuffledQuestion = questionWithAnswerOrder(question, answerOrders[question.id])

    expect(shuffledQuestion.answers.map((answer) => answer.id)).not.toEqual(
      question.answers.map((answer) => answer.id),
    )
    expect(shuffledQuestion.answers[0].id).toBe('b')
    expect(scoreAnswers([shuffledQuestion], { [question.id]: 'd' }).correct).toBe(1)
    expect(scoreAnswers([shuffledQuestion], { [question.id]: 'a' }).correct).toBe(0)
    expect(question.answers.map((answer) => answer.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it.each([0, 1, 2, 3])('scores the correct ID when it is displayed at position %d', (position) => {
    const question = questions[0]
    const otherAnswerIds = question.answers.map((answer) => answer.id).filter((answerId) => answerId !== 'a')
    const answerOrder: AnswerId[] = [...otherAnswerIds]
    answerOrder.splice(position, 0, 'a')
    const shuffledQuestion = questionWithAnswerOrder(question, answerOrder)

    expect(shuffledQuestion.answers[position].id).toBe('a')
    expect(scoreAnswers([shuffledQuestion], { [question.id]: 'a' }).correct).toBe(1)
  })
})

function createQuestion(id: string, correctAnswerId: 'a' | 'b' | 'c' | 'd'): Question {
  return {
    id,
    officialNumber: Number(id.slice(-3)),
    section: 'basis',
    prompt: `Frage ${id}`,
    answers: [
      { id: 'a', text: 'Antwort A' },
      { id: 'b', text: 'Antwort B' },
      { id: 'c', text: 'Antwort C' },
      { id: 'd', text: 'Antwort D' },
    ],
    correctAnswerId,
    assets: [],
    sourcePage: 1,
    requiresManualReview: false,
  }
}
