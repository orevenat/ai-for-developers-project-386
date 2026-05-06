require "test_helper"

class AdminSettingsControllerTest < ActionDispatch::IntegrationTest
  test "shows settings" do
    get "/api/admin/settings"

    assert_response :ok
    body = response.parsed_body
    assert_equal "Calendar Owner", body.dig("owner", "name")
  end

  test "updates settings" do
    patch "/api/admin/settings", params: { name: "New Name" }

    assert_response :ok
    body = response.parsed_body
    assert_equal "New Name", body.dig("owner", "name")
  end
end
