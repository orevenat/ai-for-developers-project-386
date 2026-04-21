import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;
using TypeSpec.OpenAPI3;

@service({
  title: "Calendar Booking API"
})
@openapi3
@server("https://api.example.com", "Production")
namespace CalendarBooking;

import "./models.tsp";
import "./params.tsp";
import "./errors.tsp";
import "./routes.tsp";
