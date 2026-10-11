import type { ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { questionCatalog } from '../data/catalog'
import { useProgress } from '../state/ProgressContext'
import type { NavigationItem } from '../types/navigation'

interface AppShellProps {
  children: ReactNode
  currentPath: string
  navigation: NavigationItem[]
}

function Brand() {
  return (
    <a href="#/" className="group flex items-center gap-3" aria-label="Zur Übersicht">
      <span className="grid size-10 place-items-center rounded-xl bg-teal-400 text-slate-950 shadow-sm shadow-teal-950/20 transition-transform group-hover:-rotate-3">
        <Icon name="compass" className="size-6" />
      </span>
      <span>
        <span className="block text-sm font-bold tracking-wide text-white">BINNENKURS</span>
        <span className="block text-xs text-slate-400">SBF Segeln Theorie</span>
      </span>
    </a>
  )
}

function Navigation({ currentPath, navigation }: Pick<AppShellProps, 'currentPath' | 'navigation'>) {
  return (
    <nav aria-label="Hauptnavigation" className="space-y-1">
      {navigation.map((item) => {
        const isActive = currentPath === item.path

        return (
          <a
            key={item.path}
            href={`#${item.path}`}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/10'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon
              name={item.icon}
              className={`size-5 ${isActive ? 'text-teal-300' : 'text-slate-500 group-hover:text-slate-300'}`}
            />
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export function AppShell({ children, currentPath, navigation }: AppShellProps) {
  const { stats } = useProgress()
  const progressPercentage = Math.round(
    (stats.practicedQuestions / questionCatalog.catalog.questionCount) * 100,
  )

  return (
    <div className="app-background min-h-screen text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#092f3a] px-4 py-5 lg:flex">
        <div className="px-2 pb-8">
          <Brand />
        </div>
        <Navigation currentPath={currentPath} navigation={navigation} />
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
            <span>Fragen bearbeitet</span>
            <span>{stats.practicedQuestions} / {questionCatalog.catalog.questionCount}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
            role="progressbar"
            aria-label="Bearbeitete Fragen"
            aria-valuemin={0}
            aria-valuemax={questionCatalog.catalog.questionCount}
            aria-valuenow={stats.practicedQuestions}
          >
            <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${progressPercentage}%` }} />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Der offizielle Fragenkatalog ist vollständig geladen.
          </p>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#092f3a]/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <Brand />
      </header>

      <div className="border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <nav aria-label="Mobile Hauptnavigation" className="scrollbar-none flex overflow-x-auto px-3 py-2">
          {navigation.map((item) => {
            const isActive = currentPath === item.path

            return (
              <a
                key={item.path}
                href={`#${item.path}`}
                aria-current={isActive ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Icon name={item.icon} className="size-4" />
                {item.shortLabel}
              </a>
            )
          })}
        </nav>
      </div>

      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-12 sm:px-6 sm:py-9 sm:pb-14 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  )
}
