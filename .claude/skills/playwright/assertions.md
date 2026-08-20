---
name: playwright-assertions
description: Use when writing or reviewing assertions in a Playwright spec —
             choosing the right matcher, avoiding flaky waits, and keeping
             assertions in the spec (not the Page Object).
---

# Assertions

## When to use
Use this when:
- Writing a new spec and deciding how to verify expected UI state
- Reviewing an existing spec for flaky or redundant assertions

---

## Where assertions live

Assertions belong in the spec, not the Page Object. A Page Object method
returns state (`getFlashMessage()`, `getRowCount()`); the spec decides what
that state should be:

```ts
test('shows an error for invalid credentials', async ({ loginPage }) => {
  await loginPage.login('bad-user', 'bad-pass');
  await expect(loginPage.getFlashMessage()).resolves.toContain('invalid');
});
```

## Preferred matchers

- `toBeVisible()` / `toBeHidden()` over checking a raw boolean
- `toBeChecked()` for checkboxes/radios (see `CheckboxPage.ts` usage)
- `toContainText()` / `toHaveText()` over manual string comparison after
  reading `.textContent()`
- `toHaveCount()` on a locator over reading an array length

## Eventually-consistent state

Prefer `expect.poll(...)` over a manual retry loop or `waitForTimeout` when
asserting on state that updates asynchronously (e.g. a row count after an API
call finishes) — see `src/tests/automatedTests/example.spec.ts` for the
pattern used in this repo:

```ts
await expect.poll(async () => webTablePage.getRowCount()).toBe(4);
```

## What NOT to do

- Never use `page.waitForTimeout(...)` to "wait for" a condition an assertion
  should express instead.
- Avoid asserting on incidental state (e.g. exact pixel counts, unrelated
  attributes) that isn't part of what the test case is actually verifying —
  extra assertions increase flakiness surface without adding coverage.
- Don't duplicate an assertion the Page Object method already implies (e.g.
  don't re-assert that `login()` navigated somewhere if the next assertion
  already depends on that navigation having happened).
