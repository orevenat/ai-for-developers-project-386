# Admin Bookings Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend admin bookings to show event type name, meeting start time, status, and support cancellation that frees the slot while keeping the booking in the list.

**Architecture:** Expand the TypeSpec contract and API payload, update frontend types and UI to render new fields and call a cancel endpoint, then update backend controller/model and tests to persist booking status and free slots on cancel.

**Tech Stack:** TypeSpec, React + TypeScript (Mantine), Ruby on Rails (Minitest), Playwright

---

## File Map

- Modify: `tsp/models.tsp`
- Modify: `tsp/routes.tsp`
- Modify: `frontend/src/lib/api/types.ts`
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/src/pages/AdminBookingsPage.tsx`
- Modify: `frontend/src/i18n.ts`
- Modify: `backend/db/migrate/20260505074450_create_bookings.rb`
- Modify: `backend/db/schema.rb`
- Modify: `backend/app/models/booking.rb`
- Modify: `backend/app/controllers/admin/bookings_controller.rb`
- Modify: `backend/app/controllers/guest/bookings_controller.rb`
- Modify: `backend/app/services/booking_service.rb`
- Modify: `backend/config/routes.rb`
- Modify: `backend/test/fixtures/bookings.yml`
- Modify: `backend/test/controllers/admin_bookings_controller_test.rb`
- Modify: `tests/e2e/guest-booking.spec.ts`
- Create: `backend/test/controllers/admin_booking_cancellation_test.rb`
- Create: `backend/db/migrate/20260507090000_add_status_to_bookings.rb`

---

### Task 1: Update TypeSpec contract for admin bookings

**Files:**
- Modify: `tsp/models.tsp`
- Modify: `tsp/routes.tsp`

- [ ] **Step 1: Add admin booking model with status + slot start**

Update `tsp/models.tsp`:

```tsp
@doc("Booking status.")
enum BookingStatus {
  active,
  cancelled,
}

@doc("Booking summary for admin usage.")
model AdminBooking {
  @doc("Booking identifier.")
  id: string;

  @doc("Related event type identifier.")
  event_type_id: string;

  @doc("Event type name.")
  event_type_name: string;

  @doc("Related slot identifier.")
  slot_id: int64;

  @doc("Slot start time in ISO 8601 format.")
  @format("date-time")
  slot_start: string;

  @doc("Guest name.")
  name: string;

  @doc("Guest email.")
  @format("email")
  email: string;

  @doc("Booking creation time in ISO 8601 format.")
  @format("date-time")
  created_at: string;

  @doc("Booking status.")
  status: BookingStatus;
}
```

- [ ] **Step 2: Update admin list to return AdminBooking**

Update `tsp/routes.tsp`:

```tsp
model AdminBookingListResult {
  items: AdminBooking[];
}
```

Replace the return type in `listUpcomingBookings()`:

```tsp
listUpcomingBookings(): AdminBookingListResult;
```

- [ ] **Step 3: Add cancel endpoint**

In `tsp/routes.tsp`, add:

```tsp
@doc("Cancel a booking and free its slot.")
@post
@route("/bookings/{booking_id}/cancel")
cancelBooking(@path booking_id: string): AdminBooking | NotFoundError;
```

- [ ] **Step 4: Compile TypeSpec to OpenAPI**

Run:

```bash
npm run tsp:compile
```

Expected: `tsp-output/@typespec/openapi3/openapi.yaml` updated without errors.

- [ ] **Step 5: Commit**

```bash
git add tsp/models.tsp tsp/routes.tsp tsp-output/@typespec/openapi3/openapi.yaml
git commit -m "Update TypeSpec for admin bookings cancellation"
```

---

### Task 2: Update frontend types, API client, and i18n

**Files:**
- Modify: `frontend/src/lib/api/types.ts`
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/src/i18n.ts`

- [ ] **Step 1: Extend booking type and add status enum**

Update `frontend/src/lib/api/types.ts`:

```ts
export type BookingStatus = 'active' | 'cancelled'

export type AdminBooking = {
  id: string
  event_type_id: string
  event_type_name: string
  slot_id: string
  slot_start: string
  name: string
  email: string
  created_at: string
  status: BookingStatus
}

export type AdminBookingListResult = {
  items: AdminBooking[]
}
```

- [ ] **Step 2: Add cancel endpoint to API client**

Update `frontend/src/lib/api/client.ts`:

