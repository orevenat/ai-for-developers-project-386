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

  @doc("Update admin settings including owner profile and workday settings.")
  @patch
  @route("/settings")
  updateSettings(@body input: AdminSettingsUpdate): AdminSettings | BadRequestError;
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
}

@example(#{
  items: #[
    #{
      id: "event-15",
      name: "Встреча 15 минут",
      description: "Короткая встреча для быстрого обсуждения",
      duration_minutes: 15
    },
    #{
      id: "event-30",
      name: "Встреча 30 минут",
      description: "Стандартная встреча для детального обсуждения",
      duration_minutes: 30
    }
  ]
})
model EventTypeListResult {
  items: EventType[];
}

model BookingListResult {
  items: Booking[];
}

@example(#{
  items: #[
    #{ id: 101, event_type_id: "event-15", start: "2026-05-05T09:00:00Z", end: "2026-05-05T09:15:00Z", status: SlotStatus.free },
    #{ id: 102, event_type_id: "event-15", start: "2026-05-05T10:00:00Z", end: "2026-05-05T10:15:00Z", status: SlotStatus.busy },
    #{ id: 103, event_type_id: "event-30", start: "2026-05-05T11:00:00Z", end: "2026-05-05T11:30:00Z", status: SlotStatus.free },
    #{ id: 104, event_type_id: "event-30", start: "2026-05-05T13:00:00Z", end: "2026-05-05T13:30:00Z", status: SlotStatus.busy },

    #{ id: 105, event_type_id: "event-15", start: "2026-05-06T09:00:00Z", end: "2026-05-06T09:15:00Z", status: SlotStatus.free },
    #{ id: 106, event_type_id: "event-15", start: "2026-05-06T10:30:00Z", end: "2026-05-06T10:45:00Z", status: SlotStatus.busy },
    #{ id: 107, event_type_id: "event-30", start: "2026-05-06T12:00:00Z", end: "2026-05-06T12:30:00Z", status: SlotStatus.free },
    #{ id: 108, event_type_id: "event-30", start: "2026-05-06T15:00:00Z", end: "2026-05-06T15:30:00Z", status: SlotStatus.busy },

    #{ id: 109, event_type_id: "event-15", start: "2026-05-07T09:30:00Z", end: "2026-05-07T09:45:00Z", status: SlotStatus.free },
    #{ id: 110, event_type_id: "event-15", start: "2026-05-07T11:00:00Z", end: "2026-05-07T11:15:00Z", status: SlotStatus.busy },
    #{ id: 111, event_type_id: "event-30", start: "2026-05-07T14:00:00Z", end: "2026-05-07T14:30:00Z", status: SlotStatus.free },
    #{ id: 112, event_type_id: "event-30", start: "2026-05-07T16:00:00Z", end: "2026-05-07T16:30:00Z", status: SlotStatus.busy },

    #{ id: 113, event_type_id: "event-15", start: "2026-05-08T09:00:00Z", end: "2026-05-08T09:15:00Z", status: SlotStatus.free },
    #{ id: 114, event_type_id: "event-15", start: "2026-05-08T10:30:00Z", end: "2026-05-08T10:45:00Z", status: SlotStatus.busy },
    #{ id: 115, event_type_id: "event-30", start: "2026-05-08T12:00:00Z", end: "2026-05-08T12:30:00Z", status: SlotStatus.free },
    #{ id: 116, event_type_id: "event-30", start: "2026-05-08T15:00:00Z", end: "2026-05-08T15:30:00Z", status: SlotStatus.busy },

    #{ id: 117, event_type_id: "event-15", start: "2026-05-09T09:30:00Z", end: "2026-05-09T09:45:00Z", status: SlotStatus.free },
    #{ id: 118, event_type_id: "event-15", start: "2026-05-09T11:00:00Z", end: "2026-05-09T11:15:00Z", status: SlotStatus.busy },
    #{ id: 119, event_type_id: "event-30", start: "2026-05-09T14:00:00Z", end: "2026-05-09T14:30:00Z", status: SlotStatus.free },
    #{ id: 120, event_type_id: "event-30", start: "2026-05-09T16:00:00Z", end: "2026-05-09T16:30:00Z", status: SlotStatus.busy },

    #{ id: 121, event_type_id: "event-15", start: "2026-05-10T09:00:00Z", end: "2026-05-10T09:15:00Z", status: SlotStatus.free },
    #{ id: 122, event_type_id: "event-15", start: "2026-05-10T10:30:00Z", end: "2026-05-10T10:45:00Z", status: SlotStatus.busy },
    #{ id: 123, event_type_id: "event-30", start: "2026-05-10T12:00:00Z", end: "2026-05-10T12:30:00Z", status: SlotStatus.free },
    #{ id: 124, event_type_id: "event-30", start: "2026-05-10T15:00:00Z", end: "2026-05-10T15:30:00Z", status: SlotStatus.busy },

    #{ id: 125, event_type_id: "event-15", start: "2026-05-11T09:30:00Z", end: "2026-05-11T09:45:00Z", status: SlotStatus.free },
    #{ id: 126, event_type_id: "event-15", start: "2026-05-11T11:00:00Z", end: "2026-05-11T11:15:00Z", status: SlotStatus.busy },
    #{ id: 127, event_type_id: "event-30", start: "2026-05-11T14:00:00Z", end: "2026-05-11T14:30:00Z", status: SlotStatus.free },
    #{ id: 128, event_type_id: "event-30", start: "2026-05-11T16:00:00Z", end: "2026-05-11T16:30:00Z", status: SlotStatus.busy },

    #{ id: 129, event_type_id: "event-15", start: "2026-05-12T09:00:00Z", end: "2026-05-12T09:15:00Z", status: SlotStatus.free },
    #{ id: 130, event_type_id: "event-15", start: "2026-05-12T10:30:00Z", end: "2026-05-12T10:45:00Z", status: SlotStatus.busy },
    #{ id: 131, event_type_id: "event-30", start: "2026-05-12T12:00:00Z", end: "2026-05-12T12:30:00Z", status: SlotStatus.free },
    #{ id: 132, event_type_id: "event-30", start: "2026-05-12T15:00:00Z", end: "2026-05-12T15:30:00Z", status: SlotStatus.busy },

    #{ id: 133, event_type_id: "event-15", start: "2026-05-13T09:30:00Z", end: "2026-05-13T09:45:00Z", status: SlotStatus.free },
    #{ id: 134, event_type_id: "event-15", start: "2026-05-13T11:00:00Z", end: "2026-05-13T11:15:00Z", status: SlotStatus.busy },
    #{ id: 135, event_type_id: "event-30", start: "2026-05-13T14:00:00Z", end: "2026-05-13T14:30:00Z", status: SlotStatus.free },
    #{ id: 136, event_type_id: "event-30", start: "2026-05-13T16:00:00Z", end: "2026-05-13T16:30:00Z", status: SlotStatus.busy },

    #{ id: 137, event_type_id: "event-15", start: "2026-05-14T09:00:00Z", end: "2026-05-14T09:15:00Z", status: SlotStatus.free },
    #{ id: 138, event_type_id: "event-15", start: "2026-05-14T10:30:00Z", end: "2026-05-14T10:45:00Z", status: SlotStatus.busy },
    #{ id: 139, event_type_id: "event-30", start: "2026-05-14T12:00:00Z", end: "2026-05-14T12:30:00Z", status: SlotStatus.free },
    #{ id: 140, event_type_id: "event-30", start: "2026-05-14T15:00:00Z", end: "2026-05-14T15:30:00Z", status: SlotStatus.busy },

    #{ id: 141, event_type_id: "event-15", start: "2026-05-15T09:30:00Z", end: "2026-05-15T09:45:00Z", status: SlotStatus.free },
    #{ id: 142, event_type_id: "event-15", start: "2026-05-15T11:00:00Z", end: "2026-05-15T11:15:00Z", status: SlotStatus.busy },
    #{ id: 143, event_type_id: "event-30", start: "2026-05-15T14:00:00Z", end: "2026-05-15T14:30:00Z", status: SlotStatus.free },
    #{ id: 144, event_type_id: "event-30", start: "2026-05-15T16:00:00Z", end: "2026-05-15T16:30:00Z", status: SlotStatus.busy },

    #{ id: 145, event_type_id: "event-15", start: "2026-05-16T09:00:00Z", end: "2026-05-16T09:15:00Z", status: SlotStatus.free },
    #{ id: 146, event_type_id: "event-15", start: "2026-05-16T10:30:00Z", end: "2026-05-16T10:45:00Z", status: SlotStatus.busy },
    #{ id: 147, event_type_id: "event-30", start: "2026-05-16T12:00:00Z", end: "2026-05-16T12:30:00Z", status: SlotStatus.free },
    #{ id: 148, event_type_id: "event-30", start: "2026-05-16T15:00:00Z", end: "2026-05-16T15:30:00Z", status: SlotStatus.busy },

    #{ id: 149, event_type_id: "event-15", start: "2026-05-17T09:30:00Z", end: "2026-05-17T09:45:00Z", status: SlotStatus.free },
    #{ id: 150, event_type_id: "event-15", start: "2026-05-17T11:00:00Z", end: "2026-05-17T11:15:00Z", status: SlotStatus.busy },
    #{ id: 151, event_type_id: "event-30", start: "2026-05-17T14:00:00Z", end: "2026-05-17T14:30:00Z", status: SlotStatus.free },
    #{ id: 152, event_type_id: "event-30", start: "2026-05-17T16:00:00Z", end: "2026-05-17T16:30:00Z", status: SlotStatus.busy },

    #{ id: 153, event_type_id: "event-15", start: "2026-05-18T09:00:00Z", end: "2026-05-18T09:15:00Z", status: SlotStatus.free },
    #{ id: 154, event_type_id: "event-15", start: "2026-05-18T10:30:00Z", end: "2026-05-18T10:45:00Z", status: SlotStatus.busy },
    #{ id: 155, event_type_id: "event-30", start: "2026-05-18T12:00:00Z", end: "2026-05-18T12:30:00Z", status: SlotStatus.free },
    #{ id: 156, event_type_id: "event-30", start: "2026-05-18T15:00:00Z", end: "2026-05-18T15:30:00Z", status: SlotStatus.busy }
  ]
})
model SlotListResult {
  items: Slot[];
}

model AdminSettings {
  owner: Owner;
  @doc("Default booking window size in days. Fixed to 14.")
  booking_window_days: int32;
}

model AdminSettingsUpdate {
  @doc("Owner display name.")
  name: string;

  @doc("URL to owner avatar image.")
  avatar_url: string;

  @doc("Workday start time in HH:mm format.")
  workday_start: string;

  @doc("Workday end time in HH:mm format.")
  workday_end: string;
}
