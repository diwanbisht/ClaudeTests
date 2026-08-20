---
name: allure-annotations
description: Use this skill to enhance Playwright tests with Allure annotations such as tags, severity, features, stories, steps, and attachments. Helps in improving reporting, traceability, and debugging.
---

# Allure Annotations Skill

## 🎯 Purpose
Enhance Playwright tests with rich Allure reporting metadata for better visibility, debugging, and traceability.

---

## ✅ Standard Annotations

### 1. Feature / Module Mapping
```ts
import { allure } from 'allure-playwright';

test('valid credentials logs the user in', async ({ loginPage }) => {
  allure.feature('Login Module');
  allure.story('Valid Login');
  ...
});
```

### 2. Severity
```ts
allure.severity('critical'); // blocker | critical | normal | minor | trivial
```
Use `critical`/`blocker` for auth, payment, or data-integrity paths; `normal`
(the default) for standard functional coverage; `minor`/`trivial` for
cosmetic or edge-case checks.

### 3. Tags / Labels
```ts
allure.tag('smoke');
allure.tag('regression');
allure.label('owner', 'qa-team');
```

### 4. Steps
Wrap logically distinct actions in `allure.step` so the report shows a
timeline, not just a pass/fail leaf:
```ts
await allure.step('Fill login form', async () => {
  await loginPage.login(username, password);
});

await allure.step('Assert error message', async () => {
  await expect(loginPage.getFlashMessage()).resolves.toContain('invalid');
});
```
This repo already has an equivalent timed-step helper for app logs —
`src/utils/logger.ts`'s `step(name, fn)` — the two aren't mutually exclusive:
`logger.step` writes to `logs/test-run.log`, `allure.step` writes to the
Allure report. Use `allure.step` for anything you want visible in the HTML
report.

### 5. Attachments
```ts
allure.attachment('Request payload', JSON.stringify(payload, null, 2), 'application/json');
```
Playwright's own `trace`/`video`/`screenshot` capture (configured in
`playwright.config.ts` as `retain-on-failure`/`only-on-failure`) is already
wired into `allure-results/` via the `allure-playwright` reporter — you don't
need to manually attach those; use `allure.attachment` for extra debugging
context (API payloads, computed values) the automatic capture doesn't cover.

---

## Rules
- Every test should set `allure.feature(...)` and `allure.story(...)` at
  minimum — this is what makes the Allure report navigable by module instead
  of a flat list of test names.
- Don't over-annotate: only wrap steps that represent a meaningful phase of
  the test, not every single locator interaction.
