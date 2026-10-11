import { useReducer, useState } from 'react'
import { PageIntro } from '../components/PageIntro'
import { QuestionCard } from '../components/QuestionCard'
import { questionCatalog } from '../data/catalog'
import {
  createAnswerOrders,
  questionWithAnswerOrder,
  scoreAnswers,
  selectRandomQuestions,
} from '../quiz/quizEngine'
import { createQuizSession, quizSessionReducer } from '../quiz/quizReducer'
import { useProgress } from '../state/ProgressContext'
import type { AnswerId, Question } from '../types/question'

const questionById = new Map(questionCatalog.questions.map((question) => [question.id, question]))
const presetCounts = [10, 20, 30, 50]

export function ExamPage() {
  const { state: progressState, recordAttempts, recordExam, toggleBookmark } = useProgress()
  const [questionCount, setQuestionCount] = useState(progressState.settings.defaultExamCount)
  const [session, dispatch] = useReducer(
    quizSessionReducer,
    createQuizSession('exam', []),
  )
  const examQuestions = session.questionIds
    .map((questionId) => questionById.get(questionId))
    .filter((question): question is Question => Boolean(question))
    .map((question) => questionWithAnswerOrder(question, session.answerOrders[question.id]))
  const currentQuestion = examQuestions[session.currentIndex]

  function startExam() {
    const selectedQuestions = selectRandomQuestions(
      questionCatalog.questions,
      Math.max(1, Math.min(questionCatalog.questions.length, questionCount)),
    )
    dispatch({
      type: 'reset',
      mode: 'exam',
      questionIds: selectedQuestions.map((question) => question.id),
      answerOrders: createAnswerOrders(selectedQuestions),
    })
  }

  function finishExam() {
    const result = scoreAnswers(examQuestions, session.answers)
    if (result.unanswered > 0) {
      const confirmed = window.confirm(
        `${result.unanswered} Fragen sind unbeantwortet. Prüfung trotzdem auswerten?`,
      )
      if (!confirmed) return
    }

    recordAttempts(
      result.results.map((questionResult) => ({
        questionId: questionResult.questionId,
        isCorrect: questionResult.isCorrect,
      })),
    )
    recordExam({
      questionCount: result.total,
      correctCount: result.correct,
      percentage: result.percentage,
    })
    dispatch({ type: 'complete' })
  }

  if (examQuestions.length === 0) {
    return (
      <ExamConfiguration
        questionCount={questionCount}
        onQuestionCountChange={setQuestionCount}
        onStart={startExam}
      />
    )
  }

  if (session.status === 'completed') {
    return (
      <ExamResults
        questions={examQuestions}
        answers={session.answers}
        onRestart={() => dispatch({ type: 'reset', mode: 'exam', questionIds: [] })}
      />
    )
  }

  const answeredCount = Object.keys(session.answers).length
  const selectedAnswerId = session.answers[currentQuestion.id] ?? null

  return (
    <>
      <PageIntro
        eyebrow="Flexible Prüfungssimulation"
        title="Prüfung läuft"
        description="Antworten werden erst nach Abschluss ausgewertet. Dieses Format ist frei konfigurierbar und nicht als offiziell verifiziertes Prüfungsformat ausgewiesen."
      />
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-between gap-3 text-sm font-semibold text-slate-600">
          <span>Frage {session.currentIndex + 1} von {examQuestions.length}</span>
          <span>{answeredCount} beantwortet</span>
        </div>
        <div
          className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Fortschritt der Prüfung"
          aria-valuemin={1}
          aria-valuemax={examQuestions.length}
          aria-valuenow={session.currentIndex + 1}
        >
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${((session.currentIndex + 1) / examQuestions.length) * 100}%` }}
          />
        </div>

        <QuestionCard
          question={currentQuestion}
          selectedAnswerId={selectedAnswerId}
          onSelectAnswer={(answerId) =>
            dispatch({ type: 'select-answer', questionId: currentQuestion.id, answerId })
          }
          revealAnswer={false}
          isBookmarked={progressState.bookmarks.includes(currentQuestion.id)}
          onToggleBookmark={() => toggleBookmark(currentQuestion.id)}
        />

        <div className="mt-5 flex flex-col-reverse justify-between gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => dispatch({ type: 'previous' })}
            disabled={session.currentIndex === 0}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Zurück
          </button>
          {session.currentIndex === examQuestions.length - 1 ? (
            <button
              type="button"
              onClick={finishExam}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              Prüfung auswerten
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: 'next' })}
              className="rounded-xl bg-[#0b6672] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Weiter
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function ExamConfiguration({
  questionCount,
  onQuestionCountChange,
  onStart,
}: {
  questionCount: number
  onQuestionCountChange: (count: number) => void
  onStart: () => void
}) {
  return (
    <>
      <PageIntro
        eyebrow="Flexible Prüfungssimulation"
        title="Prüfung zusammenstellen"
        description="Wähle eine Fragenzahl. Die Auswahl erfolgt zufällig und ohne doppelte Fragen. Antworten werden erst am Ende aufgelöst."
      />
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Dies ist eine frei konfigurierbare Lernsimulation. Eine Übereinstimmung mit dem offiziellen Prüfungsformat wird nicht behauptet.
        </div>
        <label htmlFor="exam-question-count" className="mt-7 block text-sm font-bold text-slate-900">
          Anzahl der Fragen
        </label>
        <input
          id="exam-question-count"
          type="number"
          min="1"
          max={questionCatalog.questions.length}
          value={questionCount}
          onChange={(event) => onQuestionCountChange(Number(event.target.value))}
          onBlur={() =>
            onQuestionCountChange(
              Math.max(1, Math.min(questionCatalog.questions.length, questionCount)),
            )
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
        />
        <p className="mt-2 text-xs text-slate-500">
          Möglich sind 1 bis {questionCatalog.questions.length} Fragen.
        </p>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Vorgeschlagene Fragenzahlen">
          {presetCounts.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onQuestionCountChange(count)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                questionCount === count
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={!Number.isFinite(questionCount) || questionCount < 1}
          className="mt-8 w-full rounded-xl bg-[#0b6672] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          Prüfung starten
        </button>
      </section>
    </>
  )
}

function ExamResults({
  questions,
  answers,
  onRestart,
}: {
  questions: Question[]
  answers: Partial<Record<string, AnswerId>>
  onRestart: () => void
}) {
  const score = scoreAnswers(questions, answers)
  const mistakes = score.results.filter((result) => !result.isCorrect)

  return (
    <>
      <PageIntro
        eyebrow="Auswertung"
        title="Prüfung abgeschlossen"
        description="Das Ergebnis und alle Versuche wurden lokal gespeichert."
      />
      <section className="rounded-2xl bg-[#0b3c49] p-7 text-white shadow-sm sm:p-9">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="grid size-24 place-items-center rounded-full bg-white/10 text-3xl font-bold text-teal-300 ring-1 ring-white/10">
            {score.percentage}%
          </span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-300">Dein Ergebnis</p>
            <h2 className="mt-2 text-3xl font-bold">{score.correct} von {score.total} richtig</h2>
            <p className="mt-2 text-sm text-slate-300">
              {score.incorrect} falsch, davon {score.unanswered} unbeantwortet.
            </p>
          </div>
        </div>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300"
          >
            Neue Prüfung
          </button>
          <a href="#/" className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10">
            Zur Übersicht
          </a>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-slate-950">Fehler im Detail</h2>
        {mistakes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-800">
            Alle Fragen wurden richtig beantwortet.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {mistakes.map((result) => {
              const question = questions.find((candidate) => candidate.id === result.questionId)!
              const selectedAnswer = question.answers.find(
                (answer) => answer.id === result.selectedAnswerId,
              )
              const correctAnswer = question.answers.find(
                (answer) => answer.id === question.correctAnswerId,
              )

              return (
                <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Frage {question.officialNumber}
                  </p>
                  <h3 className="mt-2 font-bold leading-6 text-slate-950">{question.prompt}</h3>
                  {question.assets.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3">
                      {question.assets.map((asset) => (
                        <img
                          key={asset.src}
                          src={asset.src}
                          alt={asset.alt}
                          className="max-h-48 max-w-full rounded-lg object-contain"
                        />
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                      <span className="block text-xs font-bold uppercase tracking-wide text-rose-600">Deine Antwort</span>
                      <span className="mt-1 block">{selectedAnswer ? `${answerLabel(question, selectedAnswer.id)}. ${selectedAnswer.text}` : 'Nicht beantwortet'}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      <span className="block text-xs font-bold uppercase tracking-wide text-emerald-600">Richtige Antwort</span>
                      <span className="mt-1 block">{correctAnswer ? `${answerLabel(question, correctAnswer.id)}. ${correctAnswer.text}` : 'Keine verlässliche Lösung hinterlegt'}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

function answerLabel(question: Question, answerId: AnswerId): string {
  const index = question.answers.findIndex((answer) => answer.id === answerId)
  return index >= 0 ? String.fromCharCode(65 + index) : '?'
}
