# Docker + Nginx + Render Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** собрать единый Docker-образ, который запускает фронтенд через nginx и Rails API, использовать `PORT` из env, запускать тесты в контейнере и обновить CI + Render деплой.

**Architecture:** корневой `Dockerfile` с multi-stage, runtime содержит nginx + Rails. nginx слушает `PORT`, проксирует `/api` и `/up` на Rails, который слушает `INTERNAL_PORT` (по умолчанию 3000). Тестовый stage содержит Ruby+Node+Playwright и выполняет все тесты.

**Tech Stack:** Docker, nginx, Rails, Vite, Playwright, GitHub Actions, Render

---

### Task 1: Перевести API на префикс `/api` и настроить фронтенд для прокси

**Files:**
- Modify: `backend/config/routes.rb`
- Modify: `frontend/src/lib/api/client.ts`
- Modify: `frontend/vite.config.ts`
- Modify: `playwright.config.ts`

- [ ] **Step 1: Обновить API-роуты под `/api`**

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  scope :api do
    scope module: :guest do
      resources :event_types, path: "event-types", param: :event_type_id, only: %i[index show]
      resources :slots, only: %i[index]
      resources :bookings, only: %i[create]
    end

    namespace :admin do
      resources :event_types, path: "event-types", param: :event_type_id, only: %i[index show create]
      resources :bookings, only: [] do
        collection do
          get :upcoming
        end
      end
      resources :schedule, only: %i[index]
      resource :settings, only: %i[show update]
    end
  end
end
```

- [ ] **Step 2: Изменить дефолтный API base URL на `/api`**

```ts
const DEFAULT_BASE_URL = '/api'

const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
```

- [ ] **Step 3: Добавить proxy для `/api` в Vite dev server**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
```

- [ ] **Step 4: Обновить env для Playwright webServer**

```ts
{
  command: 'VITE_API_BASE_URL=/api npm --prefix frontend run dev -- --host --port 5173',
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: webServerTimeout,
},
```

- [ ] **Step 5: Прогнать быстрый локальный smoke test**

Run: `npm --prefix frontend run dev`
Expected: фронт открывается, API запросы идут на `http://localhost:3000/api` через proxy.

- [ ] **Step 6: Commit**

```bash
git add backend/config/routes.rb frontend/src/lib/api/client.ts frontend/vite.config.ts playwright.config.ts
git commit -m "feat: scope api routes and use /api base url"
```

---

### Task 2: Добавить nginx template и docker-start скрипт

**Files:**
- Create: `backend/config/nginx.conf.template`
- Create: `backend/bin/docker-start`
- Modify: `backend/bin/docker-entrypoint`

- [ ] **Step 1: Добавить nginx template**

```nginx
server {
  listen ${PORT};
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  access_log /dev/stdout;
  error_log /dev/stderr;

  location = /up {
    proxy_pass http://127.0.0.1:${INTERNAL_PORT};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:${INTERNAL_PORT};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

- [ ] **Step 2: Создать `backend/bin/docker-start`**

```bash
#!/bin/bash -e

PORT=${PORT:-3000}
INTERNAL_PORT=${INTERNAL_PORT:-3000}

envsubst '${PORT} ${INTERNAL_PORT}' \
  < ./config/nginx.conf.template \
  > /etc/nginx/conf.d/default.conf

PORT="${INTERNAL_PORT}" ./bin/rails server -b 0.0.0.0 -p "${INTERNAL_PORT}" &

exec nginx -g 'daemon off;'
```

- [ ] **Step 3: Обновить `backend/bin/docker-entrypoint`**

```bash
#!/bin/bash -e

if [ "${@: -1:1}" == "./bin/docker-start" ]; then
  ./bin/rails db:prepare
fi

if [ "${@: -2:1}" == "./bin/rails" ] && [ "${@: -1:1}" == "server" ]; then
  ./bin/rails db:prepare
fi

