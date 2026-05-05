require "test_helper"

class AdminBookingsControllerTest < ActionDispatch::IntegrationTest
  test "lists upcoming bookings" do
    get "/admin/bookings/upcoming"

    assert_response :ok
    body = response.parsed_body
    assert body.fetch("items").any?
  end
end
