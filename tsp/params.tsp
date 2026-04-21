import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CalendarBooking;

@doc("Event type identifier.")
alias EventTypeIdParam = string;

@doc("Slot identifier.")
alias SlotIdParam = int64;

@doc("Booking identifier.")
alias BookingIdParam = string;

@doc("Time window start in ISO 8601 format.")
@format("date-time")
alias FromDateTime = string;

@doc("Time window end in ISO 8601 format.")
@format("date-time")
alias ToDateTime = string;
