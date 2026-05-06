class BookingService
  class << self
    def create!(event_type_id:, slot_id:, name:, email:)
      event_type = EventType.find(event_type_id)
      slot_start, slot_end = SlotAvailabilityService.find_slot_range!(event_type:, slot_id:)

      unless SlotAvailabilityService.within_booking_window?(slot_start, slot_end)
        raise BookingError.new(code: "out_of_window", message: "Slot outside booking window", status: :unprocessable_entity)
      end

      if overlapping_booking?(slot_start, slot_end)
        raise BookingError.new(code: "slot_busy", message: "Slot already booked", status: :conflict)
      end

      Booking.transaction do
        Booking.create!(
          id: SecureRandom.uuid,
          event_type:,
          slot_id:,
          slot_start: slot_start,
          slot_end: slot_end,
          name:,
          email:,
          created_at: Time.current
        )
      rescue ActiveRecord::RecordNotUnique
        raise BookingError.new(code: "slot_busy", message: "Slot already booked", status: :conflict)
      end
    end

    private

    def overlapping_booking?(start_time, end_time)
      Booking.where(status: "active")
        .where("slot_start < ? AND slot_end > ?", end_time, start_time)
        .exists?
    end
  end
end
