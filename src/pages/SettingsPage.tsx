import { useState } from 'react'
import { PageIntro } from '../components/PageIntro'
import { useProgress } from '../state/ProgressContext'

export function SettingsPage() {
  const { state, stats, resetProgress } = useProgress()
  const [resetComplete, setResetComplete] = useState(false)

  function handleReset() {
    const confirmed = window.confirm(
      'Möchtest du Antworten, Prüfungen und Merkliste auf diesem Gerät wirklich vollständig löschen?',
    )
    if (!confirmed) return
    resetProgress()
    setResetComplete(true)
  }

  return (
    <>
      <PageIntro
        eyebrow="Lokale Daten"
        title="Einstellungen"
        description="Deine Antworten, Prüfungen und Lesezeichen werden ausschließlich im Browser auf diesem Gerät gespeichert."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Gespeicherter Lernstand</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Bearbeitete Fragen</dt>
              <dd className="font-bold text-slate-900">{stats.practicedQuestions}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Gesamte Versuche</dt>
              <dd className="font-bold text-slate-900">{stats.totalAttempts}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
              <dt className="text-slate-500">Prüfungen</dt>
              <dd className="font-bold text-slate-900">{state.examHistory.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Merkliste</dt>
              <dd className="font-bold text-slate-900">{state.bookmarks.length}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6">
          <h2 className="text-lg font-bold text-rose-950">Lernfortschritt zurücksetzen</h2>
          <p className="mt-3 text-sm leading-6 text-rose-800">
            Löscht alle Antworten, Statistiken, Prüfungsergebnisse und Lesezeichen aus dem lokalen Browser-Speicher. Der Fragenkatalog bleibt erhalten.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-6 rounded-xl border border-rose-300 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          >
            Fortschritt vollständig löschen
          </button>
          {resetComplete ? (
            <p role="status" className="mt-4 text-sm font-semibold text-rose-800">
              Der lokale Lernfortschritt wurde gelöscht.
            </p>
          ) : null}
        </section>
      </div>
    </>
  )
}
