import { describe, expect, it } from 'vitest'
import {
  PROGRESS_STORAGE_KEY,
  createDefaultAppState,
  getLatestMistakeIds,
  getProgressStats,
  loadAppState,
  recordAttempts,
  saveAppState,
  toggleBookmarkInState,
} from './progressStorage'

describe('progress storage', () => {
  it('round-trips progress and bookmarks through storage', () => {
    const storage = createMemoryStorage()
    const progressed = recordAttempts(createDefaultAppState(), [
      { questionId: 'basis-001', isCorrect: false, answeredAt: '2026-01-01T12:00:00.000Z' },
      { questionId: 'basis-002', isCorrect: true, answeredAt: '2026-01-01T12:01:00.000Z' },
    ])
    const bookmarked = toggleBookmarkInState(progressed, 'basis-001')

    saveAppState(bookmarked, storage)
    const restored = loadAppState(storage)

    expect(restored).toEqual(bookmarked)
    expect(getLatestMistakeIds(restored)).toEqual(['basis-001'])
    expect(getProgressStats(restored)).toMatchObject({
      practicedQuestions: 2,
      totalAttempts: 2,
      correctAttempts: 1,
      accuracy: 50,
      latestMistakes: 1,
    })
  })

  it('uses defaults when stored JSON is malformed', () => {
    const storage = createMemoryStorage()
    storage.setItem(PROGRESS_STORAGE_KEY, '{invalid')

    expect(loadAppState(storage)).toEqual(createDefaultAppState())
  })

  it('drops malformed nested records while retaining valid stored data', () => {
    const storage = createMemoryStorage()
    storage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        progress: {
          valid: {
            attempts: 2,
            correctAttempts: 1,
            lastAnsweredAt: '2026-01-01T12:00:00.000Z',
            lastAnswerCorrect: false,
          },
          invalid: { attempts: 'many' },
        },
        bookmarks: ['valid', 'valid', 42],
        examHistory: [{ id: 'broken' }],
        settings: { defaultExamCount: -5 },
      }),
    )

    const restored = loadAppState(storage)
    expect(Object.keys(restored.progress)).toEqual(['valid'])
    expect(restored.bookmarks).toEqual(['valid'])
    expect(restored.examHistory).toEqual([])
    expect(restored.settings.defaultExamCount).toBe(30)
  })

  it('tracks the latest result independently from lifetime accuracy', () => {
    const firstAttempt = recordAttempts(createDefaultAppState(), [
      { questionId: 'basis-001', isCorrect: false },
    ])
    const secondAttempt = recordAttempts(firstAttempt, [
      { questionId: 'basis-001', isCorrect: true },
    ])

    expect(secondAttempt.progress['basis-001']).toMatchObject({
      attempts: 2,
      correctAttempts: 1,
      lastAnswerCorrect: true,
    })
    expect(getLatestMistakeIds(secondAttempt)).toEqual([])
  })
})

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}
