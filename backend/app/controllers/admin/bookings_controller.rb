module Admin
  class BookingsController < ApplicationController
    def upcoming
      bookings = Booking.where("slot_start >= ?", Time.zone.now)
      render json: { items: bookings.map { |booking| booking_payload(booking) } }, status: :ok
    end

    def cancel
      booking = Booking.find(params[:id])
      booking.update!(status: "cancelled")

      render json: booking_payload(booking), status: :ok
    end

    private

    def booking_payload(booking)
      {
        id: booking.id,
        event_type_id: booking.event_type_id,
        event_type_name: booking.event_type.name,
        slot_id: booking.slot_id.to_s,
        slot_start: booking.slot_start.iso8601,
        name: booking.name,
        email: booking.email,
        created_at: booking.created_at.iso8601,
        status: booking.status
      }
    end
  end
end
