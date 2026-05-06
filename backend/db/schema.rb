# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_05_074450) do
  create_table "bookings", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "event_type_id", null: false
    t.string "name", null: false
    t.datetime "slot_end", null: false
    t.integer "slot_id", null: false
    t.datetime "slot_start", null: false
    t.datetime "updated_at", null: false
    t.index ["event_type_id"], name: "index_bookings_on_event_type_id"
    t.index ["slot_id"], name: "index_bookings_on_slot_id", unique: true
    t.index ["slot_start", "slot_end"], name: "index_bookings_on_slot_start_and_slot_end"
  end

  create_table "event_types", id: :string, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.integer "duration_minutes", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
  end

  create_table "owners", force: :cascade do |t|
    t.string "avatar_url", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.string "workday_end", null: false
    t.string "workday_start", null: false
  end

  add_foreign_key "bookings", "event_types"
end
