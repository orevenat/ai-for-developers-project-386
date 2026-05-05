class CreateOwners < ActiveRecord::Migration[8.1]
  def change
    create_table :owners do |t|
      t.string :name, null: false
      t.string :avatar_url, null: false
      t.string :workday_start, null: false
      t.string :workday_end, null: false

      t.timestamps
    end
  end
end
