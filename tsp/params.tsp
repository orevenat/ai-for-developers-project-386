import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

namespace CalendarBooking;

alias EventTypeIdParam = string;

alias SlotIdParam = int64;

alias BookingIdParam = string;

alias FromDateTime = string;

alias ToDateTime = string;
