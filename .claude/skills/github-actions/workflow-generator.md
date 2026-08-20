---
name: github-workflow-generator
description: Use when generating or updating GitHub Actions workflows for Playwright automation frameworks. Supports CI pipelines, sharding, Allure reporting, artifact uploads, and failure handling.
---

# ⚙️ GitHub Actions Workflow Generator

## 🎯 Purpose
Generate production-ready CI/CD workflows for:
- Playwright test execution
- Parallel (sharded) runs
- Allure reporting
- Artifact uploads
- Debugging & traceability

This repo already has a working example at `.github/workflows/tests.yml` —
treat any new/changed workflow as an extension of that file's shape, not a
from-scratch design.

---

## 🧩 Supported Capabilities

- Playwright test execution against `npm run test:shard` (`playwright test
  --shard=N/4`)
- A MySQL service container per shard job (test data comes from
  `src/db/*` — see the `test-data` skill)
- 4-way sharding matrix, mirroring `docker/docker-compose.yml`'s 4
  `tests-shard-N` services
- Allure report generation and merging across shards
- Artifact upload (see `artifact-upload.md`)

---

## 🏗️ Standard Workflow Structure

### 1. Trigger
```yaml
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
```

### 2. Sharded test job
```yaml
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        shard: [1, 2, 3, 4]
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: ${{ secrets.MYSQL_ROOT_PASSWORD }}
          MYSQL_DATABASE: test_automation
        ports: [ '3306:3306' ]
        options: >-
          --health-cmd="mysqladmin ping" --health-interval=10s
          --health-timeout=5s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run db:seed
      - run: npx playwright test --shard=${{ matrix.shard }}/4
        env:
          BASE_URL: ${{ vars.BASE_URL }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-results-${{ matrix.shard }}
          path: allure-results/
```

### 3. Merge/report job
A separate job, gated with `needs: test` and `if: always()`, downloads every
shard's `allure-results-*` artifact into one directory before running
`allure generate` — see `.github/workflows/tests.yml` for the exact
download/merge steps already implemented.

---

## Rules
- Always install dependencies with `npm ci`, never `npm install`, in CI —
  reproducible installs matter more than picking up a newer transitive
  version mid-pipeline.
- `forbidOnly: !!process.env.CI` and `retries: ... process.env.CI ? 2 : 1`
  are already set in `playwright.config.ts` — don't override retry/only
  behavior per-workflow-step.
- Only `ANTHROPIC_API_KEY` (used by the Jira→Xray→Claude pipeline) and Jira/
  Xray credentials need to be secrets; `BASE_URL` and MySQL non-credential
  config can be plain `vars`/env.
