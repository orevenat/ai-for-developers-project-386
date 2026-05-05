FactoryBot.define do
  factory :booking do
    event_type_id { "event-15" }
    slot_id { 1 }
    name { "New Guest" }
    email { "new-guest@example.com" }
  end

  factory :event_type do
    id { "event-45" }
    name { "Встреча 45 минут" }
    description { "Дополнительный тип встречи" }
    duration_minutes { 45 }
  end
end
