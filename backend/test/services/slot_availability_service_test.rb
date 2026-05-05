require "test_helper"

class SlotAvailabilityServiceTest < ActiveSupport::TestCase
  test "returns slots for event type" do
    event_type = event_types(:event_15)

    slots = SlotAvailabilityService.list_slots(event_type:).fetch(:items)

    assert slots.any?
    first_slot = slots.first
    assert_equal event_type.id, first_slot.fetch(:event_type_id)
  end

  test "rejects out of window range" do
    event_type = event_types(:event_15)

    assert_raises(BookingError) do
      SlotAvailabilityService.list_slots(
        event_type:,
        from: (Time.zone.now + 20.days).iso8601,
        to: (Time.zone.now + 21.days).iso8601
      )
    end
  end
end
