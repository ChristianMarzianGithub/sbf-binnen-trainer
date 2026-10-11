import { Icon } from '../components/Icon'
import { PageIntro } from '../components/PageIntro'
import { questionCatalog } from '../data/catalog'
import { useProgress } from '../state/ProgressContext'

const questionCount = questionCatalog.catalog.questionCount

const quickActions = [
  {
    path: '/lernen',
    icon: 'practice' as const,
    title: 'Freies Üben',
    description: 'Zufällige Fragen mit direktem Feedback bearbeiten.',
    accent: 'bg-teal-50 text-teal-700',
  },
  {
    path: '/pruefung',
    icon: 'exam' as const,
    title: 'Prüfung starten',
    description: 'Eine flexible Lernprüfung mit eigener Fragenzahl simulieren.',
    accent: 'bg-amber-50 text-amber-700',
  },
  {
    path: '/fehler',
    icon: 'review' as const,
    title: 'Fehler wiederholen',
    description: 'Gezielt die Fragen trainieren, die noch nicht sitzen.',
    accent: 'bg-rose-50 text-rose-700',
  },
]

export function DashboardPage() {
  const { state, stats: progressStats } = useProgress()
  const stats = [
    { label: 'Bearbeitet', value: String(progressStats.practicedQuestions), detail: `von ${questionCount} Fragen` },
    {
      label: 'Trefferquote',
      value: progressStats.totalAttempts > 0 ? `${progressStats.accuracy}%` : '–',
      detail: `${progressStats.totalAttempts} beantwortete Fragen`,
    },
    { label: 'Prüfungen', value: String(state.examHistory.length), detail: 'abgeschlossene Tests' },
    { label: 'Gemerkte Fragen', value: String(state.bookmarks.length), detail: 'für später markiert' },
  ]
  return (
    <>
      <PageIntro
        eyebrow="Dein Lernstand"
        title="Moin, bereit zum Ablegen?"
        description="Trainiere Schritt für Schritt für die SBF-Binnen-Theorieprüfung unter Segel. Dein Fortschritt bleibt lokal auf diesem Gerät."
        action={
          <a
            href="#/lernen"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b6672] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#084f59] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Jetzt üben
            <Icon name="arrow" className="size-4" />
          </a>
        }
      />

      <section aria-label="Fortschritt" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Schnellstart</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Wie möchtest du lernen?</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {quickActions.map((action) => (
              <a
                key={action.path}
                href={`#${action.path}`}
                className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <span className={`grid size-10 place-items-center rounded-xl ${action.accent}`}>
                  <Icon name={action.icon} className="size-5" />
                </span>
                <h3 className="mt-5 flex items-center justify-between font-bold text-slate-900">
                  {action.title}
                  <Icon name="arrow" className="size-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-teal-600" />
                </h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">{action.description}</p>
              </a>
            ))}
          </div>
        </div>

        <aside className="self-start overflow-hidden rounded-2xl bg-[#0b3c49] p-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Katalogstatus</p>
              <h2 className="mt-2 text-xl font-bold">Fragenkatalog ist bereit</h2>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/10 text-teal-300">
              <Icon name="questions" className="size-5" />
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Alle {questionCount} offiziellen Fragen und zugehörigen Abbildungen sind lokal verfügbar und strukturell validiert.
          </p>
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Importiert</span>
              <span className="font-semibold">{questionCount} von {questionCount}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full bg-teal-400" />
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {progressStats.totalAttempts > 0 ? 'Dein Lernstand wird laufend gespeichert' : 'Deine Lernaktivität erscheint hier'}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {progressStats.totalAttempts > 0
                ? `${progressStats.latestMistakes} Fragen sind aktuell für die Fehlerwiederholung vorgemerkt.`
                : 'Nach den ersten Antworten siehst du Verlauf und Verbesserungen.'}
            </p>
          </div>
          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
            {progressStats.totalAttempts > 0 ? `${progressStats.totalAttempts} Versuche` : 'Noch keine Aktivität'}
          </span>
        </div>
      </section>
    </>
  )
}
