import { Icon } from './Icon'
import type { Question } from '../types/question'

interface QuestionSummaryCardProps {
  question: Question
  isBookmarked: boolean
  onToggleBookmark: () => void
  latestResult?: boolean
}

export function QuestionSummaryCard({
  question,
  isBookmarked,
  onToggleBookmark,
  latestResult,
}: QuestionSummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              Frage {question.officialNumber}
            </span>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 capitalize text-teal-700">
              {question.section}
            </span>
            {latestResult !== undefined ? (
              <span className={`rounded-full px-2.5 py-1 ${latestResult ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                Zuletzt {latestResult ? 'richtig' : 'falsch'}
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 font-bold leading-6 text-slate-950">{question.prompt}</h2>
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? 'Aus Merkliste entfernen' : 'Frage zur Merkliste hinzufügen'}
          className={`grid size-10 shrink-0 place-items-center rounded-xl border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
            isBookmarked
              ? 'border-amber-300 bg-amber-50 text-amber-700'
              : 'border-slate-200 text-slate-400 hover:border-amber-300 hover:text-amber-600'
          }`}
        >
          <Icon name="bookmark" className="size-5" />
        </button>
      </div>

      <details className="mt-4 border-t border-slate-100 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
          Antworten anzeigen
        </summary>
        {question.assets.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {question.assets.map((asset) => (
              <img key={asset.src} src={asset.src} alt={asset.alt} className="min-w-24 max-h-48 max-w-full rounded-lg bg-white object-contain p-2 ring-1 ring-slate-200" />
            ))}
          </div>
        ) : null}
        <ol className="mt-4 space-y-2">
          {question.answers.map((answer) => (
            <li
              key={answer.id}
              className={`rounded-lg border p-3 text-sm leading-5 ${
                answer.id === question.correctAnswerId
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 text-slate-600'
              }`}
            >
              <span className="mr-2 font-bold uppercase">{answer.id}.</span>
              {answer.text}
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}
