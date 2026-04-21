import "@typespec/http";
import "@typespec/openapi";
import "./models.tsp";
import "./params.tsp";
import "./errors.tsp";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CalendarBooking;

@doc("Admin operations for the calendar owner.")
@route("/admin")
interface AdminApi {
  @doc("Create a new event type.")
  @post
  @route("/event-types")
  createEventType(@body input: EventTypeCreate): EventType | BadRequestError;

  @doc("List all event types.")
  @get
  @route("/event-types")
  listEventTypes(): EventTypeListResult;

  @doc("Get an event type by identifier.")
  @get
  @route("/event-types/{event_type_id}")
  getEventType(@path event_type_id: EventTypeIdParam): EventType | NotFoundError;

  @doc("List upcoming bookings for all event types.")
  @get
  @route("/bookings/upcoming")
  listUpcomingBookings(): BookingListResult;

  @doc("Get schedule with free and busy slots for the next 14 days. If from/to are omitted, the window starts at current date.")
  @get
  @route("/schedule")
  getSchedule(@query from?: FromDateTime, @query to?: ToDateTime): SlotListResult;

  @doc("Get admin settings including owner profile and workday settings.")
  @get
  @route("/settings")
  getSettings(): AdminSettings;
}

@doc("Guest booking operations.")
interface GuestApi {
  @doc("List available event types.")
  @get
  @route("/event-types")
  listEventTypes(): EventTypeListResult;

  @doc("Get an event type by identifier.")
  @get
  @route("/event-types/{event_type_id}")
  getEventType(@path event_type_id: EventTypeIdParam): EventType | NotFoundError;

  @doc("Get slots with free/busy status within the 14-day booking window. If from/to are omitted, the window starts at current date.")
  @get
  @route("/slots")
  listSlots(
    @query event_type_id: EventTypeIdParam,
    @query from?: FromDateTime,
    @query to?: ToDateTime
  ): SlotListResult | BadRequestError;

  @doc("Create a booking for the selected slot. Slot must be free and within the 14-day window. Slot time cannot overlap any existing booking across all event types.")
  @post
  @route("/bookings")
  createBooking(@body input: BookingCreate): Booking | BadRequestError | ConflictError | OutOfWindowError | NotFoundError;
}

model EventTypeCreate {
  name: string;
  description: string;
  duration_minutes: int32;
}

model BookingCreate {
  event_type_id: string;
  slot_id: int64;
  name: string;
  @format("email")
  email: string;
  @doc("Guest time zone in IANA format.")
  time_zone: string;
}

model EventTypeListResult {
  items: EventType[];
}

model BookingListResult {
  items: Booking[];
}

model SlotListResult {
  items: Slot[];
}

model AdminSettings {
  owner: Owner;
  @doc("Default booking window size in days. Fixed to 14.")
  booking_window_days: int32;
}
