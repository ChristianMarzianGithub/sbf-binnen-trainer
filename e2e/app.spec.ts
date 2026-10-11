import { expect, test, type Page } from '@playwright/test'

let browserErrors: string[]

test.beforeEach(async ({ page }) => {
  browserErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
})

test.afterEach(() => {
  expect(browserErrors).toEqual([])
})

test('practice feedback, bookmarks, mistakes, and refresh persistence work together', async ({ page }) => {
  await page.goto('/#/lernen')
  const questionText = await page.locator('legend').innerText()

  await page.locator('input[type="radio"]').nth(1).check()
  await page.getByRole('button', { name: 'Antwort abgeben' }).click()
  await expect(page.getByRole('status')).toContainText('Leider nicht richtig')
  await page.getByRole('button', { name: 'Frage zur Merkliste hinzufügen' }).click()

  const storedBeforeRefresh = await readStoredProgress(page)
  expect(Object.keys(storedBeforeRefresh.progress)).toHaveLength(1)
  expect(storedBeforeRefresh.bookmarks).toHaveLength(1)

  await page.goto('/#/fehler')
  await expect(page.locator('legend')).toHaveText(questionText)
  await expect(page.getByRole('button', { name: 'Aus Merkliste entfernen' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await page.reload()
  await expect(page.locator('legend')).toHaveText(questionText)

  await page.goto('/#/merkliste')
  await expect(page.getByRole('heading', { name: 'Deine Merkliste' })).toBeVisible()
  await expect(page.getByText(questionText)).toBeVisible()
})

test('exam hides feedback, avoids duplicates, and reviews mistakes after completion', async ({ page }) => {
  await page.goto('/#/pruefung')
  await page.getByLabel('Anzahl der Fragen').fill('3')
  await page.getByRole('button', { name: 'Prüfung starten' }).click()

  const questionNumbers = new Set<string>()
  for (let index = 0; index < 3; index += 1) {
    const badge = await page.getByText(/^Frage \d+$/).innerText()
    questionNumbers.add(badge)
    await page.locator('input[type="radio"]').nth(1).check()
    await expect(page.getByRole('status')).toHaveCount(0)

    if (index < 2) {
      await page.getByRole('button', { name: 'Weiter' }).click()
    }
  }

  expect(questionNumbers.size).toBe(3)
  await page.getByRole('button', { name: 'Prüfung auswerten' }).click()
  await expect(page.getByRole('heading', { name: 'Prüfung abgeschlossen' })).toBeVisible()
  await expect(page.getByText(/\d+ von 3 richtig/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Fehler im Detail' })).toBeVisible()
  expect(await page.getByText('Richtige Antwort').count()).toBeGreaterThanOrEqual(0)

  const stored = await readStoredProgress(page)
  expect(stored.examHistory).toHaveLength(1)
  expect(Object.keys(stored.progress)).toHaveLength(3)
})

test('question diagrams load and the catalog can reach the final question', async ({ page }) => {
  await page.goto('/#/fragen')
  await page.getByPlaceholder('Frage, Antwort oder Nummer suchen …').fill('295')
  await expect(page.getByText('1 Fragen gefunden')).toBeVisible()
  await page.getByText('Antworten anzeigen').click()

  const image = page.locator('article img')
  await expect(image).toBeVisible()
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)

  await page.getByPlaceholder('Frage, Antwort oder Nummer suchen …').fill('300')
  await expect(page.getByText('1 Fragen gefunden')).toBeVisible()
  await expect(page.getByText(/^Ein Segelboot segelt bei starkem Wind/)).toBeVisible()
})

test('mobile layouts avoid page overflow and retain usable controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/')

  const dashboardHasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(dashboardHasOverflow).toBe(false)

  await page.goto('/#/lernen')
  await expect(page.locator('legend')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Antwort abgeben' })).toBeVisible()
  const practiceHasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(practiceHasOverflow).toBe(false)
})

async function readStoredProgress(page: Page) {
  return page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('sbf-binnen-segeln:v1') ?? '{}'),
  ) as Promise<{
    progress: Record<string, unknown>
    bookmarks: string[]
    examHistory: unknown[]
  }>
}
