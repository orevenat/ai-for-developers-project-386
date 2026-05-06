require "test_helper"

class AdminEventTypesControllerTest < ActionDispatch::IntegrationTest
  test "lists event types" do
    get "/api/admin/event-types"

    assert_response :ok
    body = response.parsed_body
    assert_equal 2, body.fetch("items").size
  end

  test "creates event type" do
    post "/api/admin/event-types", params: attributes_for(:event_type)

    assert_response :ok
    body = response.parsed_body
    assert_equal "event-45", body.fetch("id")
  end

  test "shows event type" do
    get "/api/admin/event-types/event-30"

    assert_response :ok
    body = response.parsed_body
    assert_equal "event-30", body.fetch("id")
  end
end
