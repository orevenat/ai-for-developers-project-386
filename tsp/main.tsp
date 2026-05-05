import "./models.tsp";
import "./params.tsp";
import "./errors.tsp";
import "./routes.tsp";
import "@typespec/http";
import "@typespec/openapi";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service(#{
  title: "Calendar Booking API"
})
@server("https://api.example.com", "Production")
namespace CalendarBooking;
