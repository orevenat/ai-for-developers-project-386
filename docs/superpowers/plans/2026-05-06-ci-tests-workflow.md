# CI Tests Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions workflow that runs frontend tests, backend tests, frontend lint, then E2E tests in that order.

**Architecture:** Create a dedicated CI workflow under `.github/workflows/` that checks out the repo, installs JS and Ruby dependencies, runs frontend lint and tests, runs backend tests, and finally executes Playwright E2E tests. Use job-level services only if required; otherwise, rely on the Playwright config to boot web servers. Keep the existing Hexlet workflow untouched.

**Tech Stack:** GitHub Actions, Node.js (npm), Ruby (bundle), Rails (minitest), Playwright.

---

## File Structure

- Modify: `.github/workflows/` (add a new workflow file; do not modify `hexlet-check.yml`)
- Read: `package.json` (root scripts), `frontend/package.json`, `backend/config/ci.rb`, `playwright.config.ts`

---

### Task 1: Define CI workflow skeleton

**Files:**
- Create: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Add workflow header and triggers**

```yaml
name: ci-tests

on:
  push:
    branches:
      - '**'
  pull_request:
```

- [ ] **Step 2: Add a single job with Linux runner**

```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
```

- [ ] **Step 3: Add checkout step**

```yaml
    steps:
      - uses: actions/checkout@v4
```

- [ ] **Step 4: Add Node and Ruby setup steps**

```yaml
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '4.0.3'
          bundler-cache: true
          working-directory: backend
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: add workflow skeleton for tests"
```

---

### Task 2: Install JS dependencies for root and frontend

**Files:**
- Modify: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Install root npm dependencies**

```yaml
      - name: Install root dependencies
        run: npm ci
```

- [ ] **Step 2: Install frontend npm dependencies**

```yaml
      - name: Install frontend dependencies
        run: npm ci
        working-directory: frontend
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: install root and frontend deps"
```

---

### Task 3: Run frontend lint and tests

**Files:**
- Modify: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Run frontend lint**

```yaml
      - name: Lint frontend
        run: npm --prefix frontend run lint
```

- [ ] **Step 2: Run frontend tests (if script exists)**

```yaml
      - name: Test frontend
        run: npm --prefix frontend run test
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: add frontend lint and test steps"
```

---

### Task 4: Run backend tests (and optional checks)

**Files:**
- Modify: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Run backend tests using Rails**

```yaml
      - name: Test backend
        run: bin/rails test
        working-directory: backend
```

- [ ] **Step 2: (Optional) run backend lint/security if desired**

```yaml
      - name: Lint backend (Rubocop)
        run: bin/rubocop
        working-directory: backend
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: add backend test steps"
```

---

### Task 5: Run E2E tests last

**Files:**
- Modify: `.github/workflows/ci-tests.yml`

- [ ] **Step 1: Install Playwright browsers**

```yaml
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
```

- [ ] **Step 2: Run E2E tests**

```yaml
      - name: Run E2E tests
        run: npm run test:e2e
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci-tests.yml
git commit -m "ci: run e2e tests at the end"
```

---

### Task 6: Validate workflow locally (smoke steps)

**Files:**
- No code changes (verification)

- [ ] **Step 1: Validate frontend lint**

Run: `npm --prefix frontend run lint`
Expected: exit code 0

- [ ] **Step 2: Validate backend tests**

Run: `cd backend && bin/rails test`
Expected: all tests passing

- [ ] **Step 3: Validate E2E tests**

Run: `npm run test:e2e`
Expected: Playwright tests passing

---

## Self-Review

1. **Spec coverage:** Workflow runs frontend lint, frontend tests, backend tests, and E2E tests in that order. Added new workflow file without touching `hexlet-check.yml`.
2. **Placeholder scan:** No TODOs; commands and YAML provided.
3. **Type consistency:** N/A for workflow-only changes.
