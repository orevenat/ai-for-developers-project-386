module Admin
  class BookingsController < ApplicationController
    def upcoming
      bookings = Booking.where("slot_start >= ?", Time.zone.now)
      render json: { items: bookings.map { |booking| booking_payload(booking) } }, status: :ok
    end

    private

    def booking_payload(booking)
      {
        id: booking.id,
        event_type_id: booking.event_type_id,
        slot_id: booking.slot_id.to_s,
        name: booking.name,
        email: booking.email,
        created_at: booking.created_at.iso8601
      }
    end
  end
end
