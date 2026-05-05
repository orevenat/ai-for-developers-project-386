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

  await page.getByRole('link', { name: 'Продолжить' }).click()

  await expect(page).toHaveURL(/\/confirm\?slot=/)
  await page.getByLabel('Имя').waitFor({ timeout: 10_000 })

  await page.getByLabel('Имя').fill('Тестовый Пользователь')
  await page.getByLabel('Email').fill('guest@example.com')
  await page.getByRole('button', { name: 'Подтвердить запись' }).click()

  await expect(page.getByText('Бронирование подтверждено')).toBeVisible({ timeout: 20_000 })
})
