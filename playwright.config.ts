import { defineConfig } from '@playwright/test'

const webServerTimeout = 120_000

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command:
        'RAILS_ENV=test SKIP_EVENT_TYPES=1 bundle exec rails db:reset && RAILS_ENV=test SKIP_EVENT_TYPES=1 bundle exec rails db:migrate && RAILS_ENV=test SKIP_EVENT_TYPES=1 bundle exec rails db:seed && RAILS_ENV=test SKIP_EVENT_TYPES=1 bundle exec rails s -p 3000',
      cwd: 'backend',
      url: 'http://localhost:3000/up',
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeout,
    },
    {
      command: 'VITE_API_BASE_URL=/api npm --prefix frontend run dev -- --host --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: webServerTimeout,
    },
  ],
  globalSetup: './tests/e2e/global-setup.ts',
})
