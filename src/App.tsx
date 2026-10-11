import { AppShell } from './layouts/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { BookmarksPage } from './pages/BookmarksPage'
import { ExamPage } from './pages/ExamPage'
import { PracticePage } from './pages/PracticePage'
import { QuestionBrowserPage } from './pages/QuestionBrowserPage'
import { SettingsPage } from './pages/SettingsPage'
import { useHashRoute } from './hooks/useHashRoute'
import type { NavigationItem } from './types/navigation'

const navigation: NavigationItem[] = [
  { path: '/', label: 'Übersicht', shortLabel: 'Übersicht', icon: 'dashboard' },
  { path: '/fragen', label: 'Alle Fragen', shortLabel: 'Fragen', icon: 'questions' },
  { path: '/lernen', label: 'Freies Üben', shortLabel: 'Üben', icon: 'practice' },
  { path: '/pruefung', label: 'Prüfung', shortLabel: 'Prüfung', icon: 'exam' },
  { path: '/fehler', label: 'Fehler wiederholen', shortLabel: 'Fehler', icon: 'review' },
  { path: '/merkliste', label: 'Merkliste', shortLabel: 'Merkliste', icon: 'bookmark' },
  { path: '/einstellungen', label: 'Einstellungen', shortLabel: 'Optionen', icon: 'settings' },
]

const pages = {
  '/fragen': <QuestionBrowserPage />,
  '/lernen': <PracticePage key="practice" />,
  '/pruefung': <ExamPage />,
  '/fehler': <PracticePage key="mistakes" mode="mistakes" />,
  '/merkliste': <BookmarksPage />,
  '/einstellungen': <SettingsPage />,
}

function App() {
  const requestedPath = useHashRoute()
  const currentPath = requestedPath === '/' || requestedPath in pages ? requestedPath : '/'
  const page = currentPath === '/' ? <DashboardPage /> : pages[currentPath as keyof typeof pages]

  return (
    <AppShell currentPath={currentPath} navigation={navigation}>
      {page}
    </AppShell>
  )
}

export default App
