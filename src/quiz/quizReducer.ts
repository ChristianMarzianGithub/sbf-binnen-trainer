import type { AnswerId } from '../types/question'
import type { AnswerMap, AnswerOrderMap } from './quizEngine'

export type QuizMode = 'practice' | 'mistakes' | 'exam'
export type QuizStatus = 'active' | 'completed'

export interface QuizSessionState {
  mode: QuizMode
  questionIds: string[]
  answerOrders: AnswerOrderMap
  currentIndex: number
  answers: AnswerMap
  submittedQuestionIds: Record<string, true>
  status: QuizStatus
}

export type QuizSessionAction =
  | { type: 'select-answer'; questionId: string; answerId: AnswerId }
  | { type: 'submit-current' }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'complete' }
  | { type: 'reset'; mode: QuizMode; questionIds: string[]; answerOrders?: AnswerOrderMap }

export function createQuizSession(
  mode: QuizMode,
  questionIds: string[],
  answerOrders: AnswerOrderMap = {},
): QuizSessionState {
  return {
    mode,
    questionIds,
    answerOrders,
    currentIndex: 0,
    answers: {},
    submittedQuestionIds: {},
    status: 'active',
  }
}

export function quizSessionReducer(
  state: QuizSessionState,
  action: QuizSessionAction,
): QuizSessionState {
  switch (action.type) {
    case 'select-answer':
      if (state.status !== 'active' || state.submittedQuestionIds[action.questionId]) {
        return state
      }
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answerId },
      }
    case 'submit-current': {
      const currentQuestionId = state.questionIds[state.currentIndex]
      if (!currentQuestionId || !state.answers[currentQuestionId]) {
        return state
      }
      return {
        ...state,
        submittedQuestionIds: {
          ...state.submittedQuestionIds,
          [currentQuestionId]: true,
        },
      }
    }
    case 'next':
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, Math.max(0, state.questionIds.length - 1)),
      }
    case 'previous':
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) }
    case 'complete':
      return { ...state, status: 'completed' }
    case 'reset':
      return createQuizSession(action.mode, action.questionIds, action.answerOrders)
  }
}
