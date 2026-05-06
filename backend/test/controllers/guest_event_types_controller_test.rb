require "test_helper"

class GuestEventTypesControllerTest < ActionDispatch::IntegrationTest
  test "lists event types" do
    get "/api/event-types"

    assert_response :ok
    body = response.parsed_body
    assert_equal 2, body.fetch("items").size
  end

  test "shows event type" do
    get "/api/event-types/event-15"

    assert_response :ok
    body = response.parsed_body
    assert_equal "event-15", body.fetch("id")
  end
end
