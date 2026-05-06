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
