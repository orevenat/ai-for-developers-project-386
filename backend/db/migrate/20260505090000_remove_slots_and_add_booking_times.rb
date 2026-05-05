class RemoveSlotsAndAddBookingTimes < ActiveRecord::Migration[8.1]
  def change
    if foreign_key_exists?(:bookings, :slots)
      remove_foreign_key :bookings, :slots
    end

    drop_table :slots, if_exists: true

    add_column :bookings, :slot_start, :datetime, null: false, default: -> { "CURRENT_TIMESTAMP" }
    add_column :bookings, :slot_end, :datetime, null: false, default: -> { "CURRENT_TIMESTAMP" }

    change_column_default :bookings, :slot_start, from: -> { "CURRENT_TIMESTAMP" }, to: nil
    change_column_default :bookings, :slot_end, from: -> { "CURRENT_TIMESTAMP" }, to: nil

    add_index :bookings, %i[slot_start slot_end]
  end
end
