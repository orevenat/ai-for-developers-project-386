require "test_helper"

class GuestBookingsControllerTest < ActionDispatch::IntegrationTest
  test "creates booking" do
    event_type = event_types(:event_15)
    slot_id = SlotAvailabilityService.list_slots(event_type:).fetch(:items).first.fetch(:id)

    post "/bookings", params: attributes_for(:booking, event_type_id: event_type.id, slot_id: slot_id)

    assert_response :ok
    body = response.parsed_body
    assert_equal slot_id.to_s, body.fetch("slot_id")
  end

  test "rejects booked slot" do
    event_type = event_types(:event_30)
    booking = bookings(:booking_one)
    slot_id = SlotAvailabilityService.send(:deterministic_slot_id, event_type.id, booking.slot_start, booking.slot_end)

    post "/bookings", params: attributes_for(:booking, event_type_id: event_type.id, slot_id: slot_id)

    assert_response :conflict
  end
end
