require "test_helper"

class ScheduleServiceTest < ActiveSupport::TestCase
  test "lists schedule items" do
    payload = ScheduleService.list_schedule

    assert payload.fetch(:items).any?
  end
end
