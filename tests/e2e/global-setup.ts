import type { FullConfig } from '@playwright/test'
import { request } from '@playwright/test'

type EventTypePayload = {
  id: string
  name: string
  description: string
  duration_minutes: number
}

const adminApiUrl = 'http://localhost:3000'
const apiBaseUrl = 'http://localhost:3000'

const eventTypes: EventTypePayload[] = [
  {
    id: 'event-15',
    name: 'Встреча 15 минут',
    description: 'Короткая встреча для быстрого обсуждения',
    duration_minutes: 15,
  },
  {
    id: 'event-30',
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
      const response = await apiRequest.get('/api/admin/settings')
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

async function createEventType(payload: EventTypePayload) {
  const apiRequest = await request.newContext({ baseURL: adminApiUrl })
  const response = await apiRequest.post('/api/admin/event-types', {
    data: payload,
  })
  if (!response.ok()) {
    const message = await response.text()
    await apiRequest.dispose()
    throw new Error(`Failed to create admin event type: ${response.status()} ${message}`)
  }
  await apiRequest.dispose()
}

async function listAdminEventTypeIds() {
  const listContext = await request.newContext({ baseURL: apiBaseUrl })
  const listResponse = await listContext.get('/api/admin/event-types')
  const payload = await listResponse.json()
  await listContext.dispose()
  const ids = Array.isArray(payload.items) ? payload.items.map((item: { id: string }) => item.id) : []
  return new Set(ids)
}

export default async function globalSetup(_config: FullConfig) {
  await waitForAdminReady()

  const existingIds = await listAdminEventTypeIds()
  for (const eventType of eventTypes) {
    if (!existingIds.has(eventType.id) && !existingIds.has(eventType.duration_minutes.toString())) {
      await createEventType(eventType)
    }
  }

  const finalIds = await listAdminEventTypeIds()
  const missing = eventTypes
    .filter(
      (eventType) =>
        !finalIds.has(eventType.id) && !finalIds.has(eventType.duration_minutes.toString()),
    )
    .map((item) => item.id)
  if (missing.length > 0) {
    throw new Error(`Admin event types were not created by API setup: ${missing.join(', ')}`)
  }
}
