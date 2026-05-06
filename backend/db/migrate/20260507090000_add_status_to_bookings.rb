class AddStatusToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :status, :string, null: false, default: "active"
    add_index :bookings, :status
  end
end
