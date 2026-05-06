require "test_helper"

class AdminBookingCancellationTest < ActionDispatch::IntegrationTest
  test "cancels booking and frees slot" do
    booking = bookings(:booking_one)

    post "/api/admin/bookings/#{booking.id}/cancel"

    assert_response :ok
    booking.reload
    assert_equal "cancelled", booking.status

    get "/api/slots", params: {
      event_type_id: booking.event_type_id,
      from: booking.slot_start.iso8601,
      to: booking.slot_end.iso8601
    }
    assert_response :ok
    slot = response.parsed_body.fetch("items").find { |item| item.fetch("id") == booking.slot_id.to_s }
    assert_equal "free", slot.fetch("status")
  end
end
