import { Icon } from '../components/Icon'
import { PageIntro } from '../components/PageIntro'
import { QuestionSummaryCard } from '../components/QuestionSummaryCard'
import { questionCatalog } from '../data/catalog'
import { useProgress } from '../state/ProgressContext'

export function BookmarksPage() {
  const { state, toggleBookmark } = useProgress()
  const questions = questionCatalog.questions.filter((question) =>
    state.bookmarks.includes(question.id),
  )

  return (
    <>
      <PageIntro
        eyebrow="Persönliche Auswahl"
        title="Deine Merkliste"
        description="Alle Fragen, die du für später markiert hast, bleiben lokal auf diesem Gerät gespeichert."
      />
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Icon name="bookmark" className="size-7" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-slate-950">Noch nichts vorgemerkt</h2>
          <p className="mt-2 text-sm text-slate-500">Markiere Fragen beim Üben, in Prüfungen oder im Katalog.</p>
          <a href="#/fragen" className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-900">
            Fragen durchsuchen
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <QuestionSummaryCard
              key={question.id}
              question={question}
              isBookmarked
              onToggleBookmark={() => toggleBookmark(question.id)}
              latestResult={state.progress[question.id]?.lastAnswerCorrect}
            />
          ))}
        </div>
      )}
    </>
  )
}
