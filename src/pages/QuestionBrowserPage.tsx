import { useMemo, useState } from 'react'
import { PageIntro } from '../components/PageIntro'
import { QuestionSummaryCard } from '../components/QuestionSummaryCard'
import { questionCatalog } from '../data/catalog'
import { useProgress } from '../state/ProgressContext'
import type { QuestionSection } from '../types/question'

type SectionFilter = 'all' | QuestionSection

export function QuestionBrowserPage() {
  const { state, toggleBookmark } = useProgress()
  const [search, setSearch] = useState('')
  const [section, setSection] = useState<SectionFilter>('all')
  const normalizedSearch = search.trim().toLocaleLowerCase('de')
  const searchedQuestionNumber = /^\d+$/.test(normalizedSearch)
    ? Number(normalizedSearch)
    : null
  const questions = useMemo(
    () =>
      questionCatalog.questions.filter((question) => {
        const matchesSection = section === 'all' || question.section === section
        const matchesSearch =
          !normalizedSearch ||
          (searchedQuestionNumber !== null
            ? question.officialNumber === searchedQuestionNumber
            : question.prompt.toLocaleLowerCase('de').includes(normalizedSearch) ||
              question.answers.some((answer) =>
                answer.text.toLocaleLowerCase('de').includes(normalizedSearch),
              ))
        return matchesSection && matchesSearch
      }),
    [normalizedSearch, searchedQuestionNumber, section],
  )

  return (
    <>
      <PageIntro
        eyebrow="Fragenkatalog"
        title="Alle Fragen"
        description="Durchsuche den vollständigen Katalog, prüfe Antwortmöglichkeiten und markiere schwierige Fragen."
      />
      <section className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px]">
        <label>
          <span className="sr-only">Fragen durchsuchen</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Frage, Antwort oder Nummer suchen …"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          />
        </label>
        <label>
          <span className="sr-only">Themenbereich filtern</span>
          <select
            value={section}
            onChange={(event) => setSection(event.target.value as SectionFilter)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">Alle Bereiche</option>
            <option value="basis">Basis</option>
            <option value="binnen">Binnen</option>
            <option value="segeln">Segeln</option>
          </select>
        </label>
      </section>
      <p className="mb-4 text-sm font-semibold text-slate-500">{questions.length} Fragen gefunden</p>
      <div className="space-y-4">
        {questions.map((question) => (
          <QuestionSummaryCard
            key={question.id}
            question={question}
            isBookmarked={state.bookmarks.includes(question.id)}
            onToggleBookmark={() => toggleBookmark(question.id)}
            latestResult={state.progress[question.id]?.lastAnswerCorrect}
          />
        ))}
      </div>
    </>
  )
}
