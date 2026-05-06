import type { FullConfig } from '@playwright/test'
import { request, chromium, type Page } from '@playwright/test'

type EventTypePayload = {
  name: string
  description: string
  duration_minutes: number
}

const adminUrl = 'http://localhost:5173/admin/settings'
const apiBaseUrl = 'http://localhost:3000/api'

const eventTypes: EventTypePayload[] = [
  {
    name: 'Встреча 15 минут',
    description: 'Короткая встреча для быстрого обсуждения',
    duration_minutes: 15,
  },
  {
    name: 'Встреча 30 минут',
    description: 'Стандартная встреча для детального обсуждения',
    duration_minutes: 30,
  },
]

async function waitForAdminReady() {
  const apiRequest = await request.newContext({ baseURL: apiBaseUrl })
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    try {
      const response = await apiRequest.get('/admin/settings')
      if (response.ok()) {
        await apiRequest.dispose()
        return
      }
    } catch {
      // ignore and retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  await apiRequest.dispose()
  throw new Error('Admin settings API did not become ready in time')
}

async function createEventType(page: Page, payload: EventTypePayload) {
  const form = page
    .getByRole('heading', { name: 'Создание типа события' })
    .locator('..')
    .locator('form')
  await form.getByLabel('Имя').fill(payload.name)
  await form.getByLabel('Описание').fill(payload.description)
  await form.getByLabel('Длительность, мин').fill(String(payload.duration_minutes))
  await form.getByRole('button', { name: 'Создать тип события' }).click()
  await form.getByLabel('Имя').waitFor({ timeout: 10_000 })
}

export default async function globalSetup(_config: FullConfig) {
  await waitForAdminReady()

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Создание типа события' }).waitFor({ timeout: 20_000 })

  for (const eventType of eventTypes) {
    await createEventType(page, eventType)
    await page.waitForTimeout(1500)
  }

  await page.waitForTimeout(1000)

  const listResponse = await page.request.get(`${apiBaseUrl}/admin/event-types`)
  const payload = await listResponse.json()
  if (!Array.isArray(payload.items) || payload.items.length < eventTypes.length) {
    throw new Error(`Admin event types were not created by UI setup: ${JSON.stringify(payload)}`)
  }

  await browser.close()
}
