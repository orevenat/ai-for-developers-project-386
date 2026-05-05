export type EventType = {
  id: string
  name: string
  description: string
  duration_minutes: number
}

export type SlotStatus = 'free' | 'busy'

export type Slot = {
  id: number
  event_type_id: string
  start: string
  end: string
  status: SlotStatus
}

export type Booking = {
  id: string
  event_type_id: string
  slot_id: number
  name: string
  email: string
  created_at: string
}

export type Owner = {
  id: string
  name: string
  avatar_url: string
  workday_start: string
  workday_end: string
}

export type AdminSettings = {
  owner: Owner
  booking_window_days: number
}

export type ErrorResponse = {
  code: string
  message: string
}

export type ApiError = {
  status: number
  body: ErrorResponse
}

export type EventTypeListResult = {
  items: EventType[]
}

export type SlotListResult = {
  items: Slot[]
}

export type BookingListResult = {
  items: Booking[]
}
