export const PROGRESS_STORAGE_KEY = 'sbf-binnen-segeln:v1'

export interface QuestionProgress {
  attempts: number
  correctAttempts: number
  lastAnsweredAt: string
  lastAnswerCorrect: boolean
}

export interface ExamHistoryEntry {
  id: string
  completedAt: string
  questionCount: number
  correctCount: number
  percentage: number
}

export interface StoredAppState {
  version: 1
  progress: Record<string, QuestionProgress>
  bookmarks: string[]
  examHistory: ExamHistoryEntry[]
  settings: {
    defaultPracticeCount: number
    defaultExamCount: number
  }
}

export interface AttemptInput {
  questionId: string
  isCorrect: boolean
  answeredAt?: string
}

export interface ProgressStats {
  practicedQuestions: number
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  latestMistakes: number
}

export function createDefaultAppState(): StoredAppState {
  return {
    version: 1,
    progress: {},
    bookmarks: [],
    examHistory: [],
    settings: {
      defaultPracticeCount: 20,
      defaultExamCount: 30,
    },
  }
}

export function loadAppState(storage: Pick<Storage, 'getItem'> = window.localStorage): StoredAppState {
  try {
    const rawValue = storage.getItem(PROGRESS_STORAGE_KEY)
    if (!rawValue) return createDefaultAppState()

    const parsed = JSON.parse(rawValue) as Partial<StoredAppState>
    if (parsed.version !== 1 || !isRecord(parsed.progress) || !Array.isArray(parsed.bookmarks)) {
      return createDefaultAppState()
    }

    const defaults = createDefaultAppState()
    const settings: Record<string, unknown> = isRecord(parsed.settings) ? parsed.settings : {}
    return {
      ...defaults,
      ...parsed,
      version: 1,
      progress: sanitizeProgress(parsed.progress),
      bookmarks: [...new Set(parsed.bookmarks.filter((value): value is string => typeof value === 'string'))],
      examHistory: sanitizeExamHistory(parsed.examHistory),
      settings: {
        defaultPracticeCount: validPositiveInteger(settings.defaultPracticeCount)
          ? settings.defaultPracticeCount
          : defaults.settings.defaultPracticeCount,
        defaultExamCount: validPositiveInteger(settings.defaultExamCount)
          ? settings.defaultExamCount
          : defaults.settings.defaultExamCount,
      },
    }
  } catch {
    return createDefaultAppState()
  }
}

export function saveAppState(
  state: StoredAppState,
  storage: Pick<Storage, 'setItem'> = window.localStorage,
) {
  storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state))
}

export function recordAttempts(
  state: StoredAppState,
  attempts: readonly AttemptInput[],
): StoredAppState {
  const nextProgress = { ...state.progress }

  for (const attempt of attempts) {
    const previous = nextProgress[attempt.questionId]
    nextProgress[attempt.questionId] = {
      attempts: (previous?.attempts ?? 0) + 1,
      correctAttempts: (previous?.correctAttempts ?? 0) + (attempt.isCorrect ? 1 : 0),
      lastAnsweredAt: attempt.answeredAt ?? new Date().toISOString(),
      lastAnswerCorrect: attempt.isCorrect,
    }
  }

  return { ...state, progress: nextProgress }
}

export function toggleBookmarkInState(state: StoredAppState, questionId: string): StoredAppState {
  const isBookmarked = state.bookmarks.includes(questionId)
  return {
    ...state,
    bookmarks: isBookmarked
      ? state.bookmarks.filter((id) => id !== questionId)
      : [...state.bookmarks, questionId],
  }
}

export function addExamResult(
  state: StoredAppState,
  result: Omit<ExamHistoryEntry, 'id' | 'completedAt'>,
): StoredAppState {
  const completedAt = new Date().toISOString()
  const entry: ExamHistoryEntry = {
    ...result,
    id: `exam-${completedAt}-${state.examHistory.length + 1}`,
    completedAt,
  }

  return { ...state, examHistory: [entry, ...state.examHistory].slice(0, 20) }
}

export function getProgressStats(state: StoredAppState): ProgressStats {
  const entries = Object.values(state.progress)
  const totalAttempts = entries.reduce((total, entry) => total + entry.attempts, 0)
  const correctAttempts = entries.reduce((total, entry) => total + entry.correctAttempts, 0)

  return {
    practicedQuestions: entries.length,
    totalAttempts,
    correctAttempts,
    accuracy: totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100),
    latestMistakes: entries.filter((entry) => !entry.lastAnswerCorrect).length,
  }
}

export function getLatestMistakeIds(state: StoredAppState): string[] {
  return Object.entries(state.progress)
    .filter(([, progress]) => !progress.lastAnswerCorrect)
    .map(([questionId]) => questionId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeProgress(value: Record<string, unknown>): Record<string, QuestionProgress> {
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, QuestionProgress] => {
      const progress = entry[1]
      return (
        isRecord(progress) &&
        validNonNegativeInteger(progress.attempts) &&
        validNonNegativeInteger(progress.correctAttempts) &&
        progress.correctAttempts <= progress.attempts &&
        typeof progress.lastAnsweredAt === 'string' &&
        typeof progress.lastAnswerCorrect === 'boolean'
      )
    }),
  )
}

function sanitizeExamHistory(value: unknown): ExamHistoryEntry[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is ExamHistoryEntry => {
    return (
      isRecord(entry) &&
      typeof entry.id === 'string' &&
      typeof entry.completedAt === 'string' &&
      validPositiveInteger(entry.questionCount) &&
      validNonNegativeInteger(entry.correctCount) &&
      entry.correctCount <= entry.questionCount &&
      typeof entry.percentage === 'number' &&
      entry.percentage >= 0 &&
      entry.percentage <= 100
    )
  })
}

function validPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0
}

function validNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0
}
