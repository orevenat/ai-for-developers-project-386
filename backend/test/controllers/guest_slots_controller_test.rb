require "test_helper"

class GuestSlotsControllerTest < ActionDispatch::IntegrationTest
  test "lists slots for event type" do
    get "/slots", params: { event_type_id: "event-15" }

    assert_response :ok
    body = response.parsed_body
    assert body.fetch("items").any?
    assert body.fetch("items").first.key?("id")
  end
end
