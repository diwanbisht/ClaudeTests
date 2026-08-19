# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

An AI-driven QA automation framework: TypeScript + Playwright tests built on
a Page Object Model, with a pipeline that turns Jira requirements into Xray
manual test cases and Playwright specs using Claude, plus MySQL-backed test
data, Allure reporting, and Docker/GitHub Actions CI with sharded parallel
execution.

## Commands

```bash
npm install                        # install deps
cp .env.example .env               # fill in Jira/Xray/Anthropic/MySQL credentials

npm test                           # run the full Playwright suite (all projects)
npx playwright test src/tests/example.spec.ts   # run a single spec file
npx playwright test -g "valid credentials"       # run tests matching a title
npm run test:headed                # run with a visible browser
npm run test:debug                 # run with Playwright Inspector
npm run test:shard                 # example: --shard=1/4 (used by CI/Docker)

npm run generate:tests -- PROJ-123 [XRAY_PROJECT_KEY]   # Jira -> Xray -> Playwright spec pipeline
npm run report:allure              # generate + open the Allure HTML report from allure-results/
npm run db:seed                    # create/populate the test_users table
npm run db:cleanup                 # truncate test data tables

npm run lint / lint:fix            # eslint
npm run format                     # prettier
npm run typecheck                  # tsc --noEmit

docker compose -f docker/docker-compose.yml up --abort-on-container-exit   # 4-way sharded run + MySQL, locally
```

## Architecture

### Page Object Model + fixtures

- `src/pages/BasePage.ts` — shared `goto`/`waitForLoad`/`title`; every page
  object extends it.
- `src/pages/*.ts` — one class per page/flow (see `LoginPage.ts`). Public
  methods are user actions (`login`) or state getters (`getFlashMessage`),
  never raw locator accessors — locators stay private to the class.
- `src/fixtures/test-fixtures.ts` — the *only* place specs should import
  `test`/`expect` from. It extends Playwright's base `test` with page-object
  fixtures (`loginPage`) and a lazy `db` fixture (`getPool()` from
  `src/db/connection.ts`) so a spec only opens a MySQL connection if it
  actually requests the `db` fixture. Also logs test start/finish via
  `src/utils/logger.ts`.
- `src/tests/*.spec.ts` — hand-written specs. `src/tests/generated/` is
  reserved for AI-generated specs (see pipeline below) — don't hand-edit
  files there without re-running lint, since the generation hook expects to
  own that formatting pass.

### Jira → Xray → Claude → Playwright pipeline

`src/cli/generate-tests.ts` (invoked as `npm run generate:tests -- <ISSUE_KEY>`)
orchestrates the full chain:

1. `src/integrations/jira/fetchRequirements.ts` pulls the issue via the Jira
   Cloud REST v3 client (`jiraClient.ts`) and flattens its Atlassian Document
   Format description into plain text. The "acceptance criteria" custom
   field ID is instance-specific — set `JIRA_ACCEPTANCE_CRITERIA_FIELD` in
   `.env` or it's left blank.
2. `src/integrations/claude/generateManualTestCases.ts` asks Claude
   (`claudeClient.ts`, via `@anthropic-ai/sdk`) to turn the requirement into
   structured manual test cases (JSON: summary + steps).
3. `src/integrations/jira/xrayClient.ts` authenticates against Xray Cloud
   and creates each test case as an Xray "Manual" Test issue
   (`createXrayManualTest`), then links it back to the source requirement
   via a standard Jira issue link (`linkTestToRequirement`).
4. `src/integrations/claude/generatePlaywrightTest.ts` asks Claude to turn
   the same manual test cases into a Playwright spec, passing it the full
   contents of `src/pages/*.ts` as context so it reuses existing Page Object
   methods instead of inventing raw locators.
5. The spec is written to `src/tests/generated/<issue-key>.spec.ts`.

The same pipeline is exposed inside Claude Code as the
`generate-tests-from-jira` skill (`.claude/skills/generate-tests-from-jira/`),
which additionally reviews/runs the generated spec and hands unresolved
`TODO`s to the `pom-builder` subagent.

### MySQL test data

`src/db/connection.ts` holds a single lazily-created `mysql2/promise` pool
(`getPool()`). `src/db/queries/testData.ts` has typed query helpers
(`getTestUserByRole`, `insertTestUser`). `src/db/seed.ts` /
`src/db/cleanup.ts` are standalone scripts (`npm run db:seed` /
`db:cleanup`) — not wired into `globalSetup` by default, since not every
suite needs seeded data; call them explicitly in CI/Docker before the run.

### Reporting, logging, video/trace capture

- `playwright.config.ts` sets `video: 'retain-on-failure'`,
  `trace: 'retain-on-failure'`, `screenshot: 'only-on-failure'`, and reports
  via `allure-playwright` (`allure-results/`) plus the built-in HTML
  reporter. `npm run report:allure` turns `allure-results/` into a viewable
  report.
- `src/utils/logger.ts` is a winston logger (console + `logs/test-run.log`)
  with a `step(name, fn)` helper for timed, named step logging inside
  page-object methods or specs.

### Docker / CI sharding

- `docker/Dockerfile` builds on the official `mcr.microsoft.com/playwright`
  image.
- `docker/docker-compose.yml` defines a `mysql` service plus four
  `tests-shard-N` services (`--shard=N/4` each), all writing to the same
  bind-mounted `allure-results/`/`test-results/` — run all four concurrently
  with `docker compose up --abort-on-container-exit`.
- `.github/workflows/tests.yml` mirrors this with a 4-way GitHub Actions
  matrix (a MySQL service container per job), uploads each shard's
  `allure-results/` as an artifact, then a `report` job downloads and merges
  them into one combined Allure report artifact.

## Claude Code integration

- **Skill**: `.claude/skills/generate-tests-from-jira/SKILL.md` — wraps the
  `generate:tests` pipeline for interactive use; invoke it when the user
  gives a Jira issue key and asks for test coverage.
- **Subagents**: `.claude/agents/test-generator.md` (writes/repairs specs in
  `src/tests/generated/`, always reusing existing Page Object methods first)
  `.claude/agents/pom-builder.md` (creates/extends `src/pages/*.ts` when
  no existing method covers a needed UI step), and
  `.claude/agents/root-cause-analyzer.md` (reads `allure-results/`,
  `test-results/*/error-context.md`, and failure screenshots after a run and
  writes `test-results/failure-summary.md`; invoke it whenever tests fail,
  before handing off to `pom-builder`/`test-generator` for the actual fix).
  `test-generator` should hand off to `pom-builder` rather than inventing
  raw locators inline.
- **Hook**: `.claude/settings.json` runs a `PostToolUse` hook
  (`.claude/hooks/lint-generated.js`) after any Write/Edit that touches a
  file under `src/tests/generated/`, auto-running `eslint --fix` and
  `prettier --write` on it.
- **MCP**: `.mcp.json` declares example Atlassian and MySQL MCP server
  entries (credentials pulled from the same env vars as `.env`) — verify the
  exact server packages/endpoints your org uses before relying on them, the
  entries here are illustrative starting points, not verified pins.

## Environment variables

See `.env.example`. `src/utils/config.ts` is the single place these are
read: `config.jira.*`, `config.xray.*`, `config.claude.*` are functions that
throw only when actually called (so importing the module doesn't require
every credential to be set — e.g. running `npm test` doesn't need
`ANTHROPIC_API_KEY`); `config.mysql.*` and `config.baseUrl` have defaults
and don't throw.
