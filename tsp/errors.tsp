import "@typespec/http";

using TypeSpec.Http;

namespace CalendarBooking;

model ErrorResponse {
  @doc("Error code identifier.")
  code: string;

  @doc("Human-readable error message.")
  message: string;
}

@doc("Invalid request or validation error.")
model BadRequestError {
  @statusCode
  status: 400;
  body: ErrorResponse;
}

@doc("Entity not found.")
model NotFoundError {
  @statusCode
  status: 404;
  body: ErrorResponse;
}

@doc("Slot already booked.")
model ConflictError {
  @statusCode
  status: 409;
  body: ErrorResponse;
}

@doc("Slot outside the 14-day booking window.")
model OutOfWindowError {
  @statusCode
  status: 422;
  body: ErrorResponse;
}
