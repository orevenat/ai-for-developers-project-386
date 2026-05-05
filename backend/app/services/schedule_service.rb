class ScheduleService
  class << self
    def list_schedule(from: nil, to: nil)
      range = SlotAvailabilityService.booking_range(from:, to:)
      event_types = EventType.all

      slots = event_types.flat_map do |event_type|
        SlotAvailabilityService.list_slots(event_type:, from: range.begin.iso8601, to: range.end.iso8601)
          .fetch(:items)
      end

      { items: slots }
    end
  end
end
