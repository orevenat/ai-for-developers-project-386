class EventType < ApplicationRecord
  self.primary_key = "id"

  has_many :bookings, dependent: :destroy

  validates :id, :name, :description, :duration_minutes, presence: true
  validates :duration_minutes, numericality: { greater_than: 0 }
  validates :duration_minutes, numericality: { multiple_of: 15 }
end
