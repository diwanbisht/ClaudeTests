---
name: allure-report-config
description: Use when configuring Allure reporting behavior — output location, attachment rules, and how failures (screenshot/video/trace) reach the report.
---

# Allure Report Configuration

## Where it's configured
`playwright.config.ts` already wires the reporter:
```ts
reporter: [
  ['list'],
  ['allure-playwright', { resultsDir: 'allure-results', detail: true }],
  ['html', { open: 'never', outputFolder: 'playwright-report' }],
],
use: {
  trace: 'retain-on-failure',
  video: 'retain-on-failure',
  screenshot: 'only-on-failure',
},
```
Don't duplicate this setup per-spec — any new reporting behavior should be
either a config change here or an `allure.step`/`allure.attachment` call
inside the test (see `annotations.md`).

## Turning raw results into a report
`npm run report:allure` runs:
```bash
allure generate allure-results --clean -o allure-report && allure open allure-report
```
`allure-results/` is the raw per-test JSON + attachments the reporter writes
during a run; `allure-report/` is the generated static HTML site. Regenerate
after any local run before opening the report — a stale `allure-report/`
reflects an older run's `allure-results/`.

## Failure capture (screenshot / video / trace)
Because `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`, and
`trace: 'retain-on-failure'` are already set globally, you don't need to
manually capture or attach these — `allure-playwright` picks up Playwright's
own attachments and includes them in each failed test's report entry
automatically. Don't write a custom `test.afterEach` to re-attach
video/screenshot; that duplicates what the reporter already does and can
attach the same file twice.

## CI sharding and merged reports
Each of the 4 GitHub Actions shard jobs (`.github/workflows/tests.yml`) and
each `docker/docker-compose.yml` shard service writes to the same
`allure-results/` directory (bind-mounted in Docker; uploaded as a
per-shard artifact in CI). A separate `report` job downloads all shard
artifacts and merges them into one combined `allure-report/` — don't try to
generate the report inside each shard job individually, since a single
shard's `allure-results/` is only a partial run.

## AI-based failure insight
For actually diagnosing *why* a test in the report failed (not just
capturing the evidence), use the `root-cause-analyzer` subagent
(`.claude/agents/root-cause-analyzer.md`) — it reads `allure-results/`,
`test-results/*/error-context.md`, and failure screenshots, and writes
`test-results/failure-summary.md`. This skill covers report *configuration*;
that subagent covers report *interpretation*.
