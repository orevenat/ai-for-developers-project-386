module Guest
  class EventTypesController < ApplicationController
    def index
      render json: { items: EventType.order(:name).as_json }, status: :ok
    end

    def show
      event_type = EventType.find(params[:event_type_id])
      render json: event_type.as_json, status: :ok
    end
  end
end
