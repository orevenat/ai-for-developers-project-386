require "digest"

class SlotAvailabilityService
  BOOKING_WINDOW_DAYS = 14

  class << self
    def list_slots(event_type:, from: nil, to: nil)
      range = booking_range(from:, to:)
      ensure_slots_for_range(event_type:, range:)
    end

    def within_booking_window?(start_time, end_time)
      range = booking_range
      start_time >= range.begin && end_time <= range.end
    end

    def find_slot_range!(event_type:, slot_id:)
      range = booking_range
      owner = Owner.first
      raise BookingError.new(code: "owner_missing", message: "Owner settings missing", status: :bad_request) if owner.nil?

      start_minutes = parse_day_minutes!(owner.workday_start)
      end_minutes = parse_day_minutes!(owner.workday_end)
      duration = event_type.duration_minutes
      step = 15

      date = range.begin.to_date
      while date <= range.end.to_date
        day_start = Time.zone.local(date.year, date.month, date.day) + start_minutes.minutes
        day_end = Time.zone.local(date.year, date.month, date.day) + end_minutes.minutes

        current = day_start
        while current + duration.minutes <= day_end
          slot_start = current
          slot_end = current + duration.minutes
          candidate_id = deterministic_slot_id(event_type.id, slot_start, slot_end)
          return [slot_start, slot_end] if candidate_id == slot_id.to_i

          current += step.minutes
        end

        date += 1.day
      end

      raise BookingError.new(code: "slot_not_found", message: "Slot not found", status: :not_found)
    end

    def booking_range(from: nil, to: nil)
      window_start = Time.zone.now.beginning_of_day
      window_end = (window_start + BOOKING_WINDOW_DAYS.days).end_of_day

      return window_start..window_end if from.nil? && to.nil?

      from_time = parse_time!(from) if from
      to_time = parse_time!(to) if to
      candidate_start = from_time || window_start
      candidate_end = to_time || window_end

      unless candidate_start >= window_start && candidate_end <= window_end
        raise BookingError.new(code: "out_of_window", message: "Requested window outside booking range", status: :unprocessable_entity)
      end

      candidate_start..candidate_end
    end

    private

    def ensure_slots_for_range(event_type:, range:)
      owner = Owner.first
      raise BookingError.new(code: "owner_missing", message: "Owner settings missing", status: :bad_request) if owner.nil?

      start_minutes = parse_day_minutes!(owner.workday_start)
      end_minutes = parse_day_minutes!(owner.workday_end)
      duration = event_type.duration_minutes
      step = 15

      slots = []

      date = range.begin.to_date
      while date <= range.end.to_date
        day_start = Time.zone.local(date.year, date.month, date.day) + start_minutes.minutes
        day_end = Time.zone.local(date.year, date.month, date.day) + end_minutes.minutes

        current = day_start
        while current + duration.minutes <= day_end
          slot_start = current
          slot_end = current + duration.minutes

          if slot_start >= range.begin && slot_end <= range.end
            slots << slot_payload(event_type:, start_time: slot_start, end_time: slot_end)
          end

          current += step.minutes
        end

        date += 1.day
      end

      { items: slots }
    end

    def slot_busy?(start_time, end_time)
      Booking.where("slot_start < ? AND slot_end > ?", end_time, start_time).exists?
    end

    def slot_payload(event_type:, start_time:, end_time:)
      {
        id: deterministic_slot_id(event_type.id, start_time, end_time).to_s,
        event_type_id: event_type.id,
        start: start_time.iso8601,
        end: end_time.iso8601,
        status: slot_busy?(start_time, end_time) ? "busy" : "free"
      }
    end

    def deterministic_slot_id(event_type_id, start_time, end_time)
      raw = [event_type_id, start_time.iso8601, end_time.iso8601].join("|")
      Digest::SHA256.hexdigest(raw)[0, 15].to_i(16)
    end

    def parse_time!(value)
      Time.zone.parse(value)
    rescue ArgumentError
      raise BookingError.new(code: "invalid_datetime", message: "Invalid datetime format", status: :bad_request)
    end

    def parse_day_minutes!(value)
      parts = value.to_s.split(":").map(&:to_i)
      hours, minutes = parts
      if hours.nil? || minutes.nil?
        raise BookingError.new(code: "invalid_workday", message: "Invalid workday time", status: :bad_request)
      end

      hours * 60 + minutes
    end
  end
end
