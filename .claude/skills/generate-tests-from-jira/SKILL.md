---
name: generate-tests-from-jira
description: Generate manual Xray test cases and a Playwright spec from a Jira requirement key (e.g. "PROJ-123"). Use when the user asks to turn a Jira story/requirement into tests, or references a Jira issue key while asking for test coverage.
---

# Generate Tests From Jira

Turns a Jira requirement into manual Xray test cases and an automated Playwright
spec, reusing this repo's existing Page Object Model.

## When to use

The user gives a Jira issue key (e.g. `PROJ-123`) and asks for test cases,
test automation, or coverage for it.

## Steps

1. Confirm the Jira issue key (and Xray project key, if it differs from the
   issue key's project prefix) with the user if not explicit.
2. Run the orchestrator script, which does the full pipeline (fetch
   requirement → Claude manual test cases → push to Xray → generate
   Playwright spec):
   ```
   npm run generate:tests -- <ISSUE_KEY> [XRAY_PROJECT_KEY]
   ```
3. Open the newly written file in `src/tests/generated/<issue-key>.spec.ts`
   and review it:
   - Confirm it imports `test`/`expect` from `../fixtures/test-fixtures`.
   - Confirm it reuses existing Page Object methods (see `src/pages/`)
     instead of raw locators where a suitable method already exists.
   - Resolve any `TODO` comments the generation left for steps that had no
     matching Page Object method — either add the method to the relevant
     Page Object class, or hand off to the `pom-builder` subagent.
4. Run `npm run lint:fix` and `npx playwright test src/tests/generated/<issue-key>.spec.ts`
   to confirm the generated spec is syntactically valid and passing (or
   report failures back to the user rather than silently leaving a broken
   spec in the repo).
5. Report back: the Xray test key(s) created, the spec file path, and
   whether it passed.

## Notes

- Requires `JIRA_*`, `XRAY_*`, and `ANTHROPIC_API_KEY` env vars to be set
  (see `.env.example`).
- Prefer delegating to the `test-generator` subagent for the review/repair
  step in 3–4 above when the generated spec needs non-trivial fixing.
