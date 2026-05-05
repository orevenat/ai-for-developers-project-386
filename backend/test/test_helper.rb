ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"
require "factory_bot_rails"

FactoryBot.definition_file_paths = [Rails.root.join("test/factories.rb")]
FactoryBot.find_definitions

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    fixtures :event_types, :owners, :bookings

    # Add more helper methods to be used by all tests here...
  end
end

class ActionDispatch::IntegrationTest
  include FactoryBot::Syntax::Methods
end
