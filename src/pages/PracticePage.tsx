import { useMemo, useReducer } from 'react'
import { Icon } from '../components/Icon'
import { PageIntro } from '../components/PageIntro'
import { QuestionCard } from '../components/QuestionCard'
import { questionCatalog } from '../data/catalog'
import {
  createAnswerOrders,
  questionWithAnswerOrder,
  scoreAnswers,
  selectRandomQuestions,
} from '../quiz/quizEngine'
import { createQuizSession, quizSessionReducer, type QuizMode } from '../quiz/quizReducer'
import { useProgress } from '../state/ProgressContext'
import type { Question } from '../types/question'

interface PracticePageProps {
  mode?: Extract<QuizMode, 'practice' | 'mistakes'>
}

const questionById = new Map(questionCatalog.questions.map((question) => [question.id, question]))

export function PracticePage({ mode = 'practice' }: PracticePageProps) {
  const { state: progressState, mistakeQuestionIds, recordAttempts, toggleBookmark } = useProgress()
  const sourceQuestions = useMemo(
    () =>
      mode === 'mistakes'
        ? mistakeQuestionIds
            .map((questionId) => questionById.get(questionId))
            .filter((question): question is Question => Boolean(question))
        : questionCatalog.questions,
    [mistakeQuestionIds, mode],
  )
  const [session, dispatch] = useReducer(
    quizSessionReducer,
    sourceQuestions,
    (questions) => {
      const selectedQuestions = selectRandomQuestions(questions, questions.length)
      return createQuizSession(
        mode,
        selectedQuestions.map((question) => question.id),
        createAnswerOrders(selectedQuestions),
      )
    },
  )
  const sessionQuestions = session.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is Question => Boolean(question))
    .map((question) => questionWithAnswerOrder(question, session.answerOrders[question.id]))
  const currentQuestion = sessionQuestions[session.currentIndex]
  const selectedAnswerId = currentQuestion ? (session.answers[currentQuestion.id] ?? null) : null
  const hasSubmitted = currentQuestion
    ? Boolean(session.submittedQuestionIds[currentQuestion.id])
    : false
  const submittedQuestions = sessionQuestions.filter(
    (question) => session.submittedQuestionIds[question.id],
  )
  const liveScore = scoreAnswers(submittedQuestions, session.answers)

  function submitAnswer() {
    if (!currentQuestion || selectedAnswerId === null || hasSubmitted) return
    dispatch({ type: 'submit-current' })
    recordAttempts([
      {
        questionId: currentQuestion.id,
        isCorrect: selectedAnswerId === currentQuestion.correctAnswerId,
      },
    ])
  }

  function goNext() {
    if (session.currentIndex === sessionQuestions.length - 1) {
      dispatch({ type: 'complete' })
    } else {
      dispatch({ type: 'next' })
    }
  }

  function restart() {
    const availableQuestions =
      mode === 'mistakes'
        ? mistakeQuestionIds
            .map((questionId) => questionById.get(questionId))
            .filter((question): question is Question => Boolean(question))
        : questionCatalog.questions
    dispatch({
      type: 'reset',
      mode,
      questionIds: selectRandomQuestions(availableQuestions, availableQuestions.length).map(
        (question) => question.id,
      ),
      answerOrders: createAnswerOrders(availableQuestions),
    })
  }

  if (sessionQuestions.length === 0) {
    return (
      <EmptyPracticeState
        mode={mode}
        message={
          mode === 'mistakes'
            ? 'Aktuell gibt es keine zuletzt falsch beantworteten Fragen.'
            : 'Für diesen Lernmodus sind keine Fragen verfügbar.'
        }
      />
    )
  }

  if (session.status === 'completed') {
    return (
      <>
        <PageIntro
          eyebrow={mode === 'mistakes' ? 'Fehlerrunde beendet' : 'Übungsrunde beendet'}
          title="Runde abgeschlossen"
          description="Deine Antworten wurden lokal gespeichert und fließen direkt in den Lernstand ein."
        />
        <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-50 text-2xl font-bold text-teal-700">
            {liveScore.percentage}%
          </span>
          <h2 className="mt-5 text-2xl font-bold text-slate-950">
            {liveScore.correct} von {liveScore.total} richtig
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {liveScore.incorrect} Antworten waren falsch und können gezielt wiederholt werden.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={restart}
              className="rounded-xl bg-[#0b6672] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Neue Runde
            </button>
            <a
              href="#/"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Zur Übersicht
            </a>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageIntro
        eyebrow={mode === 'mistakes' ? 'Gezielte Wiederholung' : 'Freies Üben'}
        title={mode === 'mistakes' ? 'Fehler wiederholen' : 'Frage für Frage sicherer werden'}
        description={
          mode === 'mistakes'
            ? 'Diese Runde enthält Fragen, deren letzter gespeicherter Versuch falsch war.'
            : 'Die Fragen erscheinen in zufälliger Reihenfolge. Nach jeder Abgabe erhältst du direkt Feedback.'
        }
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-slate-600">
            Frage {session.currentIndex + 1} von {sessionQuestions.length}
          </span>
          <div className="flex gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
              {liveScore.correct} richtig
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-1 font-semibold text-rose-700">
              {liveScore.incorrect} falsch
            </span>
          </div>
        </div>
        <div
          className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Fortschritt der Übungsrunde"
          aria-valuemin={1}
          aria-valuemax={sessionQuestions.length}
          aria-valuenow={session.currentIndex + 1}
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-all"
            style={{ width: `${((session.currentIndex + 1) / sessionQuestions.length) * 100}%` }}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswerId={selectedAnswerId}
          onSelectAnswer={(answerId) =>
            dispatch({ type: 'select-answer', questionId: currentQuestion.id, answerId })
          }
          revealAnswer={hasSubmitted}
          disabled={hasSubmitted}
          isBookmarked={progressState.bookmarks.includes(currentQuestion.id)}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
        />

        <div className="mt-5 flex justify-end">
          {!hasSubmitted ? (
            <button
              type="button"
              onClick={submitAnswer}
              disabled={selectedAnswerId === null}
              className="rounded-xl bg-[#0b6672] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              Antwort abgeben
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b6672] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              {session.currentIndex === sessionQuestions.length - 1 ? 'Runde abschließen' : 'Nächste Frage'}
              <Icon name="arrow" className="size-4" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function EmptyPracticeState({ mode, message }: { mode: PracticePageProps['mode']; message: string }) {
  return (
    <>
      <PageIntro
        eyebrow={mode === 'mistakes' ? 'Gezielte Wiederholung' : 'Freies Üben'}
        title={mode === 'mistakes' ? 'Keine offenen Fehler' : 'Keine Fragen verfügbar'}
        description={message}
      />
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon name="practice" className="size-7" />
        </span>
        <p className="mt-4 font-semibold text-slate-800">
          {mode === 'mistakes' ? 'Stark – aktuell ist nichts nachzuarbeiten.' : message}
        </p>
        <a href="#/lernen" className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900">
          Frei üben
        </a>
      </div>
    </>
  )
}
