import { describe, expect, it } from 'vitest'
import type { AnswerOrderMap } from './quizEngine'
import { createQuizSession, quizSessionReducer } from './quizReducer'

describe('quizSessionReducer', () => {
  it('locks a practice answer after submission', () => {
    const initial = createQuizSession('practice', ['question-1'])
    const selected = quizSessionReducer(initial, {
      type: 'select-answer',
      questionId: 'question-1',
      answerId: 'b',
    })
    const submitted = quizSessionReducer(selected, { type: 'submit-current' })
    const changed = quizSessionReducer(submitted, {
      type: 'select-answer',
      questionId: 'question-1',
      answerId: 'a',
    })

    expect(changed.answers['question-1']).toBe('b')
    expect(changed.submittedQuestionIds['question-1']).toBe(true)
  })

  it('allows exam answers to be changed before completion', () => {
    const initial = createQuizSession('exam', ['question-1'])
    const firstSelection = quizSessionReducer(initial, {
      type: 'select-answer',
      questionId: 'question-1',
      answerId: 'b',
    })
    const secondSelection = quizSessionReducer(firstSelection, {
      type: 'select-answer',
      questionId: 'question-1',
      answerId: 'a',
    })

    expect(secondSelection.answers['question-1']).toBe('a')
  })

  it('keeps navigation within the session bounds', () => {
    const initial = createQuizSession('exam', ['question-1', 'question-2'])
    const beforeStart = quizSessionReducer(initial, { type: 'previous' })
    const afterEnd = quizSessionReducer(
      quizSessionReducer(quizSessionReducer(initial, { type: 'next' }), { type: 'next' }),
      { type: 'next' },
    )

    expect(beforeStart.currentIndex).toBe(0)
    expect(afterEnd.currentIndex).toBe(1)
  })

  it('preserves the initialized answer order while navigating', () => {
    const answerOrders: AnswerOrderMap = { 'question-1': ['c', 'a', 'd', 'b'] }
    const initial = createQuizSession('exam', ['question-1'], answerOrders)
    const navigated = quizSessionReducer(initial, { type: 'next' })

    expect(navigated.answerOrders).toEqual(answerOrders)
  })
})
