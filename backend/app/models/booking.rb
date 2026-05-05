class Booking < ApplicationRecord
  belongs_to :event_type

  validates :name, :email, presence: true
end
