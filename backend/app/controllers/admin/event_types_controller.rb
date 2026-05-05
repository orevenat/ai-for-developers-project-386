module Admin
  class EventTypesController < ApplicationController
    def index
      render json: { items: EventType.all.as_json }, status: :ok
    end

    def show
      event_type = EventType.find(params[:event_type_id])
      render json: event_type.as_json, status: :ok
    end

    def create
      event_type = EventType.create!(event_type_params)
      render json: event_type.as_json, status: :ok
    end

    private

    def event_type_params
      params.permit(:id, :name, :description, :duration_minutes)
    end
  end
end
