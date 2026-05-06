import { test, expect } from '@playwright/test'

test('guest booking flow', async ({ page }) => {
  const marker = `e2e-${Date.now()}`
  const guestName = `Тестовый Пользователь ${marker}`
  const guestEmail = `guest+${marker}@example.com`

  await page.goto('/')
  await page.getByRole('link', { name: 'Записаться' }).first().click()
  await expect(page).toHaveURL(/\/book$/)

  await page.getByRole('link', { name: /Встреча 15 минут/ }).first().click()
  await expect(page).toHaveURL(/\/book\//)

  const slotsResponse = await page.request.get('/api/slots?event_type_id=event-15')
  expect(slotsResponse.ok()).toBeTruthy()
  const slotsPayload: { items: { id: string; status: string; start: string }[] } =
    await slotsResponse.json()
  const now = Date.now()
  const futureSlot = slotsPayload.items.find(
    (slot) => slot.status === 'free' && new Date(slot.start).getTime() > now,
  )
  if (!futureSlot) {
    throw new Error('No future free slot found for event-15')
  }

  await page.goto(`/book/event-15?slot=${futureSlot.id}`)
  await expect(page).toHaveURL(new RegExp(`\\?slot=${futureSlot.id}`))
  const slotId = String(futureSlot.id)

  await expect(page.getByRole('link', { name: 'Продолжить' })).toBeEnabled()
  await page.getByRole('link', { name: 'Продолжить' }).click()

  await expect(page).toHaveURL(/\/confirm\?slot=/)
  await page.getByLabel('Имя').waitFor({ timeout: 10_000 })

  await page.getByLabel('Имя').fill(guestName)
  await page.getByLabel('Email').fill(guestEmail)
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 20_000 })

  await page.goto('/admin')
  const bookingRow = page.locator('tbody tr', { hasText: marker }).first()
  await expect(bookingRow).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(guestEmail)).toBeVisible({ timeout: 10_000 })
  await expect(bookingRow.getByRole('cell', { name: 'Отменен' })).toHaveCount(0)
  await bookingRow.getByRole('button', { name: 'Отменить' }).click()
  await expect(bookingRow.getByRole('cell', { name: 'Отменен' })).toBeVisible({ timeout: 10_000 })

  await page.goto('/book')
  await page.getByRole('link', { name: /Встреча 15 минут/ }).first().click()
  await expect(page).toHaveURL(/\/book\//)

  if (slotId) {
    await page.goto(`/book/event-15?slot=${slotId}`)
    await expect(page).toHaveURL(new RegExp(`\\?slot=${slotId}`))
  }
})
