class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings, id: :string do |t|
      t.references :event_type, null: false, foreign_key: true, type: :string
      t.bigint :slot_id, null: false
      t.datetime :slot_start, null: false
      t.datetime :slot_end, null: false
      t.string :name, null: false
      t.string :email, null: false

      t.timestamps
    end

    add_index :bookings, :slot_id, unique: true
    add_index :bookings, %i[slot_start slot_end]

  end
end
