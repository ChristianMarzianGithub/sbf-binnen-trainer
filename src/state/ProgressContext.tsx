import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  PROGRESS_STORAGE_KEY,
  addExamResult,
  createDefaultAppState,
  getLatestMistakeIds,
  getProgressStats,
  loadAppState,
  recordAttempts as recordAttemptsInState,
  saveAppState,
  toggleBookmarkInState,
  type AttemptInput,
  type ExamHistoryEntry,
  type ProgressStats,
  type StoredAppState,
} from '../storage/progressStorage'

interface ProgressContextValue {
  state: StoredAppState
  stats: ProgressStats
  mistakeQuestionIds: string[]
  recordAttempts: (attempts: readonly AttemptInput[]) => void
  recordExam: (result: Omit<ExamHistoryEntry, 'id' | 'completedAt'>) => void
  toggleBookmark: (questionId: string) => void
  resetProgress: () => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredAppState>(() => loadAppState())

  useEffect(() => {
    saveAppState(state)
  }, [state])

  const recordAttempts = useCallback((attempts: readonly AttemptInput[]) => {
    setState((current) => recordAttemptsInState(current, attempts))
  }, [])

  const recordExam = useCallback(
    (result: Omit<ExamHistoryEntry, 'id' | 'completedAt'>) => {
      setState((current) => addExamResult(current, result))
    },
    [],
  )

  const toggleBookmark = useCallback((questionId: string) => {
    setState((current) => toggleBookmarkInState(current, questionId))
  }, [])

  const resetProgress = useCallback(() => {
    window.localStorage.removeItem(PROGRESS_STORAGE_KEY)
    setState(createDefaultAppState())
  }, [])

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      stats: getProgressStats(state),
      mistakeQuestionIds: getLatestMistakeIds(state),
      recordAttempts,
      recordExam,
      toggleBookmark,
      resetProgress,
    }),
    [recordAttempts, recordExam, resetProgress, state, toggleBookmark],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider.')
  }
  return context
}
