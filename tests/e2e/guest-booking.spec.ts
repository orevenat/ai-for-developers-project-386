import { test, expect } from '@playwright/test'

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
    await page.goto(`/book/event-15?slot=${slotId}`)
    await expect(page).toHaveURL(new RegExp(`\\?slot=${slotId}`))
  }
})
