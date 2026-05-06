# E2E Admin Bookings Test Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the e2e guest booking flow test resilient to pre-existing cancelled bookings by scoping assertions to the booking created in the test.

**Architecture:** Update the Playwright test to create a unique guest name/email, then locate the corresponding admin table row and assert status within that row only. This keeps admin checks focused on the test booking and avoids global status assumptions.

**Tech Stack:** Playwright, TypeScript

---

### Task 1: Update guest booking test to scope admin checks

**Files:**
- Modify: `tests/e2e/guest-booking.spec.ts`

- [ ] **Step 1: Add unique marker for guest name and email**

```ts
const marker = `e2e-${Date.now()}`
const guestName = `Тестовый Пользователь ${marker}`
const guestEmail = `guest+${marker}@example.com`
```

Insert near the start of the test, before filling the form.

- [ ] **Step 2: Use the unique guest data in the booking form**

```ts
await page.getByLabel('Имя').fill(guestName)
await page.getByLabel('Email').fill(guestEmail)
```

- [ ] **Step 3: Scope admin table row to the booking created by the test**

```ts
const bookingRow = page.getByRole('row', { name: new RegExp(`${marker}`) })
await expect(bookingRow).toBeVisible({ timeout: 10_000 })
```

- [ ] **Step 4: Assert status only within the scoped row**

```ts
await expect(bookingRow.getByRole('cell', { name: 'Отменен' })).toHaveCount(0)
```

- [ ] **Step 5: Cancel using the scoped row and confirm status change**

```ts
await bookingRow.getByRole('button', { name: 'Отменить' }).click()
await expect(bookingRow.getByRole('cell', { name: 'Отменен' })).toBeVisible({ timeout: 10_000 })
```

- [ ] **Step 6: Run the e2e test**

Run: `npm run test:e2e`
Expected: PASS for "guest booking flow" even with existing cancelled bookings.

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/guest-booking.spec.ts docs/superpowers/specs/2026-05-07-e2e-admin-bookings-test-stability-design.md docs/superpowers/plans/2026-05-07-e2e-admin-bookings-test-stability.md
git commit -m "fix: scope admin booking e2e checks"
```

---

## Self-Review

**Spec coverage:** The plan scopes assertions to the test booking via a unique marker and row-level selectors, matching the spec's approach, selectors, and risk mitigations. Validation includes running `npm run test:e2e`.

**Placeholder scan:** No TBD/TODO placeholders; steps include concrete code and commands.

**Type consistency:** Uses existing Playwright API and matches test file language and selectors.
