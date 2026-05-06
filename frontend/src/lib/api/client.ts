import type {
  AdminSettings,
  ApiError,
  AdminBooking,
  AdminBookingListResult,
  Booking,
  EventType,
  EventTypeListResult,
  SlotListResult,
} from './types'

const DEFAULT_BASE_URL = '/api'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
const baseUrl = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.replace(/\/$/, '')
  : `${rawBaseUrl.replace(/\/$/, '')}/api`

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return parseJson<T>(response)
  }

  const body = await parseJson<ApiError['body']>(response).catch(() => ({
    code: 'unknown_error',
    message: 'Не удалось обработать ответ сервера.',
  }))

  throw { status: response.status, body } satisfies ApiError
}

function normalizeUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== 'string') return input
  if (input.startsWith('http://') || input.startsWith('https://')) return input
  if (input.startsWith('/')) return `/api${input}`
  return `/api/${input}`
}

async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(normalizeUrl(input), init)
  } catch {
    return new Response(
      JSON.stringify({
        code: 'network_error',
        message: 'Не удалось подключиться к серверу API.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )
  }
}

export async function listEventTypes(): Promise<EventTypeListResult> {
  const response = await safeFetch(`${baseUrl}/event-types`)
  return handleResponse<EventTypeListResult>(response)
}

export async function getEventType(eventTypeId: string): Promise<EventType> {
  const response = await safeFetch(`${baseUrl}/event-types/${eventTypeId}`)
  return handleResponse<EventType>(response)
}

export async function listSlots(
  eventTypeId: string,
  from?: string,
  to?: string,
): Promise<SlotListResult> {
  const params = new URLSearchParams({ event_type_id: eventTypeId })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const response = await safeFetch(`${baseUrl}/slots?${params.toString()}`)
  return handleResponse<SlotListResult>(response)
}

export async function createBooking(input: {
  event_type_id: string
  slot_id: string
  name: string
  email: string
}): Promise<Booking> {
  const response = await safeFetch(`${baseUrl}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Booking>(response)
}

export async function listUpcomingBookings(): Promise<AdminBookingListResult> {
  const response = await safeFetch(`${baseUrl}/admin/bookings/upcoming`)
  return handleResponse<AdminBookingListResult>(response)
}

export async function cancelAdminBooking(bookingId: string): Promise<AdminBooking> {
  const response = await safeFetch(`${baseUrl}/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
  })
  return handleResponse<AdminBooking>(response)
}

export async function listAdminSchedule(from?: string, to?: string): Promise<SlotListResult> {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  const response = await safeFetch(`${baseUrl}/admin/schedule${query ? `?${query}` : ''}`)
  return handleResponse<SlotListResult>(response)
}

export async function getSettings(): Promise<AdminSettings> {
  const response = await safeFetch(`${baseUrl}/admin/settings`)
  return handleResponse<AdminSettings>(response)
}

export async function updateSettings(input: {
  name: string
  avatar_url: string
  workday_start: string
  workday_end: string
}): Promise<AdminSettings> {
  const response = await safeFetch(`${baseUrl}/admin/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<AdminSettings>(response)
}

export async function createEventType(input: {
  name: string
  description: string
  duration_minutes: number
}): Promise<EventType> {
  const response = await safeFetch(`${baseUrl}/admin/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<EventType>(response)
}

export async function listAdminEventTypes(): Promise<EventTypeListResult> {
  const response = await safeFetch(`${baseUrl}/admin/event-types`)
  return handleResponse<EventTypeListResult>(response)
}

export function getApiBaseUrl(): string {
  return baseUrl
}
