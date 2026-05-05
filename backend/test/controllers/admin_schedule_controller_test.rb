require "test_helper"

class AdminScheduleControllerTest < ActionDispatch::IntegrationTest
  test "lists schedule" do
    get "/admin/schedule"

    assert_response :ok
    body = response.parsed_body
    assert body.fetch("items").any?
    assert body.fetch("items").first.key?("id")
  end
end
