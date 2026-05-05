module Guest
  class BookingsController < ApplicationController
    def create
      booking = BookingService.create!(
        event_type_id: booking_params.fetch(:event_type_id),
        slot_id: booking_params.fetch(:slot_id),
        name: booking_params.fetch(:name),
        email: booking_params.fetch(:email)
      )

      render json: booking_payload(booking), status: :ok
    end

    private

    def booking_params
      params.permit(:event_type_id, :slot_id, :name, :email)
    end

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
