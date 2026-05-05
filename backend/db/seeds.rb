Owner.find_or_create_by!(
  name: "Calendar Owner",
  avatar_url: "https://example.com/avatar.png",
  workday_start: "09:00",
  workday_end: "17:00"
)

EventType.find_or_create_by!(
  id: "event-15",
  name: "Встреча 15 минут",
  description: "Короткая встреча для быстрого обсуждения",
  duration_minutes: 15
)

EventType.find_or_create_by!(
  id: "event-30",
  name: "Встреча 30 минут",
  description: "Стандартная встреча для детального обсуждения",
  duration_minutes: 30
)
