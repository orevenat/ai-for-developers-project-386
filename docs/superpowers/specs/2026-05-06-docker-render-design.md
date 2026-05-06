# Docker + Nginx + Render Design Spec

**Goal:** упаковать приложение в Docker так, чтобы запуск был одинаковым везде, CI и локальные тесты шли в контейнере, а деплой на Render работал с публичным URL.

## Architecture

- Один Dockerfile с multi-stage.
- Финальный runtime контейнер включает nginx (для раздачи фронтенда) и Rails (для API).
- nginx слушает порт 80 внутри контейнера и:
  - раздает собранный фронтенд из `frontend/dist`.
  - проксирует API-запросы на Rails по `http://127.0.0.1:$PORT`.
- Rails запускается автоматически и слушает `PORT` из переменной окружения.

## API Path Strategy

Выбираем явный префикс `/api` для всех API-эндпоинтов.

- Frontend использует `VITE_API_BASE_URL` по умолчанию равный `/api`.
- Rails маршруты переезжают под `/api` (например: `/api/event-types`, `/api/bookings`, `/api/admin/...`).
- Это позволяет nginx однозначно разделять статические маршруты SPA и API.

## Dockerfile Stages

1. **frontend-build**
   - Node LTS
   - `npm ci` в `frontend`
   - `npm run build`

2. **backend-build**
   - Ruby slim
   - `bundle install` в `backend`
   - копирование исходников Rails

3. **runtime**
   - базовый Ruby slim + nginx
   - копирование `frontend/dist` в директорию nginx (например `/usr/share/nginx/html`)
   - копирование Rails app из `backend-build`
   - `ENTRYPOINT` -> `backend/bin/docker-entrypoint`
   - `CMD` запускает Rails server с `-b 0.0.0.0 -p $PORT`

4. **test**
   - Ruby + Node + зависимости Playwright
   - запуск тестов backend, frontend, E2E
   - используется в CI и локально

## Nginx Config

- `location /` -> статика фронтенда
- `location /api/` -> proxy_pass на `http://127.0.0.1:$PORT`
- SPA fallback: `try_files $uri /index.html` для клиентских роутов

## CI Strategy

- GitHub Actions строит `Dockerfile` с `--target test`
- Контейнер выполняет все тесты
- Нет установки Ruby/Node на runner

## Render Deployment

- Render использует корневой Dockerfile
- Устанавливаются переменные окружения:
  - `PORT` (обязателен)
  - `RAILS_ENV=production`
  - `RAILS_MASTER_KEY` (обязателен, задается в Render)
- Healthcheck `/up`
- После деплоя Render предоставляет публичный URL

## Test Strategy

- Локально: `docker build --target test -t app-test .` и `docker run --rm app-test`
- В CI: те же команды

## Docs Updates

- Добавить в README:
  - Docker build/run инструкции
  - Docker test инструкции
  - Render deploy + env vars + healthcheck