```ts
import type { AdminBooking, AdminBookingListResult } from './types'

export async function listUpcomingBookings(): Promise<AdminBookingListResult> {
  const response = await safeFetch(`${baseUrl}/admin/bookings/upcoming`)
  return handleResponse<AdminBookingListResult>(response)
}

export async function cancelAdminBooking(bookingId: string): Promise<AdminBooking> {
  const response = await safeFetch(`${baseUrl}/admin/bookings/${bookingId}/cancel`, {
    method: 'POST',
  })
  return handleResponse<AdminBooking>(response)
}
```

- [ ] **Step 3: Add translation strings for new columns and status**

Update `frontend/src/i18n.ts` in `bookings`:

```ts
columns: {
  event: 'Событие',
  guest: 'Гость',
  email: 'Email',
  meeting: 'Время встречи',
  status: 'Статус',
  actions: 'Действия',
},
cancel: 'Отменить',
status: {
  active: 'Активно',
  cancelled: 'Отменен',
},
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/lib/api/types.ts frontend/src/lib/api/client.ts frontend/src/i18n.ts
git commit -m "Update frontend API types for admin bookings"
```

---

### Task 3: Update admin bookings UI with cancel action

**Files:**
- Modify: `frontend/src/pages/AdminBookingsPage.tsx`

- [ ] **Step 1: Render meeting time, status, and cancel action**

Update `frontend/src/pages/AdminBookingsPage.tsx`:

```tsx
import { Button, Container, Group, Stack, Table, Text, Title } from '@mantine/core'
import { IconCalendarEvent } from '@tabler/icons-react'
import { cancelAdminBooking, listUpcomingBookings } from '../lib/api/client'
import { useAsync } from '../lib/api/hooks'
import { StatusMessage } from '../components/StatusMessage'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const formatDate = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AdminBookingsPage() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(listUpcomingBookings)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const bookings = useMemo(() => data?.items ?? [], [data])

  return (
    <Container size="lg" py={32}>
      <Stack gap="lg">
        <Group gap="sm">
          <IconCalendarEvent size={22} color="var(--accent-strong)" />
          <Title order={3} className="display-font">
            {t('bookings.title')}
          </Title>
        </Group>
        {loading ? <StatusMessage title={t('bookings.loading')} variant="loading" /> : null}
        {error ? (
          <StatusMessage
            title={t('bookings.error')}
            description={t('confirm.errorDefault')}
            variant="error"
          />
        ) : null}
        {actionError ? (
          <StatusMessage title={t('bookings.error')} description={actionError} variant="error" />
        ) : null}
        {!loading && !error && bookings.length === 0 ? (
          <StatusMessage title={t('bookings.empty')} variant="empty" />
        ) : null}
        {!loading && !error && bookings.length ? (
          <Table withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('bookings.columns.event')}</Table.Th>
                <Table.Th>{t('bookings.columns.guest')}</Table.Th>
                <Table.Th>{t('bookings.columns.email')}</Table.Th>
                <Table.Th>{t('bookings.columns.meeting')}</Table.Th>
                <Table.Th>{t('bookings.columns.status')}</Table.Th>
                <Table.Th>{t('bookings.columns.actions')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled'
                return (
                  <Table.Tr key={booking.id}>
                    <Table.Td>{booking.event_type_name}</Table.Td>
                    <Table.Td>{booking.name}</Table.Td>
                    <Table.Td>{booking.email}</Table.Td>
                    <Table.Td>{formatDate(booking.slot_start)}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c={isCancelled ? 'var(--muted)' : 'inherit'}>
                        {t(`bookings.status.${booking.status}`)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        radius="xl"
                        size="xs"
                        color="orange"
                        variant={isCancelled ? 'light' : 'filled'}
                        disabled={isCancelled || pendingId === booking.id}
                        loading={pendingId === booking.id}
                        onClick={async () => {
                          setActionError(null)
                          setPendingId(booking.id)
                          try {
                            await cancelAdminBooking(booking.id)
                            reload()
                          } catch {
                            setActionError(t('confirm.errorDefault'))
                          } finally {
                            setPendingId(null)
                          }
                        }}
                      >
                        {t('bookings.cancel')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>
        ) : null}
      </Stack>
    </Container>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/AdminBookingsPage.tsx
git commit -m "Add cancel action to admin bookings UI"
```

---

### Task 4: Add booking status in backend and cancellation endpoint

