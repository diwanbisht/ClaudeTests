---
name: generate-tests-from-jira
description: Wraps the Jira -> Xray -> Claude -> Playwright pipeline for interactive use. Invoke when the user gives a Jira issue key and asks for test coverage, or asks to (re)generate a Playwright spec from a requirement.
---

# Generate Tests From Jira

## 🎯 Purpose

Turn a Jira requirement into: Xray manual test cases (linked back to the
requirement) and a runnable Playwright spec — end to end, then verify the
spec actually passes before handing it back.

## When to use

Use this skill when:
- The user gives a Jira issue key (e.g. `PROJ-123`) and asks for test
  coverage / automation
- The user asks to regenerate or repair a spec under `src/tests/generated/`
  from its source Jira issue

---

## Procedure

### 1. Run the generation pipeline
```bash
npm run generate:tests -- <ISSUE_KEY> [XRAY_PROJECT_KEY]
```
This drives `src/cli/generate-tests.ts`, which:
1. Fetches the issue (`src/integrations/jira/fetchRequirements.ts`) and
   flattens its Atlassian Document Format description to plain text. If
   `JIRA_ACCEPTANCE_CRITERIA_FIELD` isn't set in `.env`, acceptance criteria
   will come back blank — flag that to the user rather than silently
   proceeding on a description-only requirement.
2. Asks Claude to turn the requirement into structured manual test cases
   (`src/integrations/claude/generateManualTestCases.ts`).
3. Creates each as an Xray "Manual" Test issue and links it back to the
   requirement (`src/integrations/jira/xrayClient.ts`).
4. Asks Claude to turn the same manual test cases into a Playwright spec
   (`src/integrations/claude/generatePlaywrightTest.ts`), giving it the full
   contents of `src/pages/*.ts` as context so it reuses existing Page Object
   methods instead of inventing raw locators.
5. Writes the spec to `src/tests/generated/<issue-key>.spec.ts`. The
   `PostToolUse` hook (`.claude/hooks/lint-generated.js`) auto-runs
   `eslint --fix`/`prettier --write` on it as soon as it's written.

### 2. Review the generated spec
Read `src/tests/generated/<issue-key>.spec.ts` before running it:
- It should import `test`/`expect` from `../../fixtures/test-fixtures`, not
  `@playwright/test`.
- It should call Page Object methods, not raw `page.locator(...)`.
- Any `TODO` comment Claude left (e.g. "no existing method covers this step")
  means generation found a gap in Page Object coverage.

### 3. Handle TODOs
For every unresolved `TODO`, hand off to the `pom-builder` subagent
(`.claude/agents/pom-builder.md`) to add the missing Page Object method(s) —
don't fill the gap with an inline locator in the generated spec yourself.
Once `pom-builder` reports back, remove the corresponding `TODO`s and update
the spec to call the new method.

### 4. Run and fix
```bash
npx playwright test src/tests/generated/<issue-key>.spec.ts --project=chromium
```
Fix any failures the same way `test-generator` would (see
`.claude/agents/test-generator.md`) — reuse existing Page Object methods,
escalate to `pom-builder` for real coverage gaps, don't paper over a failure
with a longer timeout.

### 5. Report back
Summarize for the user: which Xray Test issues were created (and their
keys), the path to the generated spec, and pass/fail status of the run.

---

## Rules
- Never hand-write the manual-test-case or spec content yourself as a
  shortcut — the point of this skill is the full traceable chain
  (Jira requirement -> Xray test -> Playwright spec); skipping Xray creation
  breaks that traceability.
- Don't hand-edit a file under `src/tests/generated/` casually — the linting
  hook expects to own that formatting pass, and re-running this pipeline for
  the same issue key will overwrite manual edits anyway.
- If Jira/Xray/Anthropic credentials are missing, `src/utils/config.ts`'s
  `config.jira.*`/`config.xray.*`/`config.claude.*` will throw only when
  actually called — surface that error message to the user rather than
  retrying blindly.
