class Owner < ApplicationRecord
  validates :name, :avatar_url, :workday_start, :workday_end, presence: true
end