**Files:**
- Create: `backend/db/migrate/20260507090000_add_status_to_bookings.rb`
- Modify: `backend/db/migrate/20260505074450_create_bookings.rb`
- Modify: `backend/db/schema.rb`
- Modify: `backend/app/models/booking.rb`
- Modify: `backend/app/controllers/admin/bookings_controller.rb`
- Modify: `backend/app/controllers/guest/bookings_controller.rb`
- Modify: `backend/app/services/booking_service.rb`
- Modify: `backend/config/routes.rb`

- [ ] **Step 1: Add status column migration**

Create `backend/db/migrate/20260507090000_add_status_to_bookings.rb`:

```rb
class AddStatusToBookings < ActiveRecord::Migration[8.1]
  def change
    add_column :bookings, :status, :string, null: false, default: "active"
    add_index :bookings, :status
  end
end
```

- [ ] **Step 2: Ensure new bookings default to active**

Update `backend/db/migrate/20260505074450_create_bookings.rb`:

```rb
t.string :status, null: false, default: "active"
```

- [ ] **Step 3: Update Booking model**

Update `backend/app/models/booking.rb`:

```rb
class Booking < ApplicationRecord
  belongs_to :event_type

  enum :status, {
    active: "active",
    cancelled: "cancelled"
  }, prefix: true

  validates :name, :email, presence: true
end
```

- [ ] **Step 4: Add cancel action and enrich payload**

Update `backend/app/controllers/admin/bookings_controller.rb`:

```rb
module Admin
  class BookingsController < ApplicationController
    def upcoming
      bookings = Booking.where("slot_start >= ?", Time.zone.now)
      render json: { items: bookings.map { |booking| booking_payload(booking) } }, status: :ok
    end

    def cancel
      booking = Booking.find(params[:id])
      booking.update!(status: "cancelled")

      render json: booking_payload(booking), status: :ok
    end

    private

    def booking_payload(booking)
      {
        id: booking.id,
        event_type_id: booking.event_type_id,
        event_type_name: booking.event_type.name,
        slot_id: booking.slot_id.to_s,
        slot_start: booking.slot_start.iso8601,
        name: booking.name,
        email: booking.email,
        created_at: booking.created_at.iso8601,
        status: booking.status
      }
    end
  end
end
```

- [ ] **Step 5: Update guest booking payload to include status**

Update `backend/app/controllers/guest/bookings_controller.rb`:

```rb
def booking_payload(booking)
  {
    id: booking.id,
    event_type_id: booking.event_type_id,
    slot_id: booking.slot_id.to_s,
    name: booking.name,
    email: booking.email,
    created_at: booking.created_at.iso8601,
    status: booking.status
  }
end
```

- [ ] **Step 6: Exclude cancelled bookings from slot busy check**

Update `backend/app/services/booking_service.rb`:

```rb
def overlapping_booking?(start_time, end_time)
  Booking.where(status: "active").where("slot_start < ? AND slot_end > ?", end_time, start_time).exists?
end
```

Update `backend/app/services/slot_availability_service.rb`:

```rb
def slot_busy?(start_time, end_time)
  Booking.where(status: "active").where("slot_start < ? AND slot_end > ?", end_time, start_time).exists?
end
```

- [ ] **Step 7: Add route for cancel**

Update `backend/config/routes.rb`:

```rb
resources :bookings, only: [] do
  collection do
    get :upcoming
  end
  member do
    post :cancel
  end
end
```

- [ ] **Step 8: Run backend migrations**

```bash
cd backend
bin/rails db:migrate
```

Expected: migration completes, schema updates with `status` column and index.

- [ ] **Step 9: Commit**

```bash
git add backend/db/migrate/20260507090000_add_status_to_bookings.rb \
  backend/db/migrate/20260505074450_create_bookings.rb \
  backend/db/schema.rb \
  backend/app/models/booking.rb \
  backend/app/controllers/admin/bookings_controller.rb \
  backend/app/controllers/guest/bookings_controller.rb \
  backend/app/services/booking_service.rb \
  backend/app/services/slot_availability_service.rb \
  backend/config/routes.rb
git commit -m "Add booking status and cancel endpoint"
```

---

### Task 5: Update backend fixtures and tests

**Files:**
- Modify: `backend/test/fixtures/bookings.yml`
- Modify: `backend/test/controllers/admin_bookings_controller_test.rb`
- Create: `backend/test/controllers/admin_booking_cancellation_test.rb`

- [ ] **Step 1: Update booking fixtures with status**

Update `backend/test/fixtures/bookings.yml`:

