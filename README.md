### Hexlet tests and linter status:
[![Actions Status](https://github.com/orevenat/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/orevenat/ai-for-developers-project-386/actions)

## TypeSpec Specification

TypeSpec files are located in `tsp/`:

- `tsp/main.tsp` - service definition and OpenAPI emitter settings
- `tsp/models.tsp` - domain models (Owner, EventType, Slot, Booking)
- `tsp/params.tsp` - shared parameters
- `tsp/errors.tsp` - error responses
- `tsp/routes.tsp` - API routes for admin and guest flows

## Docker

### Build

```bash
docker build -t app .
```

### Run

```bash
docker run -e PORT=10000 -p 10000:10000 app
```

### Tests in Docker

```bash
docker build --target test -t app-test .
docker run --rm app-test
```

## Render

Используется Dockerfile в корне. Необходимые переменные окружения:

- `PORT` (порт для входящего трафика)
- `RAILS_ENV=production`
- `RAILS_MASTER_KEY` (задается в Render)

Healthcheck: `/up`.
