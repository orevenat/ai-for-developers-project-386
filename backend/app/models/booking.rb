class Booking < ApplicationRecord
  belongs_to :event_type

  enum :status, {
    active: "active",
    cancelled: "cancelled"
  }, prefix: true

  validates :name, :email, presence: true
end
