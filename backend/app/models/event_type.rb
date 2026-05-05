class EventType < ApplicationRecord
  self.primary_key = "id"

  before_validation :ensure_id, on: :create

  has_many :bookings, dependent: :destroy

  validates :id, :name, :description, :duration_minutes, presence: true
  validates :duration_minutes, numericality: { greater_than: 0 }
  validates :duration_minutes, numericality: { multiple_of: 15 }

  private

  def ensure_id
    return if id.present?

    base = name.to_s.parameterize
    base = "event" if base.empty?
    self.id = base
  end
end
