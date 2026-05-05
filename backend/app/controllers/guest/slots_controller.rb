module Guest
  class SlotsController < ApplicationController
    def index
      event_type = EventType.find(params[:event_type_id])
      slots = SlotAvailabilityService.list_slots(
        event_type:,
        from: params[:from],
        to: params[:to]
      )

      render json: slots, status: :ok
    end
  end
end
