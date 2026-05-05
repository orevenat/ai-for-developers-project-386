module Admin
  class ScheduleController < ApplicationController
    def index
      render json: ScheduleService.list_schedule(from: params[:from], to: params[:to]), status: :ok
    end
  end
end
