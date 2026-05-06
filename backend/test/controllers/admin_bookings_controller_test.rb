require "test_helper"

class AdminBookingsControllerTest < ActionDispatch::IntegrationTest
  test "lists upcoming bookings" do
    get "/api/admin/bookings/upcoming"

    assert_response :ok
    body = response.parsed_body
    assert body.fetch("items").any?
    item = body.fetch("items").first
    assert item.key?("event_type_name")
    assert item.key?("slot_start")
    assert item.key?("status")
  end
end
