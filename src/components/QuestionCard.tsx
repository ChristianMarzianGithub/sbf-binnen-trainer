import { Icon } from './Icon'
import type { AnswerId, Question } from '../types/question'

interface QuestionCardProps {
  question: Question
  selectedAnswerId: AnswerId | null
  onSelectAnswer: (answerId: AnswerId) => void
  revealAnswer: boolean
  disabled?: boolean
  isBookmarked: boolean
  onToggleBookmark: () => void
}

export function QuestionCard({
  question,
  selectedAnswerId,
  onSelectAnswer,
  revealAnswer,
  disabled = false,
  isBookmarked,
  onToggleBookmark,
}: QuestionCardProps) {
  const isCorrect =
    revealAnswer && selectedAnswerId !== null && selectedAnswerId === question.correctAnswerId
  const feedbackId = `feedback-${question.id}`

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            Frage {question.officialNumber}
          </span>
          <span className="rounded-full bg-teal-50 px-2.5 py-1 capitalize text-teal-700">
            {question.section}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Aus Merkliste entfernen' : 'Frage zur Merkliste hinzufügen'}
          className={`grid size-10 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            isBookmarked
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white text-slate-400 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          <Icon name="bookmark" className="size-5" />
        </button>
      </div>

      <fieldset disabled={disabled} aria-describedby={revealAnswer ? feedbackId : undefined}>
        <legend className="text-lg font-bold leading-7 text-slate-950 sm:text-xl sm:leading-8">
          {question.prompt}
        </legend>

        {question.assets.length > 0 ? (
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {question.assets.map((asset) => (
              <img
                key={asset.src}
                src={asset.src}
                alt={asset.alt}
                className="min-w-24 max-h-64 max-w-full rounded-lg bg-white object-contain p-2 ring-1 ring-slate-200"
              />
            ))}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
        {question.answers.map((answer, answerIndex) => {
            const answerLabel = String.fromCharCode(65 + answerIndex)
            const isSelected = selectedAnswerId === answer.id
            const isCorrectAnswer = revealAnswer && answer.id === question.correctAnswerId
            const isSelectedWrong = revealAnswer && isSelected && !isCorrectAnswer
            const answerClass = isCorrectAnswer
              ? 'border-emerald-400 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-300'
              : isSelectedWrong
                ? 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300'
                : isSelected
                  ? 'border-teal-500 bg-teal-50 text-teal-950 ring-1 ring-teal-400'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/40'

            return (
              <label
                key={answer.id}
                className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm leading-6 transition focus-within:ring-2 focus-within:ring-teal-600 focus-within:ring-offset-2 sm:text-base ${answerClass} ${
                  disabled ? 'cursor-default' : ''
                }`}
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  value={answer.id}
                  checked={isSelected}
                  onChange={() => onSelectAnswer(answer.id)}
                  className="mt-1 size-4 shrink-0 accent-teal-700"
                />
                <span className="font-bold uppercase">{answerLabel}</span>
                <span>{answer.text}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {revealAnswer ? (
        <div
          id={feedbackId}
          role="status"
          aria-live="polite"
          className={`mt-5 rounded-xl border p-4 text-sm font-semibold ${
            isCorrect
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {isCorrect ? 'Richtig beantwortet.' : 'Leider nicht richtig. Die korrekte Antwort ist grün markiert.'}
        </div>
      ) : null}
    </article>
  )
}
