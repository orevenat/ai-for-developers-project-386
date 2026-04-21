import "@typespec/openapi";

using TypeSpec.OpenAPI;

namespace CalendarBooking;

@doc("Calendar owner profile.")
model Owner {
  @doc("Owner identifier.")
  id: string;

  @doc("Owner display name.")
  name: string;

  @doc("URL to owner avatar image.")
  avatar_url: string;

  @doc("Workday start time in HH:mm format.")
  workday_start: string;

  @doc("Workday end time in HH:mm format.")
  workday_end: string;
}

@doc("Event type configuration.")
model EventType {
  @doc("Event type identifier.")
  id: string;

  @doc("Event type name.")
  name: string;

  @doc("Event type description.")
  description: string;

  @doc("Event duration in minutes.")
  duration_minutes: int32;
}

@doc("Availability slot within the booking window.")
model Slot {
  @doc("Slot identifier.")
  id: int64;

  @doc("Related event type identifier.")
  event_type_id: string;

  @doc("Slot start time in ISO 8601 format.")
  @format("date-time")
  start: string;

  @doc("Slot end time in ISO 8601 format.")
  @format("date-time")
  end: string;

  @doc("Slot availability status.")
  status: SlotStatus;
}

enum SlotStatus {
  free,
  busy,
}

@doc("Booking created by a guest.")
model Booking {
  @doc("Booking identifier.")
  id: string;

  @doc("Related event type identifier.")
  event_type_id: string;

  @doc("Related slot identifier.")
  slot_id: int64;

  @doc("Guest name.")
  name: string;

  @doc("Guest email.")
  @format("email")
  email: string;

  @doc("Guest time zone in IANA format.")
  time_zone: string;

  @doc("Booking creation time in ISO 8601 format.")
  @format("date-time")
  created_at: string;
}