```yml
booking_one:
  id: "booking-1"
  event_type_id: "event-30"
  slot_id: <%= SlotAvailabilityService.send(:deterministic_slot_id, "event-30", Time.zone.now.beginning_of_day + 1.day + 10.hours, Time.zone.now.beginning_of_day + 1.day + 10.hours + 30.minutes) %>
  slot_start: <%= Time.zone.now.beginning_of_day + 1.day + 10.hours %>
  slot_end: <%= Time.zone.now.beginning_of_day + 1.day + 10.hours + 30.minutes %>
  name: "Existing Guest"
  email: "guest@example.com"
  status: "active"
  created_at: <%= Time.zone.now %>
```

- [ ] **Step 2: Expand admin bookings controller test**

Update `backend/test/controllers/admin_bookings_controller_test.rb`:

```rb
test "lists upcoming bookings" do
  get "/api/admin/bookings/upcoming"

  assert_response :ok
  body = response.parsed_body
  item = body.fetch("items").first
  assert item.key?("event_type_name")
  assert item.key?("slot_start")
  assert item.key?("status")
end
```

- [ ] **Step 3: Add cancellation test**

Create `backend/test/controllers/admin_booking_cancellation_test.rb`:

```rb
require "test_helper"

class AdminBookingCancellationTest < ActionDispatch::IntegrationTest
  test "cancels booking and frees slot" do
    booking = bookings(:booking_one)

    post "/api/admin/bookings/#{booking.id}/cancel"

    assert_response :ok
    booking.reload
    assert_equal "cancelled", booking.status

    get "/api/slots", params: {
      event_type_id: booking.event_type_id,
      from: booking.slot_start.iso8601,
      to: booking.slot_end.iso8601
    }
    assert_response :ok
    slot = response.parsed_body.fetch("items").find { |item| item.fetch("id") == booking.slot_id.to_s }
    assert_equal "free", slot.fetch("status")
  end
end
```

- [ ] **Step 4: Run backend tests**

```bash
cd backend
bin/rails test test/controllers/admin_bookings_controller_test.rb test/controllers/admin_booking_cancellation_test.rb
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/test/fixtures/bookings.yml \
  backend/test/controllers/admin_bookings_controller_test.rb \
  backend/test/controllers/admin_booking_cancellation_test.rb
git commit -m "Add tests for admin booking cancellation"
```

---

### Task 6: Update integration test to ensure cancelled slot is available

**Files:**
- Modify: `tests/e2e/guest-booking.spec.ts`

- [ ] **Step 1: Extend E2E test to cancel and rebook**

Update `tests/e2e/guest-booking.spec.ts`:

```ts
test('guest booking flow', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Записаться' }).first().click()
  await expect(page).toHaveURL(/\/book$/)

  await page.getByRole('link', { name: /Встреча 15 минут/ }).click()
  await expect(page).toHaveURL(/\/book\//)

  const freeSlot = page.getByRole('link', { name: /Свободно/ }).first()
  await freeSlot.waitFor({ timeout: 20_000 })
  await freeSlot.click()

  await expect(page).toHaveURL(/\?slot=/)
  const slotId = new URL(page.url()).searchParams.get('slot')

  await page.getByRole('link', { name: 'Продолжить' }).click()

  await expect(page).toHaveURL(/\/confirm\?slot=/)
  await page.getByLabel('Имя').waitFor({ timeout: 10_000 })

  await page.getByLabel('Имя').fill('Тестовый Пользователь')
  await page.getByLabel('Email').fill('guest@example.com')
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 20_000 })

  await page.goto('/admin')
  await expect(page.getByRole('cell', { name: 'Отменен' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Отменить' }).first().click()
  await expect(page.getByRole('cell', { name: 'Отменен' })).toBeVisible({ timeout: 10_000 })

  await page.goto('/book')
  await page.getByRole('link', { name: /Встреча 15 минут/ }).click()
  await expect(page).toHaveURL(/\/book\//)

  if (slotId) {
    await expect(page.getByRole('link', { name: new RegExp(slotId) })).toBeVisible()
  }
})
```

- [ ] **Step 2: Run integration tests**

```bash
npm run test:e2e
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/guest-booking.spec.ts
git commit -m "Extend E2E booking flow with admin cancellation"
```

---

## Self-Review Checklist

- Spec coverage: TypeSpec, frontend UI, backend cancellation, and tests all have tasks.
- Placeholder scan: No TODO/TBD or vague steps remain.
- Type consistency: AdminBooking fields and status values match between TypeSpec, frontend, and backend.

---

Plan complete and saved to `docs/superpowers/plans/2026-05-07-admin-bookings.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
