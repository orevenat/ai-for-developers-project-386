module Admin
  class SettingsController < ApplicationController
    def show
      owner = Owner.first
      raise ActiveRecord::RecordNotFound if owner.nil?

      render json: settings_payload(owner), status: :ok
    end

    def update
      owner = Owner.first
      raise ActiveRecord::RecordNotFound if owner.nil?

      owner.update!(settings_params)
      render json: settings_payload(owner), status: :ok
    end

    private

    def settings_params
      params.permit(:name, :avatar_url, :workday_start, :workday_end)
    end

    def settings_payload(owner)
      {
        owner: {
          id: owner.id.to_s,
          name: owner.name,
          avatar_url: owner.avatar_url,
          workday_start: owner.workday_start,
          workday_end: owner.workday_end
        },
        booking_window_days: SlotAvailabilityService::BOOKING_WINDOW_DAYS
      }
    end
  end
end