exec "${@}"
```

- [ ] **Step 4: Сделать скрипт исполняемым**

Run: `chmod +x backend/bin/docker-start`
Expected: файл исполняемый

- [ ] **Step 5: Commit**

```bash
git add backend/config/nginx.conf.template backend/bin/docker-start backend/bin/docker-entrypoint
git commit -m "feat: add nginx template and docker start script"
```

---

### Task 3: Добавить корневой Dockerfile с runtime и test stage

**Files:**
- Create: `Dockerfile`

- [ ] **Step 1: Создать Dockerfile**

```Dockerfile
# syntax=docker/dockerfile:1

ARG RUBY_VERSION=4.0.3
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

FROM ruby:${RUBY_VERSION}-slim AS backend-build
ENV BUNDLE_DEPLOYMENT="1" \
  BUNDLE_PATH="/usr/local/bundle" \
  BUNDLE_WITHOUT="development"

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

WORKDIR /app/backend
COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install
COPY backend ./

FROM ruby:${RUBY_VERSION}-slim AS runtime
ENV RAILS_ENV="production" \
  BUNDLE_DEPLOYMENT="1" \
  BUNDLE_PATH="/usr/local/bundle" \
  BUNDLE_WITHOUT="development"

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y nginx gettext-base libjemalloc2 libvips sqlite3 && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

WORKDIR /app/backend
COPY --from=backend-build /usr/local/bundle /usr/local/bundle
COPY --from=backend-build /app/backend /app/backend
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

ENTRYPOINT ["./bin/docker-entrypoint"]
CMD ["./bin/docker-start"]

FROM ruby:${RUBY_VERSION}-slim AS test
ENV RAILS_ENV="test"

RUN apt-get update -qq && \
  apt-get install --no-install-recommends -y curl gnupg build-essential git libyaml-dev pkg-config libvips sqlite3 && \
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - && \
  apt-get install --no-install-recommends -y nodejs && \
  rm -rf /var/lib/apt/lists /var/cache/apt/archives

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY backend ./backend
WORKDIR /app/backend
COPY backend/Gemfile backend/Gemfile.lock ./
RUN bundle install

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./

WORKDIR /app
COPY playwright.config.ts ./
COPY tests ./tests

RUN npx playwright install --with-deps

CMD ["bash", "-lc", "cd backend && bin/rails db:prepare && bin/rails test && cd /app/frontend && npm run test && cd /app && npm run test:e2e"]
```

- [ ] **Step 2: Локально проверить сборку runtime**

Run: `docker build -t app .`
Expected: образ собирается без ошибок

- [ ] **Step 3: Commit**

```bash
git add Dockerfile
git commit -m "feat: add root dockerfile with runtime and test stages"
```

---

### Task 4: Обновить CI для запуска тестов в Docker

**Files:**
- Modify: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Заменить шаги установки на Docker build/run**

```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build test image
        run: docker build --target test -t app-test .

      - name: Run tests in container
        run: docker run --rm -e CI=1 app-test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: run tests inside docker container"
```

---

### Task 5: Добавить Render конфигурацию

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Создать render.yaml**

```yaml
services:
  - type: web
    name: ai-for-developers-project-386
    env: docker
    plan: free
    dockerfilePath: ./Dockerfile
    healthCheckPath: /up
    envVars:
      - key: RAILS_ENV
        value: production
      - key: RAILS_MASTER_KEY
        sync: false
```

- [ ] **Step 2: Commit**

```bash
git add render.yaml
git commit -m "chore: add render deployment config"
```

---

### Task 6: Обновить README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Добавить Docker build/run инструкции**

```md
## Docker

### Build

```bash
docker build -t app .
```

### Run

```bash
docker run -e PORT=10000 -p 10000:10000 app
```
```

- [ ] **Step 2: Добавить инструкции для тестов**

```md
### Tests in Docker

```bash
docker build --target test -t app-test .
docker run --rm app-test
```
```

- [ ] **Step 3: Добавить Render раздел**

```md
## Render

Используется Dockerfile в корне. Необходимые переменные окружения:

- `RAILS_ENV=production`
- `RAILS_MASTER_KEY` (задается в Render)

Healthcheck: `/up`.
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add docker and render instructions"
```

---

## Self-Review

- Покрыты все требования: единый Dockerfile, автостарт, `PORT`, тесты в Docker, CI в Docker, Render деплой.
- Нет заглушек и неопределенных инструкций.
- Изменения согласованы по именам и путям.
