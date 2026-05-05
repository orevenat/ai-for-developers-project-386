class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from ActiveRecord::RecordInvalid, with: :render_bad_request
  rescue_from BookingError, with: :render_booking_error

  private

  def render_not_found(_error)
    render_error(status: :not_found, code: "not_found", message: "Resource not found")
  end

  def render_bad_request(error)
    render_error(status: :bad_request, code: "invalid_request", message: error.message)
  end

  def render_booking_error(error)
    render_error(status: error.status, code: error.code, message: error.message)
  end

  def render_error(status:, code:, message:)
    render status:, json: { code:, message: }
  end
end
