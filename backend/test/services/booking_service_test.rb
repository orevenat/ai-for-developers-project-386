require "test_helper"

class BookingServiceTest < ActiveSupport::TestCase
  test "creates booking" do
    event_type = event_types(:event_15)
    slot_id = SlotAvailabilityService.list_slots(event_type:).fetch(:items).first.fetch(:id)

    booking = BookingService.create!(
      event_type_id: event_type.id,
      slot_id: slot_id,
      name: "New Guest",
      email: "new-guest@example.com"
    )

    assert_equal slot_id, booking.slot_id
  end

  test "rejects overlapping booking" do
    event_type = event_types(:event_30)
    booking = bookings(:booking_one)
    slot_id = SlotAvailabilityService.send(:deterministic_slot_id, event_type.id, booking.slot_start, booking.slot_end)

    assert_raises(BookingError) do
      BookingService.create!(
        event_type_id: event_type.id,
        slot_id: slot_id,
        name: "New Guest",
        email: "new-guest@example.com"
      )
    end
  end
end
